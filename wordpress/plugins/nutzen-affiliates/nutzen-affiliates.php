<?php
/**
 * Plugin Name: Nutzen Affiliates
 * Description: Afiliados e comissões por produto para a loja NutzenPet.
 * Version: 0.5.0
 * Author: NutzenPet
 * Requires at least: 6.7
 * Requires PHP: 8.1
 * WC requires at least: 9.0
 * WC tested up to: 11.1
 * Text Domain: nutzen-affiliates
 */

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/includes/class-nutzen-affiliate-portal.php';
require_once __DIR__ . '/includes/class-nutzen-affiliate-admin.php';

use Automattic\WooCommerce\Utilities\FeaturesUtil;

final class Nutzen_Affiliates_Plugin {
	private const VERSION = '0.5.0';
	private const OPTION  = 'nutzen_affiliates_settings';

	public static function bootstrap(): void {
		register_activation_hook( __FILE__, array( __CLASS__, 'activate' ) );
		add_action( 'plugins_loaded', array( __CLASS__, 'maybe_upgrade' ) );
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
		add_action( 'rest_api_init', array( 'Nutzen_Affiliate_Portal', 'register_routes' ) );
		add_action( 'nutzen_application_status_changed', array( __CLASS__, 'application_status_changed' ), 10, 3 );
		add_filter( 'nutzen_application_enabled', array( __CLASS__, 'application_enabled' ), 10, 2 );
	}

	public static function maybe_upgrade(): void {
		if ( self::VERSION !== get_option( 'nutzen_affiliates_db_version' ) ) {
			self::activate();
			$settings = self::settings();
			$settings['public_registration'] = true;
			update_option( self::OPTION, $settings, false );
		}
	}

	/** @param mixed $enabled */
	public static function application_enabled( $enabled, string $type ): bool {
		return 'affiliate' === $type ? (bool) self::settings()['public_registration'] : (bool) $enabled;
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
		$withdrawal_table = $wpdb->prefix . 'nutzen_affiliate_withdrawals';
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
		dbDelta( "CREATE TABLE {$withdrawal_table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			affiliate_id bigint(20) unsigned NOT NULL,
			ticket_number varchar(40) NOT NULL,
			amount decimal(18,4) NOT NULL DEFAULT 0,
			status varchar(20) NOT NULL DEFAULT 'requested',
			note text NOT NULL,
			processed_by bigint(20) unsigned NOT NULL DEFAULT 0,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY ticket_number (ticket_number),
			KEY affiliate_status (affiliate_id,status)
		) {$charset};" );
		add_option( self::OPTION, self::default_settings(), '', false );
		update_option( 'nutzen_affiliates_db_version', self::VERSION, false );
		Nutzen_Affiliate_Portal::activate();
	}

	/** @return array<string, mixed> */
	private static function default_settings(): array {
		return array(
			'public_registration' => true,
			'base'                => 'after_discounts',
			'include_taxes'       => false,
			'attribution_days'    => 30,
			'conflict'            => 'last_click',
			'reverse_refunds'     => true,
			'auto_approve'        => false,
			'minimum_withdrawal'  => 100,
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

	private static function withdrawal_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'nutzen_affiliate_withdrawals';
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

	public static function application_status_changed( int $application_id, string $status, string $previous ): void {
		if ( 'affiliate' !== get_post_meta( $application_id, '_nutzen_application_type', true ) ) return;
		$user_id = (int) get_post_meta( $application_id, '_nutzen_application_user_id', true );
		if ( $user_id <= 0 || ! get_user_by( 'id', $user_id ) ) return;
		$mapped = array( 'pending' => 'pending', 'in_review' => 'pending', 'approved' => 'approved', 'rejected' => 'rejected' );
		if ( ! isset( $mapped[ $status ] ) ) return;
		self::upsert_affiliate( $user_id, $mapped[ $status ] );
		update_user_meta( $user_id, 'nutzen_affiliate_application_id', $application_id );
	}

	private static function upsert_affiliate( int $user_id, string $status, string $code = '' ): void {
		global $wpdb;
		$existing = self::get_affiliate_by_user( $user_id );
		$code = $code ?: ( $existing['code'] ?? 'nutzen-' . $user_id . '-' . wp_generate_password( 6, false, false ) );
		$now = current_time( 'mysql', true );
		$data = array( 'user_id' => $user_id, 'code' => sanitize_key( $code ), 'status' => $status, 'updated_at' => $now );
		if ( $existing ) {
			$wpdb->update( self::affiliate_table(), $data, array( 'id' => (int) $existing['id'] ), array( '%d', '%s', '%s', '%s' ), array( '%d' ) );
			return;
		}
		$data['created_at'] = $now;
		$wpdb->insert( self::affiliate_table(), $data, array( '%d', '%s', '%s', '%s', '%s' ) );
	}

	private static function approved_balance( int $affiliate_id ): float {
		global $wpdb;
		$earned = (float) $wpdb->get_var( $wpdb->prepare( 'SELECT COALESCE(SUM(commission_amount),0) FROM ' . self::commission_table() . ' WHERE affiliate_id=%d AND status=%s', $affiliate_id, 'approved' ) );
		$reserved = (float) $wpdb->get_var( $wpdb->prepare( "SELECT COALESCE(SUM(amount),0) FROM " . self::withdrawal_table() . " WHERE affiliate_id=%d AND status IN ('requested','in_review','paid')", $affiliate_id ) );
		return max( 0, $earned - $reserved );
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
		Nutzen_Affiliate_Portal::attach_to_order( $order );
		$order->save();
		Nutzen_Affiliate_Portal::record_attribution( $order, $order->get_status() );
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
		Nutzen_Affiliate_Portal::record_attribution( $order, $new_status );
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
			$wpdb->query( $wpdb->prepare( 'INSERT IGNORE INTO ' . self::commission_table() . ' (affiliate_id,link_id,campaign_id,order_id,order_item_id,product_id,variation_id,quantity,calculation_base,commission_type,commission_rate,commission_amount,status,created_at,updated_at) VALUES (%d,%d,%d,%d,%d,%d,%d,%f,%f,%s,%f,%f,%s,%s,%s)', $affiliate_id, (int) $order->get_meta( '_nutzen_affiliate_link_id', true ), (int) $order->get_meta( '_nutzen_affiliate_campaign_id', true ), $order->get_id(), $item_id, $product_id, $variation_id, $quantity, $base, $type, $rate, $commission, 'pending', $now, $now ) );
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
		$order = wc_get_order( $order_id );
		if ( $order ) {
			Nutzen_Affiliate_Portal::record_attribution( $order, 'refunded' );
		}
	}

	public static function register_routes(): void {
		register_rest_route( 'nutzen/v1', '/affiliate/track', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'rest_track' ), 'permission_callback' => '__return_true' ) );
		register_rest_route( 'nutzen/v1', '/affiliate/me', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'rest_me' ), 'permission_callback' => array( __CLASS__, 'rest_permission' ) ) );
		register_rest_route( 'nutzen/v1', '/affiliate/commissions', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'rest_commissions' ), 'permission_callback' => array( __CLASS__, 'rest_permission' ), 'args' => array( 'page' => array( 'default' => 1, 'sanitize_callback' => 'absint' ) ) ) );
		register_rest_route( 'nutzen/v1', '/affiliate/withdrawals', array( 'methods' => array( 'GET', 'POST' ), 'callback' => array( __CLASS__, 'rest_withdrawals' ), 'permission_callback' => array( __CLASS__, 'rest_permission' ) ) );
	}

	public static function rest_track( WP_REST_Request $request ) {
		$code = sanitize_key( (string) $request->get_param( 'code' ) );
		if ( ! self::get_affiliate_by_code( $code ) ) return new WP_Error( 'nutzen_invalid_referral', 'Link de indicação inválido ou inativo.', array( 'status' => 404 ) );
		$tracking = Nutzen_Affiliate_Portal::track( $code, sanitize_key( (string) $request->get_param( 'link_token' ) ), $request );
		return new WP_REST_Response( array_merge( array( 'valid' => true, 'code' => $code, 'attribution_days' => max( 1, min( 365, (int) self::settings()['attribution_days'] ) ) ), $tracking ) );
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
				'available_balance'=> self::approved_balance( (int) $affiliate['id'] ),
				'minimum_withdrawal' => max( 100, (float) self::settings()['minimum_withdrawal'] ),
				'pix'                => Nutzen_Affiliate_Portal::rest_pix( new WP_REST_Request( 'GET' ) )->get_data(),
			)
		);
	}

	public static function rest_withdrawals( WP_REST_Request $request ) {
		global $wpdb;
		$affiliate = self::get_affiliate_by_user( get_current_user_id() );
		if ( 'POST' === $request->get_method() ) {
			$minimum = max( 100, (float) self::settings()['minimum_withdrawal'] );
			$available = self::approved_balance( (int) $affiliate['id'] );
			$amount = (float) wc_format_decimal( (string) $request->get_param( 'amount' ) );
			if ( $amount < $minimum ) return new WP_Error( 'nutzen_withdrawal_minimum', sprintf( 'O valor mínimo para saque é %s.', wp_strip_all_tags( wc_price( $minimum ) ) ), array( 'status' => 400 ) );
			if ( $amount > $available ) return new WP_Error( 'nutzen_withdrawal_balance', 'O valor solicitado é maior que o saldo disponível.', array( 'status' => 409 ) );
			$open = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM " . self::withdrawal_table() . " WHERE affiliate_id=%d AND status IN ('requested','in_review')", $affiliate['id'] ) );
			if ( $open > 0 ) return new WP_Error( 'nutzen_withdrawal_open', 'Você já possui uma solicitação de saque em análise.', array( 'status' => 409 ) );
			$pix = Nutzen_Affiliate_Portal::pix_snapshot( (int) $affiliate['id'] );
			if ( empty( $pix['pix_key_encrypted'] ) ) return new WP_Error( 'nutzen_withdrawal_pix', 'Cadastre uma chave PIX antes de solicitar o saque.', array( 'status' => 409 ) );
			$now = current_time( 'mysql', true );
			$ticket = 'NS-' . gmdate( 'Ymd' ) . '-' . strtoupper( wp_generate_password( 6, false, false ) );
			$wpdb->insert( self::withdrawal_table(), array( 'affiliate_id' => $affiliate['id'], 'ticket_number' => $ticket, 'amount' => $amount, 'status' => 'requested', 'note' => sanitize_textarea_field( (string) $request->get_param( 'note' ) ), 'pix_snapshot_encrypted' => $pix['pix_key_encrypted'], 'pix_snapshot_last4' => $pix['pix_key_last4'], 'processed_by' => 0, 'payment_reference' => '', 'paid_at' => null, 'created_at' => $now, 'updated_at' => $now ) );
			return new WP_REST_Response( array( 'id' => (int) $wpdb->insert_id, 'ticket_number' => $ticket, 'status' => 'requested', 'amount' => $amount ), 201 );
		}
		$rows = $wpdb->get_results( $wpdb->prepare( 'SELECT id,ticket_number,amount,status,note,pix_snapshot_last4,payment_reference,paid_at,created_at,updated_at FROM ' . self::withdrawal_table() . ' WHERE affiliate_id=%d ORDER BY id DESC LIMIT 50', $affiliate['id'] ), ARRAY_A );
		return new WP_REST_Response( array( 'items' => $rows, 'available_balance' => self::approved_balance( (int) $affiliate['id'] ), 'minimum_withdrawal' => max( 100, (float) self::settings()['minimum_withdrawal'] ) ) );
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
		$action = sanitize_key( wp_unslash( $_POST['nutzen_affiliate_action'] ) );
		if ( 'settings' === $action ) {
			$settings = self::settings();
			$settings['attribution_days'] = max( 1, min( 365, absint( $_POST['attribution_days'] ?? 30 ) ) );
			$settings['minimum_withdrawal'] = max( 100, (float) wc_format_decimal( wp_unslash( $_POST['minimum_withdrawal'] ?? '100' ) ) );
			$settings['public_registration'] = isset( $_POST['public_registration'] );
			update_option( self::OPTION, $settings, false );
			wp_safe_redirect( self::admin_redirect_url( array( 'updated' => '1' ) ) );
			exit;
		}
		if ( 'withdrawal' === $action ) {
			global $wpdb;
			$id = absint( $_POST['withdrawal_id'] ?? 0 );
			$status = sanitize_key( wp_unslash( $_POST['withdrawal_status'] ?? '' ) );
			if ( $id > 0 && in_array( $status, array( 'requested', 'in_review', 'paid', 'rejected', 'cancelled' ), true ) ) {
				$reference = sanitize_text_field( wp_unslash( $_POST['payment_reference'] ?? '' ) );
				if ( 'paid' !== $status || '' !== $reference ) {
					$wpdb->update( self::withdrawal_table(), array( 'status' => $status, 'note' => sanitize_textarea_field( wp_unslash( $_POST['withdrawal_note'] ?? '' ) ), 'processed_by' => get_current_user_id(), 'payment_reference' => $reference, 'paid_at' => 'paid' === $status ? current_time( 'mysql', true ) : null, 'updated_at' => current_time( 'mysql', true ) ), array( 'id' => $id ), array( '%s', '%s', '%d', '%s', '%s', '%s' ), array( '%d' ) );
				}
			}
			wp_safe_redirect( self::admin_redirect_url() );
			exit;
		}
		if ( 'commission' === $action ) {
			global $wpdb;
			$id = absint( $_POST['commission_id'] ?? 0 );
			$status = sanitize_key( wp_unslash( $_POST['commission_status'] ?? '' ) );
			if ( $id > 0 && in_array( $status, array( 'pending', 'approved', 'rejected', 'reversed' ), true ) ) {
				$wpdb->update( self::commission_table(), array( 'status' => $status, 'updated_at' => current_time( 'mysql', true ) ), array( 'id' => $id ), array( '%s', '%s' ), array( '%d' ) );
			}
			wp_safe_redirect( self::admin_redirect_url() );
			exit;
		}
		$user_id = isset( $_POST['user_id'] ) ? absint( $_POST['user_id'] ) : 0;
		$status  = isset( $_POST['status'] ) ? sanitize_key( wp_unslash( $_POST['status'] ) ) : 'pending';
		if ( ! get_user_by( 'id', $user_id ) || ! in_array( $status, array( 'pending', 'approved', 'suspended', 'rejected', 'removed' ), true ) ) {
			return;
		}
		self::upsert_affiliate( $user_id, $status, sanitize_key( wp_unslash( $_POST['code'] ?? '' ) ) );
		update_user_meta( $user_id, 'nutzen_affiliate_notes', sanitize_textarea_field( wp_unslash( $_POST['notes'] ?? '' ) ) );
		wp_safe_redirect( self::admin_redirect_url() );
		exit;
	}

	/** @param array<string,string> $extra */
	private static function admin_redirect_url( array $extra = array() ): string {
		$args = array( 'page' => 'nutzen-affiliates' );
		$affiliate_id = absint( $_POST['redirect_affiliate_id'] ?? 0 );
		$view = sanitize_key( wp_unslash( $_POST['redirect_view'] ?? '' ) );
		if ( $affiliate_id > 0 ) $args['affiliate_id'] = (string) $affiliate_id;
		if ( in_array( $view, array( 'settings', 'add' ), true ) ) $args['view'] = $view;
		return add_query_arg( array_merge( $args, $extra ), admin_url( 'admin.php' ) );
	}

	public static function admin_page(): void {
		Nutzen_Affiliate_Admin::render();
		return;
		if ( ! current_user_can( 'manage_woocommerce' ) ) return;
		global $wpdb;
		$status_filter = sanitize_key( wp_unslash( $_GET['affiliate_status'] ?? '' ) );
		$search = sanitize_text_field( wp_unslash( $_GET['affiliate_search'] ?? '' ) );
		$where = array( '1=1' );
		$args = array();
		if ( in_array( $status_filter, array( 'pending', 'approved', 'suspended', 'rejected', 'removed' ), true ) ) { $where[] = 'a.status=%s'; $args[] = $status_filter; }
		if ( '' !== $search ) { $where[] = '(u.display_name LIKE %s OR u.user_email LIKE %s OR a.code LIKE %s)'; $like = '%' . $wpdb->esc_like( $search ) . '%'; array_push( $args, $like, $like, $like ); }
		$sql = 'SELECT a.*,u.user_email,u.display_name FROM ' . self::affiliate_table() . ' a LEFT JOIN ' . $wpdb->users . ' u ON u.ID=a.user_id WHERE ' . implode( ' AND ', $where ) . ' ORDER BY a.id DESC LIMIT 100';
		$rows = $wpdb->get_results( $args ? $wpdb->prepare( $sql, ...$args ) : $sql, ARRAY_A );
		$commissions = $wpdb->get_results( 'SELECT c.*,a.user_id,u.user_email,u.display_name FROM ' . self::commission_table() . ' c LEFT JOIN ' . self::affiliate_table() . ' a ON a.id=c.affiliate_id LEFT JOIN ' . $wpdb->users . ' u ON u.ID=a.user_id ORDER BY c.id DESC LIMIT 100', ARRAY_A );
		$withdrawals = $wpdb->get_results( 'SELECT w.*,a.user_id,u.user_email,u.display_name FROM ' . self::withdrawal_table() . ' w LEFT JOIN ' . self::affiliate_table() . ' a ON a.id=w.affiliate_id LEFT JOIN ' . $wpdb->users . ' u ON u.ID=a.user_id ORDER BY w.id DESC LIMIT 100', ARRAY_A );
		$affiliate_metrics = array(
			'approved'    => (int) $wpdb->get_var( "SELECT COUNT(*) FROM " . self::affiliate_table() . " WHERE status='approved'" ),
			'pending'     => (int) $wpdb->get_var( "SELECT COUNT(*) FROM " . self::affiliate_table() . " WHERE status='pending'" ),
			'commissions' => (float) $wpdb->get_var( "SELECT COALESCE(SUM(commission_amount),0) FROM " . self::commission_table() . " WHERE status='approved'" ),
			'withdrawals' => (int) $wpdb->get_var( "SELECT COUNT(*) FROM " . self::withdrawal_table() . " WHERE status IN ('requested','in_review')" ),
		);
		$settings = self::settings();
		$customers = get_users( array( 'number' => 200, 'orderby' => 'display_name', 'order' => 'ASC', 'fields' => array( 'ID', 'display_name', 'user_email' ) ) );
		?>
		<div class="wrap nutzen-admin">
			<section class="nutzen-admin-hero"><div><span class="nutzen-kicker">PROGRAMA COMERCIAL</span><h1>Afiliados e saques</h1><p>Aprove participantes, edite códigos e acompanhe solicitações de recebimento.</p></div><a class="button" href="<?php echo esc_url( admin_url( 'edit.php?post_type=nutzen_application' ) ); ?>">Ver candidaturas</a></section>
			<div class="nutzen-stat-grid"><article><strong><?php echo esc_html( number_format_i18n( $affiliate_metrics['approved'] ) ); ?></strong><span>afiliados ativos</span></article><article><strong><?php echo esc_html( number_format_i18n( $affiliate_metrics['pending'] ) ); ?></strong><span>cadastros pendentes</span></article><article><strong><?php echo wp_kses_post( wc_price( $affiliate_metrics['commissions'] ) ); ?></strong><span>comissões aprovadas</span></article><article><strong><?php echo esc_html( number_format_i18n( $affiliate_metrics['withdrawals'] ) ); ?></strong><span>saques em atendimento</span></article></div>
			<form method="get" class="nutzen-admin-filter"><input type="hidden" name="page" value="nutzen-affiliates"><input type="search" name="affiliate_search" value="<?php echo esc_attr( $search ); ?>" placeholder="Buscar nome, e-mail ou código"><select name="affiliate_status"><option value="">Todos os status</option><?php foreach ( array( 'pending' => 'Pendente', 'approved' => 'Aprovado', 'suspended' => 'Suspenso', 'rejected' => 'Rejeitado', 'removed' => 'Removido' ) as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $status_filter, $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select><button class="button button-primary">Filtrar</button><a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=nutzen-affiliates' ) ); ?>">Limpar</a></form>
			<div class="nutzen-admin-columns">
				<form method="post" class="nutzen-settings-card"><?php wp_nonce_field( 'nutzen_affiliate_admin' ); ?><input type="hidden" name="nutzen_affiliate_action" value="save"><h2>Adicionar afiliado</h2><div class="nutzen-form-grid"><label><span>Usuário</span><select name="user_id" required><option value="">Selecione</option><?php foreach ( $customers as $customer ) : ?><option value="<?php echo (int) $customer->ID; ?>"><?php echo esc_html( $customer->display_name . ' · ' . $customer->user_email ); ?></option><?php endforeach; ?></select></label><label><span>Status</span><select name="status"><option value="pending">Pendente</option><option value="approved">Aprovado</option><option value="suspended">Suspenso</option><option value="rejected">Rejeitado</option></select></label><label><span>Código personalizado</span><input name="code" placeholder="Gerado automaticamente"></label><label class="is-wide"><span>Observações internas</span><textarea name="notes" rows="3"></textarea></label></div><?php submit_button( 'Salvar afiliado' ); ?><p class="description">A chave PIX é cadastrada pelo afiliado no painel seguro e armazenada criptografada.</p></form>
				<form method="post" class="nutzen-settings-card"><?php wp_nonce_field( 'nutzen_affiliate_admin' ); ?><input type="hidden" name="nutzen_affiliate_action" value="settings"><h2>Regras do programa</h2><div class="nutzen-form-grid"><label><span>Dias de atribuição</span><input type="number" min="1" max="365" name="attribution_days" value="<?php echo esc_attr( $settings['attribution_days'] ); ?>"></label><label><span>Saque mínimo (R$)</span><input type="number" min="100" step="0.01" name="minimum_withdrawal" value="<?php echo esc_attr( $settings['minimum_withdrawal'] ); ?>"></label><label class="is-wide"><input type="checkbox" name="public_registration" value="1" <?php checked( ! empty( $settings['public_registration'] ) ); ?>> Aceitar candidaturas pelo frontend</label></div><?php submit_button( 'Salvar regras' ); ?></form>
			</div>
			<h2>Participantes</h2><div class="nutzen-table-wrap"><table class="widefat striped"><thead><tr><th>Usuário</th><th>Código</th><th>Status</th><th>PIX</th><th>Ações</th></tr></thead><tbody><?php foreach ( $rows as $row ) : $form_id = 'nutzen-affiliate-' . (int) $row['id']; ?><tr><td><form id="<?php echo esc_attr( $form_id ); ?>" method="post"><?php wp_nonce_field( 'nutzen_affiliate_admin' ); ?><input type="hidden" name="nutzen_affiliate_action" value="save"><input type="hidden" name="user_id" value="<?php echo (int) $row['user_id']; ?>"></form><strong><?php echo esc_html( $row['display_name'] ); ?></strong><br><small><?php echo esc_html( $row['user_email'] ); ?></small></td><td><input form="<?php echo esc_attr( $form_id ); ?>" name="code" value="<?php echo esc_attr( $row['code'] ); ?>"></td><td><select form="<?php echo esc_attr( $form_id ); ?>" name="status"><?php foreach ( array( 'pending' => 'Pendente', 'approved' => 'Aprovado', 'suspended' => 'Suspenso', 'rejected' => 'Rejeitado', 'removed' => 'Removido' ) as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $row['status'], $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select></td><td><?php echo $row['pix_key_last4'] ? esc_html( strtoupper( $row['pix_key_type'] ) . ' · •••• ' . $row['pix_key_last4'] ) : '<em>Não cadastrado</em>'; ?><input form="<?php echo esc_attr( $form_id ); ?>" type="hidden" name="notes" value="<?php echo esc_attr( get_user_meta( $row['user_id'], 'nutzen_affiliate_notes', true ) ); ?>"></td><td><button form="<?php echo esc_attr( $form_id ); ?>" class="button button-primary">Salvar</button> <a class="button" href="<?php echo esc_url( get_edit_user_link( $row['user_id'] ) ); ?>">Usuário</a></td></tr><?php endforeach; ?></tbody></table></div>
			<?php Nutzen_Affiliate_Portal::admin_summary(); ?>
			<h2>Comissões</h2><div class="nutzen-table-wrap"><table class="widefat striped"><thead><tr><th>Pedido</th><th>Afiliado</th><th>Produto</th><th>Base</th><th>Comissão</th><th>Status</th></tr></thead><tbody><?php if ( ! $commissions ) : ?><tr><td colspan="6">Nenhuma comissão registrada.</td></tr><?php endif; foreach ( $commissions as $commission ) : $order = wc_get_order( (int) $commission['order_id'] ); $product = wc_get_product( (int) ( $commission['variation_id'] ?: $commission['product_id'] ) ); ?><tr><td><a href="<?php echo esc_url( $order ? $order->get_edit_order_url() : '#' ); ?>">#<?php echo esc_html( $order ? $order->get_order_number() : $commission['order_id'] ); ?></a></td><td><strong><?php echo esc_html( $commission['display_name'] ?: 'Usuário removido' ); ?></strong><br><small><?php echo esc_html( $commission['user_email'] ); ?></small></td><td><?php echo esc_html( $product ? $product->get_name() : 'Produto indisponível' ); ?><br><small><?php echo esc_html( (float) $commission['quantity'] . ' unidade(s)' ); ?></small></td><td><?php echo wp_kses_post( wc_price( $commission['calculation_base'] ) ); ?></td><td><strong><?php echo wp_kses_post( wc_price( $commission['commission_amount'] ) ); ?></strong><br><small><?php echo esc_html( 'percentage' === $commission['commission_type'] ? $commission['commission_rate'] . '%' : 'R$ ' . $commission['commission_rate'] . ' por unidade' ); ?></small></td><td><form method="post" class="nutzen-inline-form"><?php wp_nonce_field( 'nutzen_affiliate_admin' ); ?><input type="hidden" name="nutzen_affiliate_action" value="commission"><input type="hidden" name="commission_id" value="<?php echo (int) $commission['id']; ?>"><select name="commission_status"><?php foreach ( array( 'pending' => 'Pendente', 'approved' => 'Aprovada', 'rejected' => 'Rejeitada', 'reversed' => 'Estornada' ) as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $commission['status'], $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select><button class="button">Atualizar</button></form></td></tr><?php endforeach; ?></tbody></table></div>
			<h2>Chamados de saque</h2><div class="nutzen-table-wrap"><table class="widefat striped"><thead><tr><th>Ticket</th><th>Afiliado / PIX</th><th>Valor</th><th>Solicitado</th><th>Status e atendimento</th></tr></thead><tbody><?php if ( ! $withdrawals ) : ?><tr><td colspan="5">Nenhuma solicitação de saque.</td></tr><?php endif; foreach ( $withdrawals as $withdrawal ) : ?><tr><td><code><?php echo esc_html( $withdrawal['ticket_number'] ); ?></code></td><td><?php echo esc_html( $withdrawal['display_name'] . ' · ' . $withdrawal['user_email'] ); ?><br><small><?php echo $withdrawal['pix_snapshot_last4'] ? esc_html( 'PIX •••• ' . $withdrawal['pix_snapshot_last4'] ) : 'PIX não informado'; ?></small></td><td><strong><?php echo wp_kses_post( wc_price( $withdrawal['amount'] ) ); ?></strong></td><td><?php echo esc_html( $withdrawal['created_at'] ); ?></td><td><form method="post" class="nutzen-inline-form"><?php wp_nonce_field( 'nutzen_affiliate_admin' ); ?><input type="hidden" name="nutzen_affiliate_action" value="withdrawal"><input type="hidden" name="withdrawal_id" value="<?php echo (int) $withdrawal['id']; ?>"><select name="withdrawal_status"><?php foreach ( array( 'requested' => 'Solicitado', 'in_review' => 'Em análise', 'paid' => 'Pago', 'rejected' => 'Rejeitado', 'cancelled' => 'Cancelado' ) as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $withdrawal['status'], $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select><input name="withdrawal_note" value="<?php echo esc_attr( $withdrawal['note'] ); ?>" placeholder="Observação"><input name="payment_reference" value="<?php echo esc_attr( $withdrawal['payment_reference'] ); ?>" placeholder="Comprovante / referência para marcar pago"><button class="button">Atualizar</button></form></td></tr><?php endforeach; ?></tbody></table></div>
		</div>
		<?php
	}
}

Nutzen_Affiliates_Plugin::bootstrap();
