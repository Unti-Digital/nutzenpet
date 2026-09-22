<?php
/**
 * Plugin Name: Nutzen Switch
 * Description: Central de diagnóstico, módulos e conexões da plataforma NutzenPet.
 * Version: 0.2.0
 * Author: NutzenPet
 * Requires at least: 6.7
 * Requires PHP: 8.1
 * WC requires at least: 9.0
 * WC tested up to: 11.1
 * Text Domain: nutzen-switch
 */

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Utilities\FeaturesUtil;

final class Nutzen_Switch_Plugin {
	private const VERSION = '0.2.0';
	private const OPTION = 'nutzen_switch_settings';
	private const LOG    = 'nutzen_switch_log';

	/** @var string[] */
	private const MODULES = array( 'fields', 'affiliates', 'subscriptions' );

	public static function bootstrap(): void {
		register_activation_hook( __FILE__, array( __CLASS__, 'activate' ) );
		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_compatibility' ) );
		add_filter( 'nutzen_module_enabled', array( __CLASS__, 'module_enabled' ), 10, 2 );
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'admin_assets' ) );
		add_action( 'wp_dashboard_setup', array( __CLASS__, 'dashboard_widgets' ) );
		add_action( 'login_enqueue_scripts', array( __CLASS__, 'login_assets' ) );
		add_filter( 'admin_footer_text', array( __CLASS__, 'admin_footer' ) );
		add_filter( 'login_headertext', static fn(): string => 'NutzenPet' );
		add_filter( 'login_headerurl', static fn(): string => home_url( '/' ) );
		add_action( 'save_post_product', array( __CLASS__, 'product_changed' ), 30, 3 );
		add_action( 'edited_product_cat', array( __CLASS__, 'category_changed' ) );
		add_action( 'created_product_cat', array( __CLASS__, 'category_changed' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
	}

	public static function activate(): void {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$table   = $wpdb->prefix . 'nutzen_sessions';
		$charset = $wpdb->get_charset_collate();
		dbDelta( "CREATE TABLE {$table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			token_hash char(64) NOT NULL,
			expires_at datetime NOT NULL,
			created_at datetime NOT NULL,
			last_used_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY token_hash (token_hash),
			KEY user_expiry (user_id,expires_at)
		) {$charset};" );
	}

	public static function declare_compatibility(): void {
		if ( class_exists( FeaturesUtil::class ) ) {
			FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
		}
	}

	/** @param mixed $enabled */
	public static function module_enabled( $enabled, string $module ): bool {
		if ( ! in_array( $module, self::MODULES, true ) ) {
			return (bool) $enabled;
		}
		$settings = self::settings();
		return ! isset( $settings[ 'module_' . $module ] ) || '0' !== $settings[ 'module_' . $module ];
	}

	/** @return array<string, string> */
	private static function settings(): array {
		$defaults = array(
			'module_fields'        => '1',
			'module_affiliates'    => '1',
			'module_subscriptions' => '1',
			'frontend_url'         => 'http://localhost:3000',
			'wordpress_url'        => home_url(),
			'webhook_secret'       => '',
		);
		return wp_parse_args( (array) get_option( self::OPTION, array() ), $defaults );
	}

	public static function register_settings(): void {
		register_setting(
			'nutzen_switch',
			self::OPTION,
			array( 'type' => 'array', 'sanitize_callback' => array( __CLASS__, 'sanitize_settings' ), 'default' => self::settings() )
		);
	}

	/** @param mixed $input @return array<string, string> */
	public static function sanitize_settings( $input ): array {
		$current = self::settings();
		$input   = is_array( $input ) ? $input : array();
		$output  = array(
			'module_fields'        => isset( $input['module_fields'] ) ? '1' : '0',
			'module_affiliates'    => isset( $input['module_affiliates'] ) ? '1' : '0',
			'module_subscriptions' => isset( $input['module_subscriptions'] ) ? '1' : '0',
			'frontend_url'         => esc_url_raw( (string) ( $input['frontend_url'] ?? '' ) ),
			'wordpress_url'        => esc_url_raw( (string) ( $input['wordpress_url'] ?? home_url() ) ),
			'webhook_secret'       => $current['webhook_secret'],
		);
		if ( ! empty( $input['webhook_secret'] ) ) {
			$output['webhook_secret'] = sanitize_text_field( $input['webhook_secret'] );
		}
		return $output;
	}

	public static function admin_menu(): void {
		add_menu_page( 'Nutzen Switch', 'Nutzen Switch', 'manage_woocommerce', 'nutzen-switch', array( __CLASS__, 'render_page' ), 'dashicons-pets', 56 );
	}

	public static function admin_assets(): void {
		wp_enqueue_style( 'nutzen-admin', plugins_url( 'assets/admin.css', __FILE__ ), array(), self::VERSION );
	}

	public static function login_assets(): void {
		wp_enqueue_style( 'nutzen-admin-login', plugins_url( 'assets/admin.css', __FILE__ ), array(), self::VERSION );
	}

	public static function admin_footer(): string {
		return '<span class="nutzen-admin-footer"><strong>NutzenPet</strong> · gestão integrada com WooCommerce</span>';
	}

	public static function dashboard_widgets(): void {
		if ( current_user_can( 'manage_woocommerce' ) ) {
			wp_add_dashboard_widget( 'nutzen_overview', 'Visão geral NutzenPet', array( __CLASS__, 'render_dashboard_widget' ) );
		}
	}

	/** @return array<string, int> */
	private static function dashboard_stats(): array {
		global $wpdb;
		$product_counts = wp_count_posts( 'product' );
		$user_counts    = count_users();
		$order_query    = function_exists( 'wc_get_orders' ) ? wc_get_orders( array( 'limit' => 1, 'paginate' => true, 'return' => 'ids' ) ) : null;
		$affiliate_table = $wpdb->prefix . 'nutzen_affiliates';
		$subscription_table = $wpdb->prefix . 'nutzen_subscriptions';
		$affiliates = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $affiliate_table ) ) === $affiliate_table ? (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$affiliate_table} WHERE status='approved'" ) : 0;
		$subscriptions = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $subscription_table ) ) === $subscription_table ? (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$subscription_table} WHERE status IN ('active','paused','pending_gateway')" ) : 0;
		return array(
			'products'      => (int) ( $product_counts->publish ?? 0 ),
			'orders'        => is_object( $order_query ) && isset( $order_query->total ) ? (int) $order_query->total : 0,
			'customers'     => (int) ( $user_counts['avail_roles']['customer'] ?? 0 ),
			'affiliates'    => $affiliates,
			'subscriptions' => $subscriptions,
		);
	}

	public static function render_dashboard_widget(): void {
		$stats = self::dashboard_stats();
		?>
		<div class="nutzen-dashboard-widget">
			<p class="nutzen-kicker">OPERAÇÃO DA LOJA</p>
			<div class="nutzen-stat-grid">
				<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=product' ) ); ?>"><strong><?php echo (int) $stats['products']; ?></strong><span>Produtos</span></a>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=wc-orders' ) ); ?>"><strong><?php echo (int) $stats['orders']; ?></strong><span>Pedidos</span></a>
				<a href="<?php echo esc_url( admin_url( 'users.php?role=customer' ) ); ?>"><strong><?php echo (int) $stats['customers']; ?></strong><span>Clientes</span></a>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=nutzen-affiliates' ) ); ?>"><strong><?php echo (int) $stats['affiliates']; ?></strong><span>Afiliados</span></a>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=nutzen-subscriptions' ) ); ?>"><strong><?php echo (int) $stats['subscriptions']; ?></strong><span>Assinaturas</span></a>
			</div>
			<div class="nutzen-quick-actions"><a class="button button-primary" href="<?php echo esc_url( admin_url( 'post-new.php?post_type=product' ) ); ?>">Adicionar produto</a><a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=nutzen-switch' ) ); ?>">Abrir central Nutzen</a></div>
		</div>
		<?php
	}

	public static function render_page(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		$settings = self::settings();
		$plugins  = array(
			'Campos personalizados' => 'nutzen-fields/nutzen-fields.php',
			'Afiliados'              => 'nutzen-affiliates/nutzen-affiliates.php',
			'Assinaturas'            => 'nutzen-subscriptions/nutzen-subscriptions.php',
		);
		?>
		<div class="wrap nutzen-admin">
			<section class="nutzen-admin-hero"><div><span class="nutzen-kicker">CENTRAL HEADLESS</span><h1>Nutzen Switch</h1><p>Produtos, clientes e integrações reunidos em uma visão clara da operação.</p></div><a class="button button-primary" href="<?php echo esc_url( $settings['frontend_url'] ); ?>" target="_blank" rel="noopener noreferrer">Abrir loja</a></section>
			<?php $stats = self::dashboard_stats(); ?>
			<div class="nutzen-stat-grid nutzen-stat-grid--page"><a href="<?php echo esc_url( admin_url( 'edit.php?post_type=product' ) ); ?>"><strong><?php echo (int) $stats['products']; ?></strong><span>Produtos publicados</span></a><a href="<?php echo esc_url( admin_url( 'admin.php?page=wc-orders' ) ); ?>"><strong><?php echo (int) $stats['orders']; ?></strong><span>Pedidos</span></a><a href="<?php echo esc_url( admin_url( 'users.php?role=customer' ) ); ?>"><strong><?php echo (int) $stats['customers']; ?></strong><span>Clientes</span></a><a href="<?php echo esc_url( admin_url( 'admin.php?page=nutzen-affiliates' ) ); ?>"><strong><?php echo (int) $stats['affiliates']; ?></strong><span>Afiliados ativos</span></a><a href="<?php echo esc_url( admin_url( 'admin.php?page=nutzen-subscriptions' ) ); ?>"><strong><?php echo (int) $stats['subscriptions']; ?></strong><span>Assinaturas</span></a></div>
			<h2>Saúde dos módulos</h2>
			<table class="widefat striped nutzen-status-table">
				<thead><tr><th>Módulo</th><th>Plugin</th><th>Estado</th></tr></thead>
				<tbody>
				<?php foreach ( $plugins as $label => $plugin ) : ?>
					<tr><td><?php echo esc_html( $label ); ?></td><td><code><?php echo esc_html( $plugin ); ?></code></td><td><?php echo is_plugin_active( $plugin ) ? '<strong style="color:#16803c">Ativo</strong>' : '<strong style="color:#b32d2e">Inativo</strong>'; ?></td></tr>
				<?php endforeach; ?>
				<tr><td>REST API</td><td><code><?php echo esc_html( rest_url() ); ?></code></td><td><strong style="color:#16803c">Disponível</strong></td></tr>
				<tr><td>WooCommerce</td><td><?php echo defined( 'WC_VERSION' ) ? esc_html( WC_VERSION ) : '—'; ?></td><td><?php echo class_exists( 'WooCommerce' ) ? '<strong style="color:#16803c">Disponível</strong>' : '<strong style="color:#b32d2e">Ausente</strong>'; ?></td></tr>
			</tbody>
			</table>
			<form action="options.php" method="post" class="nutzen-settings-card">
				<?php settings_fields( 'nutzen_switch' ); ?>
				<h2>Módulos</h2>
				<?php foreach ( self::MODULES as $module ) : $key = 'module_' . $module; ?>
					<label style="display:block;margin:10px 0"><input type="checkbox" name="<?php echo esc_attr( self::OPTION . '[' . $key . ']' ); ?>" value="1" <?php checked( '1', $settings[ $key ] ); ?>> <?php echo esc_html( ucfirst( $module ) ); ?></label>
				<?php endforeach; ?>
				<h2>Conexões</h2>
				<table class="form-table">
					<tr><th><label for="nutzen_frontend_url">URL do frontend</label></th><td><input class="regular-text" type="url" id="nutzen_frontend_url" name="<?php echo esc_attr( self::OPTION ); ?>[frontend_url]" value="<?php echo esc_attr( $settings['frontend_url'] ); ?>"></td></tr>
					<tr><th><label for="nutzen_wordpress_url">URL do WordPress</label></th><td><input class="regular-text" type="url" id="nutzen_wordpress_url" name="<?php echo esc_attr( self::OPTION ); ?>[wordpress_url]" value="<?php echo esc_attr( $settings['wordpress_url'] ); ?>"></td></tr>
					<tr><th><label for="nutzen_webhook_secret">Segredo do webhook</label></th><td><input class="regular-text" type="password" autocomplete="new-password" id="nutzen_webhook_secret" name="<?php echo esc_attr( self::OPTION ); ?>[webhook_secret]" value="" placeholder="<?php echo $settings['webhook_secret'] ? esc_attr__( 'Configurado — deixe vazio para manter', 'nutzen-switch' ) : ''; ?>"><p class="description">O valor existente nunca é exibido.</p></td></tr>
				</table>
				<?php submit_button(); ?>
			</form>
			<h2>Logs técnicos recentes</h2>
			<pre class="nutzen-log"><?php echo esc_html( implode( "\n", (array) get_option( self::LOG, array() ) ) ); ?></pre>
		</div>
		<?php
	}

	public static function product_changed( int $post_id, WP_Post $post, bool $update ): void {
		if ( wp_is_post_revision( $post_id ) || 'product' !== $post->post_type || ! $update ) {
			return;
		}
		self::send_webhook( array( 'woocommerce-products', 'woocommerce-product-' . $post->post_name ) );
	}

	public static function category_changed(): void {
		self::send_webhook( array( 'woocommerce-products', 'woocommerce-categories' ) );
	}

	/** @param string[] $tags */
	private static function send_webhook( array $tags ): void {
		$settings = self::settings();
		if ( empty( $settings['frontend_url'] ) || empty( $settings['webhook_secret'] ) ) {
			return;
		}
		$payload   = wp_json_encode( array( 'tags' => array_values( array_unique( $tags ) ), 'sent_at' => gmdate( 'c' ) ) );
		$signature = hash_hmac( 'sha256', $payload, $settings['webhook_secret'] );
		$response  = wp_remote_post(
			trailingslashit( $settings['frontend_url'] ) . 'api/revalidate',
			array( 'timeout' => 8, 'headers' => array( 'Content-Type' => 'application/json', 'X-Nutzen-Signature' => $signature ), 'body' => $payload )
		);
		$status = is_wp_error( $response ) ? $response->get_error_message() : 'HTTP ' . wp_remote_retrieve_response_code( $response );
		self::log( 'Webhook de catálogo: ' . $status );
	}

	private static function log( string $message ): void {
		$logs   = (array) get_option( self::LOG, array() );
		$logs[] = '[' . gmdate( 'Y-m-d H:i:s' ) . ' UTC] ' . sanitize_text_field( $message );
		update_option( self::LOG, array_slice( $logs, -50 ), false );
	}

	private static function sessions_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'nutzen_sessions';
	}

	public static function register_rest_routes(): void {
		register_rest_route( 'nutzen/v1', '/auth/register', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'rest_register' ), 'permission_callback' => '__return_true' ) );
		register_rest_route( 'nutzen/v1', '/auth/login', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'rest_login' ), 'permission_callback' => '__return_true' ) );
		register_rest_route( 'nutzen/v1', '/auth/logout', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'rest_logout' ), 'permission_callback' => array( __CLASS__, 'authenticate_request' ) ) );
		register_rest_route( 'nutzen/v1', '/auth/me', array( 'methods' => array( 'GET', 'POST' ), 'callback' => array( __CLASS__, 'rest_me' ), 'permission_callback' => array( __CLASS__, 'authenticate_request' ) ) );
		register_rest_route( 'nutzen/v1', '/customer/orders', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'rest_orders' ), 'permission_callback' => array( __CLASS__, 'authenticate_request' ) ) );
		register_rest_route( 'nutzen/v1', '/customer/addresses', array( 'methods' => array( 'GET', 'POST' ), 'callback' => array( __CLASS__, 'rest_addresses' ), 'permission_callback' => array( __CLASS__, 'authenticate_request' ) ) );
	}

	private static function rate_limit( string $bucket, int $limit = 8, int $window = 900 ): bool {
		$key   = 'nutzen_rate_' . md5( $bucket );
		$count = (int) get_transient( $key );
		if ( $count >= $limit ) {
			return false;
		}
		set_transient( $key, $count + 1, $window );
		return true;
	}

	private static function issue_session( int $user_id ): array {
		global $wpdb;
		$token   = bin2hex( random_bytes( 32 ) );
		$now     = current_time( 'mysql', true );
		$expires = gmdate( 'Y-m-d H:i:s', time() + DAY_IN_SECONDS * 30 );
		$wpdb->query( $wpdb->prepare( 'DELETE FROM ' . self::sessions_table() . ' WHERE expires_at < %s', $now ) );
		$wpdb->insert( self::sessions_table(), array( 'user_id' => $user_id, 'token_hash' => hash( 'sha256', $token ), 'expires_at' => $expires, 'created_at' => $now, 'last_used_at' => $now ), array( '%d', '%s', '%s', '%s', '%s' ) );
		return array( 'token' => $token, 'expires_at' => $expires );
	}

	private static function bearer_token(): string {
		$header = isset( $_SERVER['HTTP_AUTHORIZATION'] ) ? trim( (string) $_SERVER['HTTP_AUTHORIZATION'] ) : '';
		return preg_match( '/^Bearer\s+([a-f0-9]{64})$/i', $header, $matches ) ? strtolower( $matches[1] ) : '';
	}

	public static function authenticate_request() {
		global $wpdb;
		$token = self::bearer_token();
		if ( ! $token ) {
			return new WP_Error( 'nutzen_auth_required', 'Autenticação necessária.', array( 'status' => 401 ) );
		}
		$now = current_time( 'mysql', true );
		$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::sessions_table() . ' WHERE token_hash=%s AND expires_at>%s', hash( 'sha256', $token ), $now ), ARRAY_A );
		if ( ! is_array( $row ) || ! get_user_by( 'id', (int) $row['user_id'] ) ) {
			return new WP_Error( 'nutzen_invalid_session', 'Sessão inválida ou expirada.', array( 'status' => 401 ) );
		}
		$wpdb->update( self::sessions_table(), array( 'last_used_at' => $now ), array( 'id' => $row['id'] ), array( '%s' ), array( '%d' ) );
		wp_set_current_user( (int) $row['user_id'] );
		return true;
	}

	public static function rest_register( WP_REST_Request $request ) {
		if ( 'yes' !== get_option( 'woocommerce_enable_myaccount_registration', 'no' ) ) {
			return new WP_Error( 'nutzen_registration_disabled', 'O cadastro de clientes está desativado.', array( 'status' => 403 ) );
		}
		$email    = sanitize_email( (string) $request->get_param( 'email' ) );
		$password = (string) $request->get_param( 'password' );
		$name     = sanitize_text_field( (string) $request->get_param( 'name' ) );
		$ip       = sanitize_text_field( (string) ( $_SERVER['REMOTE_ADDR'] ?? '' ) );
		if ( ! self::rate_limit( 'register:' . $ip ) ) return new WP_Error( 'nutzen_rate_limited', 'Muitas tentativas. Aguarde alguns minutos.', array( 'status' => 429 ) );
		if ( ! is_email( $email ) || strlen( $password ) < 10 || email_exists( $email ) ) return new WP_Error( 'nutzen_invalid_registration', 'Revise o e-mail e use uma senha com pelo menos 10 caracteres.', array( 'status' => 400 ) );
		$user_id = wc_create_new_customer( $email, '', $password, array( 'first_name' => $name, 'display_name' => $name ) );
		if ( is_wp_error( $user_id ) ) return $user_id;
		return new WP_REST_Response( array_merge( array( 'user' => self::user_payload( (int) $user_id ) ), self::issue_session( (int) $user_id ) ), 201 );
	}

	public static function rest_login( WP_REST_Request $request ) {
		$login    = sanitize_text_field( (string) $request->get_param( 'email' ) );
		$password = (string) $request->get_param( 'password' );
		$ip       = sanitize_text_field( (string) ( $_SERVER['REMOTE_ADDR'] ?? '' ) );
		if ( ! self::rate_limit( 'login:' . $ip . ':' . strtolower( $login ) ) ) return new WP_Error( 'nutzen_rate_limited', 'Muitas tentativas. Aguarde alguns minutos.', array( 'status' => 429 ) );
		$user = wp_authenticate( $login, $password );
		if ( is_wp_error( $user ) ) return new WP_Error( 'nutzen_invalid_credentials', 'E-mail ou senha inválidos.', array( 'status' => 401 ) );
		return new WP_REST_Response( array_merge( array( 'user' => self::user_payload( $user->ID ) ), self::issue_session( $user->ID ) ) );
	}

	public static function rest_logout(): WP_REST_Response {
		global $wpdb;
		$wpdb->delete( self::sessions_table(), array( 'token_hash' => hash( 'sha256', self::bearer_token() ) ), array( '%s' ) );
		return new WP_REST_Response( array( 'logged_out' => true ) );
	}

	/** @return array<string, mixed> */
	private static function user_payload( int $user_id ): array {
		$user = get_user_by( 'id', $user_id );
		return array( 'id' => $user_id, 'email' => $user->user_email, 'name' => $user->display_name, 'first_name' => get_user_meta( $user_id, 'first_name', true ), 'last_name' => get_user_meta( $user_id, 'last_name', true ) );
	}

	public static function rest_me( WP_REST_Request $request ): WP_REST_Response {
		if ( 'POST' === $request->get_method() ) {
			$first_name = sanitize_text_field( (string) $request->get_param( 'first_name' ) );
			$last_name  = sanitize_text_field( (string) $request->get_param( 'last_name' ) );
			update_user_meta( get_current_user_id(), 'first_name', $first_name );
			update_user_meta( get_current_user_id(), 'last_name', $last_name );
			wp_update_user( array( 'ID' => get_current_user_id(), 'display_name' => trim( $first_name . ' ' . $last_name ) ) );
		}
		return new WP_REST_Response( array( 'user' => self::user_payload( get_current_user_id() ) ) );
	}

	public static function rest_orders(): WP_REST_Response {
		$orders = wc_get_orders( array( 'customer_id' => get_current_user_id(), 'limit' => 50, 'orderby' => 'date', 'order' => 'DESC' ) );
		$items  = array_map( static function ( WC_Order $order ): array { return array( 'id' => $order->get_id(), 'number' => $order->get_order_number(), 'status' => $order->get_status(), 'date' => $order->get_date_created() ? $order->get_date_created()->date( DATE_ATOM ) : null, 'currency' => $order->get_currency(), 'total' => $order->get_total(), 'payment_method' => $order->get_payment_method_title() ); }, $orders );
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	public static function rest_addresses( WP_REST_Request $request ): WP_REST_Response {
		$user_id = get_current_user_id();
		$fields  = array( 'first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'email', 'phone' );
		if ( 'POST' === $request->get_method() ) {
			foreach ( array( 'billing', 'shipping' ) as $type ) {
				$data = $request->get_param( $type );
				if ( ! is_array( $data ) ) continue;
				foreach ( $fields as $field ) {
					if ( array_key_exists( $field, $data ) ) update_user_meta( $user_id, $type . '_' . $field, 'email' === $field ? sanitize_email( $data[ $field ] ) : sanitize_text_field( $data[ $field ] ) );
				}
			}
		}
		$output = array();
		foreach ( array( 'billing', 'shipping' ) as $type ) foreach ( $fields as $field ) $output[ $type ][ $field ] = (string) get_user_meta( $user_id, $type . '_' . $field, true );
		return new WP_REST_Response( $output );
	}
}

Nutzen_Switch_Plugin::bootstrap();
