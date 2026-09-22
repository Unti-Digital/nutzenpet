<?php
/**
 * Plugin Name: Nutzen Subscriptions
 * Description: Estrutura de planos e assinaturas personalizadas NutzenPet.
 * Version: 0.2.0
 * Author: NutzenPet
 * Requires at least: 6.7
 * Requires PHP: 8.1
 * WC requires at least: 9.0
 * WC tested up to: 11.1
 * Text Domain: nutzen-subscriptions
 */

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Utilities\FeaturesUtil;

final class Nutzen_Subscriptions_Plugin {
	private const VERSION = '0.2.0';

	public static function bootstrap(): void {
		register_activation_hook( __FILE__, array( __CLASS__, 'activate' ) );
		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_compatibility' ) );
		add_action( 'init', array( __CLASS__, 'register_plan_type' ) );
		add_action( 'add_meta_boxes_nutzen_plan', array( __CLASS__, 'plan_meta_box' ) );
		add_action( 'save_post_nutzen_plan', array( __CLASS__, 'save_plan' ) );
		add_action( 'woocommerce_product_options_general_product_data', array( __CLASS__, 'product_fields' ) );
		add_action( 'woocommerce_process_product_meta', array( __CLASS__, 'save_product_fields' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ), 21 );
	}

	public static function declare_compatibility(): void {
		if ( class_exists( FeaturesUtil::class ) ) {
			FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
		}
	}

	private static function enabled(): bool {
		return (bool) apply_filters( 'nutzen_module_enabled', true, 'subscriptions' );
	}

	private static function subscriptions_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'nutzen_subscriptions';
	}

	private static function events_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'nutzen_subscription_events';
	}

	public static function activate(): void {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$charset = $wpdb->get_charset_collate();
		$subscriptions = self::subscriptions_table();
		$events        = self::events_table();
		dbDelta( "CREATE TABLE {$subscriptions} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			plan_id bigint(20) unsigned NOT NULL DEFAULT 0,
			product_id bigint(20) unsigned NOT NULL,
			variation_id bigint(20) unsigned NOT NULL DEFAULT 0,
			quantity decimal(18,4) NOT NULL DEFAULT 1,
			interval_value smallint unsigned NOT NULL DEFAULT 1,
			interval_unit varchar(20) NOT NULL,
			discount_type varchar(20) NOT NULL DEFAULT 'percentage',
			discount_value decimal(18,4) NOT NULL DEFAULT 0,
			status varchar(30) NOT NULL DEFAULT 'pending_gateway',
			start_date datetime NULL,
			next_charge_date datetime NULL,
			last_order_id bigint(20) unsigned NOT NULL DEFAULT 0,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY user_status (user_id,status),
			KEY due (status,next_charge_date)
		) {$charset};" );
		dbDelta( "CREATE TABLE {$events} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			subscription_id bigint(20) unsigned NOT NULL,
			event_type varchar(40) NOT NULL,
			from_status varchar(30) NOT NULL DEFAULT '',
			to_status varchar(30) NOT NULL DEFAULT '',
			order_id bigint(20) unsigned NOT NULL DEFAULT 0,
			note text NOT NULL,
			created_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY subscription_id (subscription_id)
		) {$charset};" );
		update_option( 'nutzen_subscriptions_db_version', self::VERSION, false );
	}

	public static function register_plan_type(): void {
		register_post_type(
			'nutzen_plan',
			array(
				'labels' => array( 'name' => 'Planos Nutzen', 'singular_name' => 'Plano Nutzen', 'add_new_item' => 'Adicionar plano', 'edit_item' => 'Editar plano' ),
				'public' => false,
				'show_ui' => self::enabled(),
				'show_in_menu' => class_exists( 'Nutzen_Switch_Plugin' ) ? 'nutzen-switch' : 'woocommerce',
				'supports' => array( 'title', 'editor' ),
				'capability_type' => 'product',
				'map_meta_cap' => true,
				'show_in_rest' => false,
			)
		);
	}

	public static function plan_meta_box(): void {
		add_meta_box( 'nutzen-plan-settings', 'Configuração do plano', array( __CLASS__, 'render_plan_meta_box' ), 'nutzen_plan', 'normal', 'high' );
	}

	public static function render_plan_meta_box( WP_Post $post ): void {
		wp_nonce_field( 'nutzen_plan_save', 'nutzen_plan_nonce' );
		$interval = max( 1, (int) get_post_meta( $post->ID, '_nutzen_interval', true ) );
		$unit = (string) get_post_meta( $post->ID, '_nutzen_interval_unit', true ) ?: 'month';
		$type = (string) get_post_meta( $post->ID, '_nutzen_discount_type', true ) ?: 'percentage';
		$value = (string) get_post_meta( $post->ID, '_nutzen_discount_value', true );
		?><p><label>Recorrência <input type="number" min="1" max="365" name="nutzen_interval" value="<?php echo esc_attr( $interval ); ?>"> <select name="nutzen_interval_unit"><option value="day" <?php selected( $unit, 'day' ); ?>>dias</option><option value="week" <?php selected( $unit, 'week' ); ?>>semanas</option><option value="month" <?php selected( $unit, 'month' ); ?>>meses</option></select></label></p><p><label>Desconto <select name="nutzen_discount_type"><option value="percentage" <?php selected( $type, 'percentage' ); ?>>Percentual</option><option value="fixed" <?php selected( $type, 'fixed' ); ?>>Valor fixo</option></select> <input type="number" min="0" step="0.01" name="nutzen_discount_value" value="<?php echo esc_attr( $value ); ?>"></label></p><p class="description">A cobrança automática permanece desativada até existir um gateway recorrente compatível.</p><?php
	}

	public static function save_plan( int $post_id ): void {
		$nonce = isset( $_POST['nutzen_plan_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nutzen_plan_nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'nutzen_plan_save' ) || ! current_user_can( 'edit_product', $post_id ) || wp_is_post_autosave( $post_id ) ) return;
		$interval = isset( $_POST['nutzen_interval'] ) ? max( 1, min( 365, absint( $_POST['nutzen_interval'] ) ) ) : 1;
		$unit = isset( $_POST['nutzen_interval_unit'] ) ? sanitize_key( wp_unslash( $_POST['nutzen_interval_unit'] ) ) : 'month';
		$type = isset( $_POST['nutzen_discount_type'] ) ? sanitize_key( wp_unslash( $_POST['nutzen_discount_type'] ) ) : 'percentage';
		$value = isset( $_POST['nutzen_discount_value'] ) ? max( 0, (float) wc_format_decimal( wp_unslash( $_POST['nutzen_discount_value'] ) ) ) : 0;
		update_post_meta( $post_id, '_nutzen_interval', $interval );
		update_post_meta( $post_id, '_nutzen_interval_unit', in_array( $unit, array( 'day', 'week', 'month' ), true ) ? $unit : 'month' );
		update_post_meta( $post_id, '_nutzen_discount_type', in_array( $type, array( 'percentage', 'fixed' ), true ) ? $type : 'percentage' );
		update_post_meta( $post_id, '_nutzen_discount_value', $value );
	}

	public static function product_fields(): void {
		if ( ! self::enabled() ) return;
		echo '<div class="options_group">';
		woocommerce_wp_checkbox( array( 'id' => '_nutzen_subscription_eligible', 'label' => 'Elegível para assinatura', 'description' => 'Permite associar este SKU a um plano Nutzen.' ) );
		echo '</div>';
	}

	public static function save_product_fields( int $product_id ): void {
		if ( current_user_can( 'edit_product', $product_id ) ) {
			update_post_meta( $product_id, '_nutzen_subscription_eligible', isset( $_POST['_nutzen_subscription_eligible'] ) ? 'yes' : 'no' );
		}
	}

	public static function register_routes(): void {
		register_rest_route( 'nutzen/v1', '/subscription/plans', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'rest_plans' ), 'permission_callback' => '__return_true' ) );
		register_rest_route( 'nutzen/v1', '/subscription/me', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'rest_subscriptions' ), 'permission_callback' => array( __CLASS__, 'customer_permission' ) ) );
		register_rest_route( 'nutzen/v1', '/subscription/(?P<id>\d+)/(?P<action>pause|cancel|reactivate)', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'rest_transition' ), 'permission_callback' => array( __CLASS__, 'customer_permission' ) ) );
	}

	public static function customer_permission(): bool {
		if ( ! self::enabled() ) return false;
		if ( is_user_logged_in() ) return true;
		if ( ! class_exists( 'Nutzen_Switch_Plugin' ) ) return false;
		$authenticated = Nutzen_Switch_Plugin::authenticate_request();
		return true === $authenticated && get_current_user_id() > 0;
	}

	public static function rest_plans(): WP_REST_Response {
		$posts = get_posts( array( 'post_type' => 'nutzen_plan', 'post_status' => 'publish', 'numberposts' => 100, 'orderby' => 'menu_order title', 'order' => 'ASC' ) );
		$items = array_map( static function ( WP_Post $post ): array { return array( 'id' => $post->ID, 'name' => $post->post_title, 'description' => wp_strip_all_tags( $post->post_content ), 'interval' => (int) get_post_meta( $post->ID, '_nutzen_interval', true ), 'interval_unit' => (string) get_post_meta( $post->ID, '_nutzen_interval_unit', true ), 'discount_type' => (string) get_post_meta( $post->ID, '_nutzen_discount_type', true ), 'discount_value' => (float) get_post_meta( $post->ID, '_nutzen_discount_value', true ) ); }, $posts );
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	public static function rest_subscriptions(): WP_REST_Response {
		global $wpdb;
		$rows = $wpdb->get_results( $wpdb->prepare( 'SELECT id,plan_id,product_id,variation_id,quantity,interval_value,interval_unit,discount_type,discount_value,status,start_date,next_charge_date,last_order_id,created_at FROM ' . self::subscriptions_table() . ' WHERE user_id=%d ORDER BY id DESC', get_current_user_id() ), ARRAY_A );
		foreach ( $rows as &$row ) {
			$product = wc_get_product( (int) ( $row['variation_id'] ?: $row['product_id'] ) );
			$row['product_name'] = $product ? $product->get_name() : 'Produto indisponível';
			$row['plan_name'] = $row['plan_id'] ? get_the_title( (int) $row['plan_id'] ) : '';
			$row['product_slug'] = $product ? $product->get_slug() : '';
			$row['product_image'] = $product && $product->get_image_id() ? (string) wp_get_attachment_image_url( $product->get_image_id(), 'woocommerce_single' ) : '';
			$row['product_weight'] = $product ? (string) $product->get_weight() : '';
			$row['currency'] = get_woocommerce_currency();
			$row['unit_price'] = $product ? (float) wc_get_price_to_display( $product ) : 0;
			$subtotal = $row['unit_price'] * (float) $row['quantity'];
			$discount = 'fixed' === $row['discount_type'] ? min( $subtotal, (float) $row['discount_value'] ) : $subtotal * min( 100, (float) $row['discount_value'] ) / 100;
			$row['subscription_total'] = max( 0, $subtotal - $discount );
			$row['history'] = $wpdb->get_results( $wpdb->prepare( 'SELECT event_type,from_status,to_status,order_id,note,created_at FROM ' . self::events_table() . ' WHERE subscription_id=%d ORDER BY id DESC LIMIT 50', $row['id'] ), ARRAY_A );
		}
		return new WP_REST_Response( array( 'items' => $rows ) );
	}

	public static function rest_transition( WP_REST_Request $request ) {
		global $wpdb;
		$id = absint( $request['id'] );
		$action = sanitize_key( $request['action'] );
		$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::subscriptions_table() . ' WHERE id=%d AND user_id=%d', $id, get_current_user_id() ), ARRAY_A );
		if ( ! $row ) return new WP_Error( 'nutzen_subscription_not_found', 'Assinatura não encontrada.', array( 'status' => 404 ) );
		$transitions = array( 'pause' => array( 'active' => 'paused' ), 'cancel' => array( 'active' => 'cancelled', 'paused' => 'cancelled', 'pending_gateway' => 'cancelled' ), 'reactivate' => array( 'paused' => 'pending_gateway' ) );
		$current = $row['status'];
		$next = $transitions[ $action ][ $current ] ?? null;
		if ( ! $next ) return new WP_Error( 'nutzen_invalid_transition', 'Transição de status não permitida.', array( 'status' => 409 ) );
		$wpdb->update( self::subscriptions_table(), array( 'status' => $next, 'updated_at' => current_time( 'mysql', true ) ), array( 'id' => $id ), array( '%s', '%s' ), array( '%d' ) );
		$wpdb->insert( self::events_table(), array( 'subscription_id' => $id, 'event_type' => 'status_changed', 'from_status' => $current, 'to_status' => $next, 'order_id' => 0, 'note' => 'Solicitação realizada pelo cliente.', 'created_at' => current_time( 'mysql', true ) ), array( '%d', '%s', '%s', '%s', '%d', '%s', '%s' ) );
		return new WP_REST_Response( array( 'id' => $id, 'status' => $next ) );
	}

	public static function admin_menu(): void {
		$parent = class_exists( 'Nutzen_Switch_Plugin' ) ? 'nutzen-switch' : 'woocommerce';
		add_submenu_page( $parent, 'Nutzen Assinaturas', 'Assinaturas', 'manage_woocommerce', 'nutzen-subscriptions', array( __CLASS__, 'admin_page' ) );
	}

	public static function admin_page(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) return;
		global $wpdb;
		$rows = $wpdb->get_results( 'SELECT * FROM ' . self::subscriptions_table() . ' ORDER BY id DESC LIMIT 100', ARRAY_A );
		?><div class="wrap"><h1>Nutzen Assinaturas</h1><p>Renovações automáticas estão desativadas até a instalação e homologação de um gateway compatível.</p><table class="widefat striped"><thead><tr><th>ID</th><th>Cliente</th><th>Produto</th><th>Recorrência</th><th>Status</th><th>Próxima cobrança</th></tr></thead><tbody><?php foreach ( $rows as $row ) : ?><tr><td><?php echo (int) $row['id']; ?></td><td><?php echo (int) $row['user_id']; ?></td><td><?php echo (int) $row['product_id']; ?></td><td><?php echo esc_html( $row['interval_value'] . ' ' . $row['interval_unit'] ); ?></td><td><?php echo esc_html( $row['status'] ); ?></td><td><?php echo esc_html( $row['next_charge_date'] ?: '—' ); ?></td></tr><?php endforeach; ?></tbody></table></div><?php
	}
}

Nutzen_Subscriptions_Plugin::bootstrap();
