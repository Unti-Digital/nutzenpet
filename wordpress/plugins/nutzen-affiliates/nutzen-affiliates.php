<?php
/**
 * Plugin Name: Nutzen Affiliates
 * Description: Afiliados e comissões por produto para a loja NutzenPet.
 * Version: 0.2.0
 * Author: NutzenPet
 * Requires at least: 6.7
 * Requires PHP: 8.1
 * WC requires at least: 9.0
 * WC tested up to: 11.1
 * Text Domain: nutzen-affiliates
 */

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Utilities\FeaturesUtil;

final class Nutzen_Affiliates_Plugin {
	private const VERSION = '0.2.0';
	private const OPTION  = 'nutzen_affiliates_settings';

	public static function bootstrap(): void {
		register_activation_hook( __FILE__, array( __CLASS__, 'activate' ) );
		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_compatibility' ) );
		add_action( 'init', array( __CLASS__, 'capture_referral' ) );
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ), 20 );
		add_action( 'admin_init', array( __CLASS__, 'handle_admin_actions' ) );
		add_action( 'woocommerce_product_options_general_product_data', array( __CLASS__, 'product_fields' ) );
		add_action( 'woocommerce_process_product_meta', array( __CLASS__, 'save_product_fields' ) );
		add_action( 'woocommerce_product_after_variable_attributes', array( __CLASS__, 'variation_fields' ), 10, 3 );
		add_action( 'woocommerce_save_product_variation', array( __CLASS__, 'save_variation_fields' ) );
		add_action( 'woocommerce_checkout_create_order', array( __CLASS__, 'attach_affiliate_to_order' ) );
		add_action( 'woocommerce_store_api_checkout_order_processed', array( __CLASS__, 'attach_affiliate_to_order' ) );
		add_action( 'woocommerce_order_status_changed', array( __CLASS__, 'order_status_changed' ), 10, 4 );
		add_action( 'woocommerce_order_refunded', array( __CLASS__, 'order_refunded' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	public static function declare_compatibility(): void {
		if ( class_exists( FeaturesUtil::class ) ) {
			FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
		}
	}

	private static function enabled(): bool {
		return (bool) apply_filters( 'nutzen_module_enabled', true, 'affiliates' );
	}

	public static function activate(): void {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$charset = $wpdb->get_charset_collate();
		$affiliate_table = $wpdb->prefix . 'nutzen_affiliates';
		$commission_table = $wpdb->prefix . 'nutzen_affiliate_commissions';
		dbDelta( "CREATE TABLE {$affiliate_table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			code varchar(80) NOT NULL,
			status varchar(20) NOT NULL DEFAULT 'pending',
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY user_id (user_id),
			UNIQUE KEY code (code),
			KEY status (status)
		) {$charset};" );
		dbDelta( "CREATE TABLE {$commission_table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			affiliate_id bigint(20) unsigned NOT NULL,
			order_id bigint(20) unsigned NOT NULL,
			order_item_id bigint(20) unsigned NOT NULL,
			product_id bigint(20) unsigned NOT NULL,
			variation_id bigint(20) unsigned NOT NULL DEFAULT 0,
			quantity decimal(18,4) NOT NULL DEFAULT 0,
			calculation_base decimal(18,4) NOT NULL DEFAULT 0,
			commission_type varchar(20) NOT NULL,
			commission_rate decimal(18,4) NOT NULL DEFAULT 0,
			commission_amount decimal(18,4) NOT NULL DEFAULT 0,
			status varchar(20) NOT NULL DEFAULT 'pending',
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY order_item (order_item_id),
			KEY affiliate_status (affiliate_id,status),
			KEY order_id (order_id)
		) {$charset};" );
		add_option( self::OPTION, self::default_settings(), '', false );
		update_option( 'nutzen_affiliates_db_version', self::VERSION, false );
	}

	/** @return array<string, mixed> */
	private static function default_settings(): array {
		return array(
			'public_registration' => false,
			'base'                => 'after_discounts',
			'include_taxes'       => false,
			'attribution_days'    => 30,
			'conflict'            => 'last_click',
			'reverse_refunds'     => true,
			'auto_approve'        => false,
		);
	}

	/** @return array<string, mixed> */
	private static function settings(): array {
		return wp_parse_args( (array) get_option( self::OPTION, array() ), self::default_settings() );
	}

	private static function affiliate_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'nutzen_affiliates';
	}

	private static function commission_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'nutzen_affiliate_commissions';
	}

	public static function capture_referral(): void {
		if ( ! self::enabled() || empty( $_GET['ref'] ) ) {
			return;
		}
		$code = sanitize_key( wp_unslash( $_GET['ref'] ) );
		if ( ! self::get_affiliate_by_code( $code ) ) {
			return;
		}
		$days = max( 1, min( 365, (int) self::settings()['attribution_days'] ) );
		setcookie( 'nutzen_ref', $code, array( 'expires' => time() + DAY_IN_SECONDS * $days, 'path' => COOKIEPATH ?: '/', 'domain' => COOKIE_DOMAIN, 'secure' => is_ssl(), 'httponly' => true, 'samesite' => 'Lax' ) );
		$_COOKIE['nutzen_ref'] = $code;
	}

	/** @return array<string, mixed>|null */
	private static function get_affiliate_by_code( string $code ): ?array {
		global $wpdb;
		$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::affiliate_table() . ' WHERE code = %s AND status = %s', $code, 'approved' ), ARRAY_A );
		return is_array( $row ) ? $row : null;
	}

	/** @return array<string, mixed>|null */
	private static function get_affiliate_by_user( int $user_id ): ?array {
		global $wpdb;
		$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::affiliate_table() . ' WHERE user_id = %d', $user_id ), ARRAY_A );
		return is_array( $row ) ? $row : null;
	}

	public static function attach_affiliate_to_order( WC_Order $order ): void {
		if ( ! self::enabled() || $order->get_meta( '_nutzen_affiliate_id', true ) || empty( $_COOKIE['nutzen_ref'] ) ) {
			return;
		}
		$affiliate = self::get_affiliate_by_code( sanitize_key( wp_unslash( $_COOKIE['nutzen_ref'] ) ) );
		if ( ! $affiliate ) {
			return;
		}
		$order->update_meta_data( '_nutzen_affiliate_id', (int) $affiliate['id'] );
		$order->update_meta_data( '_nutzen_affiliate_code', $affiliate['code'] );
		$order->save();
	}

	public static function product_fields(): void {
		if ( ! self::enabled() ) {
			return;
		}
		echo '<div class="options_group show_if_simple">';
		woocommerce_wp_checkbox( array( 'id' => '_nutzen_affiliate_enabled', 'label' => 'Habilitar comissão', 'description' => 'Este SKU pode gerar comissão.' ) );
		woocommerce_wp_select( array( 'id' => '_nutzen_affiliate_type', 'label' => 'Tipo de comissão', 'options' => array( 'percentage' => 'Percentual', 'fixed' => 'Valor fixo' ) ) );
		woocommerce_wp_text_input( array( 'id' => '_nutzen_affiliate_value', 'label' => 'Valor da comissão', 'type' => 'number', 'custom_attributes' => array( 'min' => '0', 'step' => '0.01' ) ) );
		echo '</div>';
	}

	public static function save_product_fields( int $product_id ): void {
		if ( ! current_user_can( 'edit_product', $product_id ) ) {
			return;
		}
		update_post_meta( $product_id, '_nutzen_affiliate_enabled', isset( $_POST['_nutzen_affiliate_enabled'] ) ? 'yes' : 'no' );
		$type = isset( $_POST['_nutzen_affiliate_type'] ) ? sanitize_key( wp_unslash( $_POST['_nutzen_affiliate_type'] ) ) : 'percentage';
		update_post_meta( $product_id, '_nutzen_affiliate_type', in_array( $type, array( 'percentage', 'fixed' ), true ) ? $type : 'percentage' );
		$value = isset( $_POST['_nutzen_affiliate_value'] ) ? wc_format_decimal( wp_unslash( $_POST['_nutzen_affiliate_value'] ) ) : '0';
		update_post_meta( $product_id, '_nutzen_affiliate_value', max( 0, (float) $value ) );
	}

	/** @param array<string, mixed> $variation_data */
	public static function variation_fields( int $loop, array $variation_data, WP_Post $variation ): void {
		woocommerce_wp_checkbox( array( 'id' => "_nutzen_affiliate_enabled_{$loop}", 'name' => "_nutzen_affiliate_enabled[{$loop}]", 'value' => get_post_meta( $variation->ID, '_nutzen_affiliate_enabled', true ), 'label' => 'Comissão Nutzen' ) );
		woocommerce_wp_select( array( 'id' => "_nutzen_affiliate_type_{$loop}", 'name' => "_nutzen_affiliate_type[{$loop}]", 'value' => get_post_meta( $variation->ID, '_nutzen_affiliate_type', true ), 'label' => 'Tipo', 'options' => array( 'percentage' => 'Percentual', 'fixed' => 'Valor fixo' ), 'wrapper_class' => 'form-row form-row-first' ) );
		woocommerce_wp_text_input( array( 'id' => "_nutzen_affiliate_value_{$loop}", 'name' => "_nutzen_affiliate_value[{$loop}]", 'value' => get_post_meta( $variation->ID, '_nutzen_affiliate_value', true ), 'label' => 'Valor', 'type' => 'number', 'wrapper_class' => 'form-row form-row-last', 'custom_attributes' => array( 'min' => '0', 'step' => '0.01' ) ) );
	}

	public static function save_variation_fields( int $variation_id, int $loop ): void {
		$enabled = isset( $_POST['_nutzen_affiliate_enabled'][ $loop ] ) ? 'yes' : 'no';
		$type    = isset( $_POST['_nutzen_affiliate_type'][ $loop ] ) ? sanitize_key( wp_unslash( $_POST['_nutzen_affiliate_type'][ $loop ] ) ) : 'percentage';
		$value   = isset( $_POST['_nutzen_affiliate_value'][ $loop ] ) ? wc_format_decimal( wp_unslash( $_POST['_nutzen_affiliate_value'][ $loop ] ) ) : '0';
		update_post_meta( $variation_id, '_nutzen_affiliate_enabled', $enabled );
		update_post_meta( $variation_id, '_nutzen_affiliate_type', in_array( $type, array( 'percentage', 'fixed' ), true ) ? $type : 'percentage' );
		update_post_meta( $variation_id, '_nutzen_affiliate_value', max( 0, (float) $value ) );
	}

	public static function order_status_changed( int $order_id, string $old_status, string $new_status, WC_Order $order ): void {
		if ( ! self::enabled() || ! in_array( $new_status, array( 'processing', 'completed' ), true ) ) {
			return;
		}
		self::record_commissions( $order );
	}

	public static function record_commissions( WC_Order $order ): void {
		global $wpdb;
		$affiliate_id = (int) $order->get_meta( '_nutzen_affiliate_id', true );
		if ( $affiliate_id <= 0 ) {
			return;
		}
		$settings = self::settings();
		foreach ( $order->get_items( 'line_item' ) as $item_id => $item ) {
			$variation_id = (int) $item->get_variation_id();
			$product_id   = (int) $item->get_product_id();
			$rule_id      = $variation_id > 0 ? $variation_id : $product_id;
			if ( 'yes' !== get_post_meta( $rule_id, '_nutzen_affiliate_enabled', true ) ) {
				continue;
			}
			$type = (string) get_post_meta( $rule_id, '_nutzen_affiliate_type', true );
			$rate = max( 0, (float) get_post_meta( $rule_id, '_nutzen_affiliate_value', true ) );
			if ( $rate <= 0 || ! in_array( $type, array( 'percentage', 'fixed' ), true ) ) {
				continue;
			}
			$base = 'before_discounts' === $settings['base'] ? (float) $item->get_subtotal() : (float) $item->get_total();
			if ( ! empty( $settings['include_taxes'] ) ) {
				$base += 'before_discounts' === $settings['base'] ? (float) $item->get_subtotal_tax() : (float) $item->get_total_tax();
			}
			$quantity   = max( 0, (float) $item->get_quantity() );
			$commission = self::calculate_commission( $base, $quantity, $type, $rate );
			$now        = current_time( 'mysql', true );
			$wpdb->query( $wpdb->prepare( 'INSERT IGNORE INTO ' . self::commission_table() . ' (affiliate_id,order_id,order_item_id,product_id,variation_id,quantity,calculation_base,commission_type,commission_rate,commission_amount,status,created_at,updated_at) VALUES (%d,%d,%d,%d,%d,%f,%f,%s,%f,%f,%s,%s,%s)', $affiliate_id, $order->get_id(), $item_id, $product_id, $variation_id, $quantity, $base, $type, $rate, $commission, 'pending', $now, $now ) );
		}
	}

	public static function calculate_commission( float $base, float $quantity, string $type, float $rate ): float {
		$amount = 'fixed' === $type ? $rate * $quantity : $base * ( $rate / 100 );
		return (float) wc_format_decimal( max( 0, $amount ), wc_get_price_decimals() );
	}

	public static function order_refunded( int $order_id ): void {
		global $wpdb;
		if ( empty( self::settings()['reverse_refunds'] ) ) {
			return;
		}
		$wpdb->update( self::commission_table(), array( 'status' => 'reversed', 'updated_at' => current_time( 'mysql', true ) ), array( 'order_id' => $order_id ), array( '%s', '%s' ), array( '%d' ) );
	}

	public static function register_routes(): void {
		register_rest_route( 'nutzen/v1', '/affiliate/me', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'rest_me' ), 'permission_callback' => array( __CLASS__, 'rest_permission' ) ) );
		register_rest_route( 'nutzen/v1', '/affiliate/commissions', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'rest_commissions' ), 'permission_callback' => array( __CLASS__, 'rest_permission' ), 'args' => array( 'page' => array( 'default' => 1, 'sanitize_callback' => 'absint' ) ) ) );
	}

	public static function rest_permission(): bool {
		if ( ! is_user_logged_in() && class_exists( 'Nutzen_Switch_Plugin' ) ) {
			Nutzen_Switch_Plugin::authenticate_request();
		}
		$affiliate = get_current_user_id() ? self::get_affiliate_by_user( get_current_user_id() ) : null;
		return self::enabled() && is_array( $affiliate ) && 'approved' === $affiliate['status'];
	}

	public static function rest_me(): WP_REST_Response {
		global $wpdb;
		$affiliate = self::get_affiliate_by_user( get_current_user_id() );
		$totals    = $wpdb->get_results( $wpdb->prepare( 'SELECT status, SUM(commission_amount) amount FROM ' . self::commission_table() . ' WHERE affiliate_id = %d GROUP BY status', $affiliate['id'] ), ARRAY_A );
		$metrics   = $wpdb->get_row( $wpdb->prepare( 'SELECT COUNT(*) commission_count, COUNT(DISTINCT order_id) sales_count, COALESCE(SUM(calculation_base),0) referred_total FROM ' . self::commission_table() . ' WHERE affiliate_id = %d AND status <> %s', $affiliate['id'], 'reversed' ), ARRAY_A );
		$switch    = wp_parse_args( (array) get_option( 'nutzen_switch_settings', array() ), array( 'frontend_url' => home_url( '/' ) ) );
		$frontend  = trailingslashit( esc_url_raw( (string) $switch['frontend_url'] ) ?: home_url( '/' ) );
		return new WP_REST_Response(
			array(
				'id'               => (int) $affiliate['id'],
				'code'             => $affiliate['code'],
				'status'           => $affiliate['status'],
				'link'             => add_query_arg( 'ref', $affiliate['code'], $frontend ),
				'balances'         => $totals,
				'sales_count'      => (int) ( $metrics['sales_count'] ?? 0 ),
				'commission_count' => (int) ( $metrics['commission_count'] ?? 0 ),
				'referred_total'   => (float) ( $metrics['referred_total'] ?? 0 ),
				'attribution_days' => max( 1, (int) self::settings()['attribution_days'] ),
			)
		);
	}

	public static function rest_commissions( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;
		$affiliate = self::get_affiliate_by_user( get_current_user_id() );
		$page      = max( 1, (int) $request['page'] );
		$rows      = $wpdb->get_results( $wpdb->prepare( 'SELECT id,order_id,product_id,variation_id,quantity,calculation_base,commission_type,commission_rate,commission_amount,status,created_at FROM ' . self::commission_table() . ' WHERE affiliate_id = %d ORDER BY id DESC LIMIT 50 OFFSET %d', $affiliate['id'], ( $page - 1 ) * 50 ), ARRAY_A );
		foreach ( $rows as &$row ) {
			$order   = wc_get_order( (int) $row['order_id'] );
			$product = wc_get_product( (int) ( $row['variation_id'] ?: $row['product_id'] ) );
			$row['order_number'] = $order ? $order->get_order_number() : (string) $row['order_id'];
			$row['product_name'] = $product ? $product->get_name() : 'Produto indisponível';
			$row['source'] = $order && $order->get_meta( '_nutzen_subscription_id', true ) ? 'Assinatura Nutzen Club' : 'Compra indicada';
		}
		return new WP_REST_Response( array( 'items' => $rows, 'page' => $page ) );
	}

	public static function admin_menu(): void {
		$parent = class_exists( 'Nutzen_Switch_Plugin' ) ? 'nutzen-switch' : 'woocommerce';
		add_submenu_page( $parent, 'Nutzen Afiliados', 'Afiliados', 'manage_woocommerce', 'nutzen-affiliates', array( __CLASS__, 'admin_page' ) );
	}

	public static function handle_admin_actions(): void {
		if ( ! isset( $_POST['nutzen_affiliate_action'] ) || ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		check_admin_referer( 'nutzen_affiliate_admin' );
		$user_id = isset( $_POST['user_id'] ) ? absint( $_POST['user_id'] ) : 0;
		$status  = isset( $_POST['status'] ) ? sanitize_key( wp_unslash( $_POST['status'] ) ) : 'pending';
		if ( ! get_user_by( 'id', $user_id ) || ! in_array( $status, array( 'pending', 'approved', 'suspended', 'rejected' ), true ) ) {
			return;
		}
		global $wpdb;
		$existing = self::get_affiliate_by_user( $user_id );
		$code     = $existing['code'] ?? 'nutzen-' . $user_id . '-' . wp_generate_password( 6, false, false );
		$now      = current_time( 'mysql', true );
		$wpdb->replace( self::affiliate_table(), array( 'id' => $existing['id'] ?? null, 'user_id' => $user_id, 'code' => sanitize_key( $code ), 'status' => $status, 'created_at' => $existing['created_at'] ?? $now, 'updated_at' => $now ), array( '%d', '%d', '%s', '%s', '%s', '%s' ) );
	}

	public static function admin_page(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) return;
		global $wpdb;
		$rows = $wpdb->get_results( 'SELECT a.*,u.user_email,u.display_name FROM ' . self::affiliate_table() . ' a LEFT JOIN ' . $wpdb->users . ' u ON u.ID=a.user_id ORDER BY a.id DESC LIMIT 100', ARRAY_A );
		?>
		<div class="wrap"><h1>Nutzen Afiliados</h1><p>Inscrições públicas permanecem desativadas. Cadastre e aprove manualmente usuários existentes.</p>
		<form method="post" style="background:#fff;padding:16px;max-width:700px"><?php wp_nonce_field( 'nutzen_affiliate_admin' ); ?><input type="hidden" name="nutzen_affiliate_action" value="save"><label>ID do usuário <input type="number" min="1" name="user_id" required></label> <label>Status <select name="status"><option value="pending">Pendente</option><option value="approved">Aprovado</option><option value="suspended">Suspenso</option><option value="rejected">Rejeitado</option></select></label> <?php submit_button( 'Salvar afiliado', 'primary', 'submit', false ); ?></form>
		<table class="widefat striped" style="margin-top:20px"><thead><tr><th>ID</th><th>Usuário</th><th>Código</th><th>Status</th><th>Criado</th></tr></thead><tbody><?php foreach ( $rows as $row ) : ?><tr><td><?php echo (int) $row['id']; ?></td><td><?php echo esc_html( $row['display_name'] . ' — ' . $row['user_email'] ); ?></td><td><code><?php echo esc_html( $row['code'] ); ?></code></td><td><?php echo esc_html( $row['status'] ); ?></td><td><?php echo esc_html( $row['created_at'] ); ?></td></tr><?php endforeach; ?></tbody></table></div>
		<?php
	}
}

Nutzen_Affiliates_Plugin::bootstrap();
