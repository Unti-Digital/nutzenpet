<?php
/**
 * Plugin Name: Nutzen Subscriptions
 * Description: Estrutura de planos e assinaturas personalizadas NutzenPet.
 * Version: 0.6.0
 * Author: NutzenPet
 * Requires at least: 6.7
 * Requires PHP: 8.1
 * WC requires at least: 9.0
 * WC tested up to: 11.1
 * Text Domain: nutzen-subscriptions
 */

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/includes/class-nutzen-subscription-admin.php';

use Automattic\WooCommerce\Utilities\FeaturesUtil;
use Automattic\WooCommerce\StoreApi\Exceptions\RouteException;
use Automattic\WooCommerce\StoreApi\Schemas\V1\CartItemSchema;
use Automattic\WooCommerce\StoreApi\Schemas\V1\ProductSchema;

final class Nutzen_Subscriptions_Plugin {
	private const VERSION = '0.6.0';

	public static function bootstrap(): void {
		register_activation_hook( __FILE__, array( __CLASS__, 'activate' ) );
		add_action( 'plugins_loaded', array( __CLASS__, 'maybe_upgrade' ) );
		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_compatibility' ) );
		add_action( 'init', array( __CLASS__, 'register_plan_type' ) );
		add_action( 'add_meta_boxes_nutzen_plan', array( __CLASS__, 'plan_meta_box' ) );
		add_action( 'save_post_nutzen_plan', array( __CLASS__, 'save_plan' ) );
		add_action( 'woocommerce_product_options_general_product_data', array( __CLASS__, 'product_fields' ) );
		add_action( 'woocommerce_process_product_meta', array( __CLASS__, 'save_product_fields' ) );
		add_action( 'woocommerce_blocks_loaded', array( __CLASS__, 'extend_store_api' ) );
		add_filter( 'woocommerce_store_api_add_to_cart_data', array( __CLASS__, 'store_api_add_to_cart_data' ), 10, 2 );
		add_action( 'woocommerce_before_calculate_totals', array( __CLASS__, 'apply_subscription_prices' ) );
		add_filter( 'woocommerce_get_item_data', array( __CLASS__, 'cart_item_display_data' ), 10, 2 );
		add_action( 'woocommerce_checkout_create_order_line_item', array( __CLASS__, 'save_order_item_data' ), 10, 4 );
		add_action( 'woocommerce_store_api_checkout_order_processed', array( __CLASS__, 'create_pending_subscriptions' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ), 21 );
		add_action( 'admin_init', array( __CLASS__, 'handle_admin_actions' ) );
	}

	public static function maybe_upgrade(): void {
		if ( self::VERSION !== get_option( 'nutzen_subscriptions_db_version' ) ) self::activate();
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
		$selected = array_map( 'absint', (array) get_post_meta( get_the_ID(), '_nutzen_subscription_plan_ids', true ) );
		$plans = get_posts( array( 'post_type' => 'nutzen_plan', 'post_status' => 'publish', 'numberposts' => 100, 'orderby' => 'menu_order title', 'order' => 'ASC' ) );
		echo '<p class="form-field"><label for="_nutzen_subscription_plan_ids">Planos disponíveis</label><select id="_nutzen_subscription_plan_ids" name="_nutzen_subscription_plan_ids[]" multiple class="wc-enhanced-select" style="width:50%">';
		foreach ( $plans as $plan ) echo '<option value="' . (int) $plan->ID . '" ' . selected( in_array( (int) $plan->ID, $selected, true ), true, false ) . '>' . esc_html( $plan->post_title ) . '</option>';
		echo '</select><span class="description">Defina as frequências e condições que podem ser escolhidas neste produto.</span></p>';
		echo '</div>';
	}

	public static function save_product_fields( int $product_id ): void {
		if ( current_user_can( 'edit_product', $product_id ) ) {
			update_post_meta( $product_id, '_nutzen_subscription_eligible', isset( $_POST['_nutzen_subscription_eligible'] ) ? 'yes' : 'no' );
			$plans = isset( $_POST['_nutzen_subscription_plan_ids'] ) ? array_values( array_filter( array_map( 'absint', (array) wp_unslash( $_POST['_nutzen_subscription_plan_ids'] ) ) ) ) : array();
			update_post_meta( $product_id, '_nutzen_subscription_plan_ids', $plans );
		}
	}

	public static function extend_store_api(): void {
		if ( ! self::enabled() || ! function_exists( 'woocommerce_store_api_register_endpoint_data' ) || ! class_exists( ProductSchema::class ) ) return;
		woocommerce_store_api_register_endpoint_data( array( 'endpoint' => ProductSchema::IDENTIFIER, 'namespace' => 'nutzen-subscriptions', 'data_callback' => array( __CLASS__, 'store_api_data' ), 'schema_callback' => array( __CLASS__, 'store_api_schema' ), 'schema_type' => ARRAY_A ) );
		woocommerce_store_api_register_endpoint_data( array( 'endpoint' => CartItemSchema::IDENTIFIER, 'namespace' => 'nutzen-subscriptions', 'data_callback' => array( __CLASS__, 'store_api_cart_item_data' ), 'schema_callback' => array( __CLASS__, 'store_api_cart_item_schema' ), 'schema_type' => ARRAY_A ) );
	}

	/** @return array<string,mixed>|null */
	private static function plan_data( int $plan_id ): ?array {
		$plan = get_post( $plan_id );
		if ( ! $plan || 'nutzen_plan' !== $plan->post_type || 'publish' !== $plan->post_status ) return null;
		return array(
			'id'             => $plan_id,
			'name'           => $plan->post_title,
			'interval'       => max( 1, (int) get_post_meta( $plan_id, '_nutzen_interval', true ) ),
			'interval_unit'  => (string) get_post_meta( $plan_id, '_nutzen_interval_unit', true ) ?: 'month',
			'discount_type'  => (string) get_post_meta( $plan_id, '_nutzen_discount_type', true ) ?: 'percentage',
			'discount_value' => max( 0, (float) get_post_meta( $plan_id, '_nutzen_discount_value', true ) ),
		);
	}

	/** @return array<string,mixed> */
	public static function store_api_add_to_cart_data( array $data, WP_REST_Request $request ): array {
		$extensions = (array) $request->get_param( 'extensions' );
		$requested  = isset( $extensions['nutzen-subscriptions'] ) ? (array) $extensions['nutzen-subscriptions'] : array();
		$is_subscription = 'subscription' === sanitize_key( (string) ( $requested['purchase_type'] ?? '' ) );

		if ( WC()->cart ) {
			foreach ( WC()->cart->get_cart() as $existing ) {
				$existing_is_subscription = 'subscription' === ( $existing['_nutzen_purchase_type'] ?? '' );
				if ( $existing_is_subscription !== $is_subscription ) {
					throw new RouteException( 'nutzen_cart_purchase_type_conflict', 'Compras avulsas e assinaturas devem ser finalizadas separadamente.', 409 );
				}
			}
		}

		if ( ! $is_subscription ) return $data;

		$product_id = absint( $data['id'] ?? 0 );
		$product    = wc_get_product( $product_id );
		$parent_id  = $product && $product->is_type( 'variation' ) ? $product->get_parent_id() : $product_id;
		$plan_id    = absint( $requested['plan_id'] ?? 0 );
		$allowed    = array_map( 'absint', (array) get_post_meta( $parent_id, '_nutzen_subscription_plan_ids', true ) );
		$plan       = self::plan_data( $plan_id );

		if ( ! $product || 'yes' !== get_post_meta( $parent_id, '_nutzen_subscription_eligible', true ) ) {
			throw new RouteException( 'nutzen_subscription_product', 'Este produto não está disponível para assinatura.', 400 );
		}
		if ( ! $plan || ! in_array( $plan_id, $allowed, true ) ) {
			throw new RouteException( 'nutzen_subscription_plan', 'Selecione um plano de assinatura disponível para este produto.', 400 );
		}

		$base_price = max( 0, (float) $product->get_price( 'edit' ) );
		$data['cart_item_data']['_nutzen_purchase_type']  = 'subscription';
		$data['cart_item_data']['_nutzen_plan_id']        = $plan_id;
		$data['cart_item_data']['_nutzen_plan_name']      = $plan['name'];
		$data['cart_item_data']['_nutzen_interval']       = $plan['interval'];
		$data['cart_item_data']['_nutzen_interval_unit']  = $plan['interval_unit'];
		$data['cart_item_data']['_nutzen_discount_type']  = $plan['discount_type'];
		$data['cart_item_data']['_nutzen_discount_value'] = $plan['discount_value'];
		$data['cart_item_data']['_nutzen_base_price']     = $base_price;
		return $data;
	}

	private static function discounted_price( float $base_price, string $type, float $value ): float {
		if ( 'fixed' === $type ) return max( 0, $base_price - $value );
		return max( 0, $base_price * ( 1 - min( 100, $value ) / 100 ) );
	}

	public static function apply_subscription_prices( WC_Cart $cart ): void {
		if ( is_admin() && ! wp_doing_ajax() ) return;
		foreach ( $cart->get_cart() as $item ) {
			if ( 'subscription' !== ( $item['_nutzen_purchase_type'] ?? '' ) || empty( $item['data'] ) ) continue;
			$base = max( 0, (float) ( $item['_nutzen_base_price'] ?? $item['data']->get_price( 'edit' ) ) );
			$item['data']->set_price( self::discounted_price( $base, (string) ( $item['_nutzen_discount_type'] ?? 'percentage' ), (float) ( $item['_nutzen_discount_value'] ?? 0 ) ) );
		}
	}

	/** @param array<int,array<string,mixed>> $item_data @param array<string,mixed> $cart_item */
	public static function cart_item_display_data( array $item_data, array $cart_item ): array {
		if ( 'subscription' !== ( $cart_item['_nutzen_purchase_type'] ?? '' ) ) return $item_data;
		$item_data[] = array( 'key' => 'Compra', 'value' => 'Assinatura Nutzen Club' );
		$item_data[] = array( 'key' => 'Frequência', 'value' => self::frequency_label( (int) $cart_item['_nutzen_interval'], (string) $cart_item['_nutzen_interval_unit'] ) );
		return $item_data;
	}

	private static function frequency_label( int $interval, string $unit ): string {
		$labels = array( 'day' => array( 'dia', 'dias' ), 'week' => array( 'semana', 'semanas' ), 'month' => array( 'mês', 'meses' ) );
		$label  = $labels[ $unit ] ?? $labels['month'];
		return 1 === $interval ? 'A cada 1 ' . $label[0] : 'A cada ' . $interval . ' ' . $label[1];
	}

	/** @param array<string,mixed> $cart_item */
	public static function store_api_cart_item_data( array $cart_item ): array {
		if ( 'subscription' !== ( $cart_item['_nutzen_purchase_type'] ?? '' ) ) return array( 'purchase_type' => 'one_time' );
		$base      = max( 0, (float) ( $cart_item['_nutzen_base_price'] ?? 0 ) );
		$recurring = self::discounted_price( $base, (string) $cart_item['_nutzen_discount_type'], (float) $cart_item['_nutzen_discount_value'] );
		return array(
			'purchase_type'  => 'subscription',
			'plan_id'        => (int) $cart_item['_nutzen_plan_id'],
			'plan_name'      => (string) $cart_item['_nutzen_plan_name'],
			'interval'       => (int) $cart_item['_nutzen_interval'],
			'interval_unit'  => (string) $cart_item['_nutzen_interval_unit'],
			'frequency_label'=> self::frequency_label( (int) $cart_item['_nutzen_interval'], (string) $cart_item['_nutzen_interval_unit'] ),
			'discount_type'  => (string) $cart_item['_nutzen_discount_type'],
			'discount_value' => (float) $cart_item['_nutzen_discount_value'],
			'unit_total'     => $recurring,
		);
	}

	/** @return array<string,mixed> */
	public static function store_api_cart_item_schema(): array {
		return array(
			'purchase_type'   => array( 'type' => 'string', 'readonly' => true ),
			'plan_id'         => array( 'type' => 'integer', 'readonly' => true ),
			'plan_name'       => array( 'type' => 'string', 'readonly' => true ),
			'interval'        => array( 'type' => 'integer', 'readonly' => true ),
			'interval_unit'   => array( 'type' => 'string', 'readonly' => true ),
			'frequency_label' => array( 'type' => 'string', 'readonly' => true ),
			'discount_type'   => array( 'type' => 'string', 'readonly' => true ),
			'discount_value'  => array( 'type' => 'number', 'readonly' => true ),
			'unit_total'      => array( 'type' => 'number', 'readonly' => true ),
		);
	}

	/** @param array<string,mixed> $values */
	public static function save_order_item_data( WC_Order_Item_Product $item, string $cart_item_key, array $values, WC_Order $order ): void {
		unset( $cart_item_key, $order );
		if ( 'subscription' !== ( $values['_nutzen_purchase_type'] ?? '' ) ) return;
		foreach ( array( '_nutzen_purchase_type', '_nutzen_plan_id', '_nutzen_plan_name', '_nutzen_interval', '_nutzen_interval_unit', '_nutzen_discount_type', '_nutzen_discount_value', '_nutzen_base_price' ) as $key ) {
			if ( isset( $values[ $key ] ) ) $item->add_meta_data( $key, $values[ $key ], true );
		}
		$item->add_meta_data( 'Modalidade', 'Assinatura Nutzen Club', true );
		$item->add_meta_data( 'Frequência', self::frequency_label( (int) $values['_nutzen_interval'], (string) $values['_nutzen_interval_unit'] ), true );
	}

	public static function create_pending_subscriptions( WC_Order $order ): void {
		global $wpdb;
		$user_id = (int) $order->get_customer_id();
		if ( $user_id <= 0 ) {
			foreach ( $order->get_items() as $item ) {
				if ( 'subscription' === $item->get_meta( '_nutzen_purchase_type', true ) ) {
					$order->add_order_note( 'Assinatura não criada: o checkout recorrente exige uma conta de cliente.' );
					break;
				}
			}
			return;
		}

		foreach ( $order->get_items() as $item ) {
			if ( 'subscription' !== $item->get_meta( '_nutzen_purchase_type', true ) ) continue;
			$product = $item->get_product();
			if ( ! $product ) continue;
			$product_id   = $product->is_type( 'variation' ) ? $product->get_parent_id() : $product->get_id();
			$variation_id = $product->is_type( 'variation' ) ? $product->get_id() : 0;
			$plan_id      = absint( $item->get_meta( '_nutzen_plan_id', true ) );
			$exists       = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . self::subscriptions_table() . ' WHERE last_order_id=%d AND product_id=%d AND variation_id=%d AND plan_id=%d LIMIT 1', $order->get_id(), $product_id, $variation_id, $plan_id ) );
			if ( $exists ) continue;
			$now = current_time( 'mysql', true );
			$wpdb->insert( self::subscriptions_table(), array(
				'user_id' => $user_id, 'plan_id' => $plan_id, 'product_id' => $product_id, 'variation_id' => $variation_id,
				'quantity' => $item->get_quantity(), 'interval_value' => max( 1, (int) $item->get_meta( '_nutzen_interval', true ) ),
				'interval_unit' => (string) $item->get_meta( '_nutzen_interval_unit', true ), 'discount_type' => (string) $item->get_meta( '_nutzen_discount_type', true ),
				'discount_value' => max( 0, (float) $item->get_meta( '_nutzen_discount_value', true ) ), 'status' => 'pending_gateway',
				'start_date' => null, 'next_charge_date' => null, 'last_order_id' => $order->get_id(), 'created_at' => $now, 'updated_at' => $now,
			) );
			if ( $wpdb->insert_id ) self::record_event( (int) $wpdb->insert_id, 'created_from_order', '', 'pending_gateway', 'Assinatura criada a partir do pedido #' . $order->get_order_number() . '. A ativação depende do gateway recorrente.' );
		}
	}

	/** @return array<string,mixed> */
	public static function store_api_data( WC_Product $product ): array {
		$eligible = 'yes' === get_post_meta( $product->get_id(), '_nutzen_subscription_eligible', true );
		$plan_ids = array_map( 'absint', (array) get_post_meta( $product->get_id(), '_nutzen_subscription_plan_ids', true ) );
		$plans = array();
		if ( $eligible ) {
			foreach ( $plan_ids as $plan_id ) {
				$plan = get_post( $plan_id );
				if ( ! $plan || 'nutzen_plan' !== $plan->post_type || 'publish' !== $plan->post_status ) continue;
				$plans[] = array( 'id' => $plan_id, 'name' => $plan->post_title, 'interval' => max( 1, (int) get_post_meta( $plan_id, '_nutzen_interval', true ) ), 'interval_unit' => (string) get_post_meta( $plan_id, '_nutzen_interval_unit', true ) ?: 'month', 'discount_type' => (string) get_post_meta( $plan_id, '_nutzen_discount_type', true ) ?: 'percentage', 'discount_value' => max( 0, (float) get_post_meta( $plan_id, '_nutzen_discount_value', true ) ) );
			}
		}
		return array( 'eligible' => $eligible, 'plans' => $plans, 'automatic_renewal_available' => false );
	}

	/** @return array<string,mixed> */
	public static function store_api_schema(): array {
		return array( 'eligible' => array( 'type' => 'boolean', 'readonly' => true ), 'plans' => array( 'type' => 'array', 'readonly' => true, 'items' => array( 'type' => 'object' ) ), 'automatic_renewal_available' => array( 'type' => 'boolean', 'readonly' => true ) );
	}

	public static function register_routes(): void {
		register_rest_route( 'nutzen/v1', '/subscription/plans', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'rest_plans' ), 'permission_callback' => '__return_true' ) );
		register_rest_route( 'nutzen/v1', '/subscription/me', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'rest_subscriptions' ), 'permission_callback' => array( __CLASS__, 'customer_permission' ) ) );
		register_rest_route( 'nutzen/v1', '/subscription/(?P<id>\d+)/(?P<action>pause|cancel|reactivate)', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'rest_transition' ), 'permission_callback' => array( __CLASS__, 'customer_permission' ) ) );
		register_rest_route( 'nutzen/v1', '/subscription/(?P<id>\d+)/frequency', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'rest_frequency' ), 'permission_callback' => array( __CLASS__, 'customer_permission' ) ) );
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
		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT id,plan_id,product_id,variation_id,quantity,interval_value,interval_unit,discount_type,discount_value,status,start_date,next_charge_date,last_order_id,created_at FROM " . self::subscriptions_table() . " WHERE user_id=%d AND status IN ('pending_gateway','active','paused') ORDER BY id DESC", get_current_user_id() ), ARRAY_A );
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
			$row['available_plans'] = array();
			foreach ( array_map( 'absint', (array) get_post_meta( (int) $row['product_id'], '_nutzen_subscription_plan_ids', true ) ) as $available_plan_id ) {
				$available_plan = get_post( $available_plan_id );
				if ( $available_plan && 'nutzen_plan' === $available_plan->post_type && 'publish' === $available_plan->post_status ) {
					$row['available_plans'][] = array( 'id' => $available_plan_id, 'name' => $available_plan->post_title );
				}
			}
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

	public static function rest_frequency( WP_REST_Request $request ) {
		global $wpdb;
		$id = absint( $request['id'] );
		$plan_id = absint( $request->get_param( 'plan_id' ) );
		$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::subscriptions_table() . ' WHERE id=%d AND user_id=%d', $id, get_current_user_id() ), ARRAY_A );
		if ( ! $row ) return new WP_Error( 'nutzen_subscription_not_found', 'Assinatura não encontrada.', array( 'status' => 404 ) );
		if ( ! in_array( $row['status'], array( 'active', 'paused', 'pending_gateway' ), true ) ) return new WP_Error( 'nutzen_subscription_status', 'Esta assinatura não permite alteração de frequência.', array( 'status' => 409 ) );
		$allowed = array_map( 'absint', (array) get_post_meta( (int) $row['product_id'], '_nutzen_subscription_plan_ids', true ) );
		$plan = get_post( $plan_id );
		if ( ! $plan || 'nutzen_plan' !== $plan->post_type || 'publish' !== $plan->post_status || ! in_array( $plan_id, $allowed, true ) ) return new WP_Error( 'nutzen_subscription_plan', 'Plano indisponível para este produto.', array( 'status' => 400 ) );
		$wpdb->update( self::subscriptions_table(), array( 'plan_id' => $plan_id, 'interval_value' => max( 1, (int) get_post_meta( $plan_id, '_nutzen_interval', true ) ), 'interval_unit' => (string) get_post_meta( $plan_id, '_nutzen_interval_unit', true ) ?: 'month', 'discount_type' => (string) get_post_meta( $plan_id, '_nutzen_discount_type', true ) ?: 'percentage', 'discount_value' => max( 0, (float) get_post_meta( $plan_id, '_nutzen_discount_value', true ) ), 'status' => 'pending_gateway', 'updated_at' => current_time( 'mysql', true ) ), array( 'id' => $id ), array( '%d', '%d', '%s', '%s', '%f', '%s', '%s' ), array( '%d' ) );
		self::record_event( $id, 'frequency_change_requested', (string) $row['plan_id'], (string) $plan_id, 'Alteração solicitada pelo cliente. A cobrança depende do gateway compatível.' );
		return new WP_REST_Response( array( 'id' => $id, 'plan_id' => $plan_id, 'status' => 'pending_gateway' ) );
	}

	public static function admin_menu(): void {
		$parent = class_exists( 'Nutzen_Switch_Plugin' ) ? 'nutzen-switch' : 'woocommerce';
		add_submenu_page( $parent, 'Nutzen Assinaturas', 'Assinaturas', 'manage_woocommerce', 'nutzen-subscriptions', array( 'Nutzen_Subscription_Admin', 'render' ) );
	}

	public static function handle_admin_actions(): void {
		if ( ! isset( $_POST['nutzen_subscription_action'] ) || ! current_user_can( 'manage_woocommerce' ) ) return;
		check_admin_referer( 'nutzen_subscription_admin' );
		global $wpdb;
		$action = sanitize_key( wp_unslash( $_POST['nutzen_subscription_action'] ) );
		$id = absint( $_POST['subscription_id'] ?? 0 );
		$redirect_user_id = absint( $_POST['redirect_subscriber_id'] ?? 0 );
		$redirect_args = array( 'page' => 'nutzen-subscriptions' );
		if ( $redirect_user_id > 0 ) $redirect_args['subscriber_id'] = $redirect_user_id;
		if ( 'archive' === $action && $id > 0 ) {
			$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::subscriptions_table() . ' WHERE id=%d', $id ), ARRAY_A );
			if ( $row ) self::admin_update_status( $row, 'removed', 'Assinatura removida da operação pelo administrador.' );
			wp_safe_redirect( add_query_arg( $redirect_args, admin_url( 'admin.php' ) ) );
			exit;
		}
		$user_id = absint( $_POST['user_id'] ?? 0 );
		$product_id = absint( $_POST['product_id'] ?? 0 );
		$variation_id = absint( $_POST['variation_id'] ?? 0 );
		$plan_id = absint( $_POST['plan_id'] ?? 0 );
		$status = sanitize_key( wp_unslash( $_POST['status'] ?? 'pending_gateway' ) );
		$unit = sanitize_key( wp_unslash( $_POST['interval_unit'] ?? 'month' ) );
		$type = sanitize_key( wp_unslash( $_POST['discount_type'] ?? 'percentage' ) );
		if ( ! get_user_by( 'id', $user_id ) || ! wc_get_product( $variation_id ?: $product_id ) || ! in_array( $status, array( 'pending_gateway', 'active', 'paused', 'cancelled', 'rejected', 'removed' ), true ) ) return;
		$now = current_time( 'mysql', true );
		$data = array(
			'user_id' => $user_id, 'plan_id' => $plan_id, 'product_id' => $product_id, 'variation_id' => $variation_id,
			'quantity' => max( 1, (float) wc_format_decimal( wp_unslash( $_POST['quantity'] ?? '1' ) ) ),
			'interval_value' => max( 1, absint( $_POST['interval_value'] ?? 1 ) ),
			'interval_unit' => in_array( $unit, array( 'day', 'week', 'month' ), true ) ? $unit : 'month',
			'discount_type' => in_array( $type, array( 'percentage', 'fixed' ), true ) ? $type : 'percentage',
			'discount_value' => max( 0, (float) wc_format_decimal( wp_unslash( $_POST['discount_value'] ?? '0' ) ) ),
			'status' => $status,
			'next_charge_date' => sanitize_text_field( wp_unslash( $_POST['next_charge_date'] ?? '' ) ) ?: null,
			'updated_at' => $now,
		);
		if ( $id > 0 ) {
			$previous = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::subscriptions_table() . ' WHERE id=%d', $id ), ARRAY_A );
			$wpdb->update( self::subscriptions_table(), $data, array( 'id' => $id ) );
			if ( $previous && $previous['status'] !== $status ) self::record_event( $id, 'admin_status_changed', $previous['status'], $status, 'Status alterado pelo administrador.' );
		} else {
			$data['start_date'] = 'active' === $status ? $now : null;
			$data['last_order_id'] = 0;
			$data['created_at'] = $now;
			$wpdb->insert( self::subscriptions_table(), $data );
			self::record_event( (int) $wpdb->insert_id, 'created_by_admin', '', $status, 'Assinatura cadastrada manualmente.' );
			$redirect_args['subscriber_id'] = $user_id;
		}
		wp_safe_redirect( add_query_arg( $redirect_args, admin_url( 'admin.php' ) ) );
		exit;
	}

	/** @param array<string, mixed> $row */
	private static function admin_update_status( array $row, string $status, string $note ): void {
		global $wpdb;
		$wpdb->update( self::subscriptions_table(), array( 'status' => $status, 'updated_at' => current_time( 'mysql', true ) ), array( 'id' => $row['id'] ), array( '%s', '%s' ), array( '%d' ) );
		self::record_event( (int) $row['id'], 'admin_status_changed', (string) $row['status'], $status, $note );
	}

	private static function record_event( int $subscription_id, string $event, string $from, string $to, string $note ): void {
		global $wpdb;
		$wpdb->insert( self::events_table(), array( 'subscription_id' => $subscription_id, 'event_type' => $event, 'from_status' => $from, 'to_status' => $to, 'order_id' => 0, 'note' => $note, 'created_at' => current_time( 'mysql', true ) ), array( '%d', '%s', '%s', '%s', '%d', '%s', '%s' ) );
	}

	public static function admin_page(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) return;
		global $wpdb;
		$status_filter = sanitize_key( wp_unslash( $_GET['subscription_status'] ?? '' ) );
		$search = sanitize_text_field( wp_unslash( $_GET['subscription_search'] ?? '' ) );
		$where = array( '1=1' );
		$args = array();
		if ( in_array( $status_filter, array( 'pending_gateway', 'active', 'paused', 'cancelled', 'rejected', 'removed' ), true ) ) { $where[] = 's.status=%s'; $args[] = $status_filter; }
		if ( '' !== $search ) { $where[] = '(u.display_name LIKE %s OR u.user_email LIKE %s OR p.post_title LIKE %s)'; $like = '%' . $wpdb->esc_like( $search ) . '%'; array_push( $args, $like, $like, $like ); }
		$sql = 'SELECT s.* FROM ' . self::subscriptions_table() . ' s LEFT JOIN ' . $wpdb->users . ' u ON u.ID=s.user_id LEFT JOIN ' . $wpdb->posts . ' p ON p.ID=s.product_id WHERE ' . implode( ' AND ', $where ) . ' ORDER BY s.id DESC LIMIT 100';
		$rows = $wpdb->get_results( $args ? $wpdb->prepare( $sql, ...$args ) : $sql, ARRAY_A );
		$customers = get_users( array( 'number' => 200, 'orderby' => 'display_name', 'fields' => array( 'ID', 'display_name', 'user_email' ) ) );
		$products = wc_get_products( array( 'limit' => 200, 'status' => array( 'publish', 'draft' ), 'orderby' => 'name', 'order' => 'ASC' ) );
		$plans = get_posts( array( 'post_type' => 'nutzen_plan', 'post_status' => array( 'publish', 'draft' ), 'numberposts' => 100 ) );
		$subscription_metrics = array(
			'active'  => (int) $wpdb->get_var( "SELECT COUNT(*) FROM " . self::subscriptions_table() . " WHERE status='active'" ),
			'pending' => (int) $wpdb->get_var( "SELECT COUNT(*) FROM " . self::subscriptions_table() . " WHERE status='pending_gateway'" ),
			'paused'  => (int) $wpdb->get_var( "SELECT COUNT(*) FROM " . self::subscriptions_table() . " WHERE status='paused'" ),
			'plans'   => count( array_filter( $plans, static fn( WP_Post $plan ): bool => 'publish' === $plan->post_status ) ),
		);
		?><div class="wrap nutzen-admin"><section class="nutzen-admin-hero"><div><span class="nutzen-kicker">NUTZEN CLUB</span><h1>Assinaturas</h1><p>Gerencie assinantes, recorrência e status sem gerar cobranças automáticas.</p></div><a class="button" href="<?php echo esc_url( admin_url( 'edit.php?post_type=nutzen_plan' ) ); ?>">Gerenciar planos</a></section><div class="nutzen-stat-grid"><article><strong><?php echo esc_html( number_format_i18n( $subscription_metrics['active'] ) ); ?></strong><span>assinaturas ativas</span></article><article><strong><?php echo esc_html( number_format_i18n( $subscription_metrics['pending'] ) ); ?></strong><span>aguardando gateway</span></article><article><strong><?php echo esc_html( number_format_i18n( $subscription_metrics['paused'] ) ); ?></strong><span>assinaturas pausadas</span></article><article><strong><?php echo esc_html( number_format_i18n( $subscription_metrics['plans'] ) ); ?></strong><span>planos publicados</span></article></div><form method="get" class="nutzen-admin-filter"><input type="hidden" name="page" value="nutzen-subscriptions"><input type="search" name="subscription_search" value="<?php echo esc_attr( $search ); ?>" placeholder="Buscar cliente, e-mail ou produto"><select name="subscription_status"><option value="">Todos os status</option><?php foreach ( array( 'pending_gateway' => 'Pendente de gateway', 'active' => 'Ativa', 'paused' => 'Pausada', 'cancelled' => 'Cancelada', 'rejected' => 'Rejeitada', 'removed' => 'Removida' ) as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $status_filter, $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select><button class="button button-primary">Filtrar</button><a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=nutzen-subscriptions' ) ); ?>">Limpar</a></form>
		<form method="post" class="nutzen-settings-card"><?php wp_nonce_field( 'nutzen_subscription_admin' ); ?><input type="hidden" name="nutzen_subscription_action" value="save"><input type="hidden" name="subscription_id" value="0"><h2>Nova assinatura manual</h2><div class="nutzen-form-grid"><label><span>Cliente</span><select name="user_id" required><option value="">Selecione</option><?php foreach ( $customers as $customer ) : ?><option value="<?php echo (int) $customer->ID; ?>"><?php echo esc_html( $customer->display_name . ' · ' . $customer->user_email ); ?></option><?php endforeach; ?></select></label><label><span>Produto</span><select name="product_id" required><option value="">Selecione</option><?php foreach ( $products as $product ) : ?><option value="<?php echo (int) $product->get_id(); ?>"><?php echo esc_html( $product->get_name() ); ?></option><?php endforeach; ?></select></label><label><span>Plano</span><select name="plan_id"><option value="0">Sem plano</option><?php foreach ( $plans as $plan ) : ?><option value="<?php echo (int) $plan->ID; ?>"><?php echo esc_html( $plan->post_title ); ?></option><?php endforeach; ?></select></label><label><span>Status</span><select name="status"><option value="pending_gateway">Pendente de gateway</option><option value="active">Ativa</option><option value="paused">Pausada</option><option value="rejected">Rejeitada</option></select></label><label><span>Quantidade</span><input type="number" min="1" step="1" name="quantity" value="1"></label><label><span>Recorrência</span><span class="nutzen-inline-form"><input type="number" min="1" name="interval_value" value="1"><select name="interval_unit"><option value="month">Mês</option><option value="week">Semana</option><option value="day">Dia</option></select></span></label><label><span>Desconto</span><span class="nutzen-inline-form"><input type="number" min="0" step="0.01" name="discount_value" value="0"><select name="discount_type"><option value="percentage">%</option><option value="fixed">R$</option></select></span></label><label><span>Próxima cobrança</span><input type="datetime-local" name="next_charge_date"></label></div><?php submit_button( 'Criar assinatura' ); ?><p class="description">A ativação manual não cobra o cliente. O gateway recorrente será integrado em uma etapa posterior.</p></form>
		<h2>Assinaturas cadastradas</h2><div class="nutzen-subscription-list"><?php foreach ( $rows as $row ) : $user = get_user_by( 'id', $row['user_id'] ); $product = wc_get_product( $row['variation_id'] ?: $row['product_id'] ); ?><form method="post" class="nutzen-record-card"><?php wp_nonce_field( 'nutzen_subscription_admin' ); ?><input type="hidden" name="nutzen_subscription_action" value="save"><input type="hidden" name="subscription_id" value="<?php echo (int) $row['id']; ?>"><input type="hidden" name="user_id" value="<?php echo (int) $row['user_id']; ?>"><input type="hidden" name="product_id" value="<?php echo (int) $row['product_id']; ?>"><div class="nutzen-record-card__head"><div><span class="nutzen-kicker">ASSINATURA #<?php echo (int) $row['id']; ?></span><h3><?php echo esc_html( $user ? $user->display_name : 'Usuário removido' ); ?></h3><p><?php echo esc_html( $product ? $product->get_name() : 'Produto indisponível' ); ?></p></div><a class="button" href="<?php echo esc_url( get_edit_user_link( $row['user_id'] ) ); ?>">Ver cliente</a></div><div class="nutzen-form-grid"><label><span>Plano</span><select name="plan_id"><option value="0">Sem plano</option><?php foreach ( $plans as $plan ) : ?><option value="<?php echo (int) $plan->ID; ?>" <?php selected( $row['plan_id'], $plan->ID ); ?>><?php echo esc_html( $plan->post_title ); ?></option><?php endforeach; ?></select></label><label><span>Status</span><select name="status"><?php foreach ( array( 'pending_gateway' => 'Pendente de gateway', 'active' => 'Ativa', 'paused' => 'Pausada', 'cancelled' => 'Cancelada', 'rejected' => 'Rejeitada', 'removed' => 'Removida' ) as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $row['status'], $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select></label><label><span>Quantidade</span><input type="number" min="1" name="quantity" value="<?php echo esc_attr( $row['quantity'] ); ?>"></label><label><span>Recorrência</span><span class="nutzen-inline-form"><input type="number" min="1" name="interval_value" value="<?php echo esc_attr( $row['interval_value'] ); ?>"><select name="interval_unit"><option value="day" <?php selected( $row['interval_unit'], 'day' ); ?>>Dia</option><option value="week" <?php selected( $row['interval_unit'], 'week' ); ?>>Semana</option><option value="month" <?php selected( $row['interval_unit'], 'month' ); ?>>Mês</option></select></span></label><label><span>Desconto</span><span class="nutzen-inline-form"><input type="number" min="0" step="0.01" name="discount_value" value="<?php echo esc_attr( $row['discount_value'] ); ?>"><select name="discount_type"><option value="percentage" <?php selected( $row['discount_type'], 'percentage' ); ?>>%</option><option value="fixed" <?php selected( $row['discount_type'], 'fixed' ); ?>>R$</option></select></span></label><label><span>Próxima cobrança</span><input type="datetime-local" name="next_charge_date" value="<?php echo esc_attr( $row['next_charge_date'] ? str_replace( ' ', 'T', substr( $row['next_charge_date'], 0, 16 ) ) : '' ); ?>"></label></div><div class="nutzen-record-card__actions"><button class="button button-primary">Salvar alterações</button><button class="button-link-delete" name="nutzen_subscription_action" value="archive" onclick="return confirm('Remover esta assinatura da operação? O histórico será preservado.');">Remover</button></div></form><?php endforeach; ?></div></div><?php
	}
}

Nutzen_Subscriptions_Plugin::bootstrap();
