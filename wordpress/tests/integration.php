<?php
/**
 * Integration checks for the Nutzen WordPress plugins.
 *
 * Usage:
 * php integration.php --wp=C:/xampp/htdocs/nutzen-wp
 */

if ( PHP_SAPI !== 'cli' ) exit( "CLI only.\n" );
$options = getopt( '', array( 'wp:' ) );
$wp_root = isset( $options['wp'] ) ? rtrim( $options['wp'], '/\\' ) : '';
if ( ! is_file( $wp_root . '/wp-load.php' ) ) exit( "Invalid --wp path.\n" );

define( 'WP_USE_THEMES', false );
require $wp_root . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';
require_once ABSPATH . 'wp-admin/includes/user.php';

$passed = 0;
$failed = 0;

function nutzen_test( bool $condition, string $label ): void {
	global $passed, $failed;
	if ( $condition ) {
		++$passed;
		echo "PASS {$label}\n";
	} else {
		++$failed;
		echo "FAIL {$label}\n";
	}
}

$plugins = array( 'nutzen-fields/nutzen-fields.php', 'nutzen-switch/nutzen-switch.php', 'nutzen-affiliates/nutzen-affiliates.php', 'nutzen-subscriptions/nutzen-subscriptions.php' );
foreach ( $plugins as $plugin ) nutzen_test( is_plugin_active( $plugin ), "plugin active: {$plugin}" );

global $wpdb;
$tables = array( 'nutzen_sessions', 'nutzen_affiliates', 'nutzen_affiliate_commissions', 'nutzen_subscriptions', 'nutzen_subscription_events' );
foreach ( $tables as $suffix ) {
	$table = $wpdb->prefix . $suffix;
	nutzen_test( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) === $table, "table exists: {$suffix}" );
}

$imported_products = get_posts( array( 'post_type' => 'product', 'post_status' => array( 'publish', 'draft', 'private', 'pending' ), 'numberposts' => -1, 'meta_key' => '_nutzen_import_key', 'fields' => 'ids' ) );
nutzen_test( 9 === count( $imported_products ), 'nine imported products' );
$product_id = (int) reset( $imported_products );
$product    = wc_get_product( $product_id );
nutzen_test( $product instanceof WC_Product, 'imported product loads through WooCommerce' );
nutzen_test( '' !== get_post_meta( $product_id, '_nutzen_ingredients', true ), 'technical ingredients imported' );
$field_data = Nutzen_Fields_Plugin::store_api_data( $product );
nutzen_test( ! empty( $field_data['nutrition'] ) && ! empty( $field_data['benefits'] ), 'Store API field payload contains nutrition and benefits' );

nutzen_test( 10.0 === Nutzen_Affiliates_Plugin::calculate_commission( 100.0, 2.0, 'percentage', 10.0 ), 'percentage commission calculation' );
nutzen_test( 10.0 === Nutzen_Affiliates_Plugin::calculate_commission( 100.0, 2.0, 'fixed', 5.0 ), 'fixed commission calculation' );
wp_set_current_user( 0 );
unset( $_SERVER['HTTP_AUTHORIZATION'] );
nutzen_test( false === Nutzen_Affiliates_Plugin::rest_permission(), 'affiliate endpoint rejects unauthenticated request' );
nutzen_test( false === Nutzen_Subscriptions_Plugin::customer_permission(), 'subscription endpoint rejects unauthenticated request' );

$user_id      = 0;
$affiliate_id = 0;
$order_id     = 0;
$subscription_id = 0;
$original_meta = array(
	'enabled' => get_post_meta( $product_id, '_nutzen_affiliate_enabled', true ),
	'type'    => get_post_meta( $product_id, '_nutzen_affiliate_type', true ),
	'value'   => get_post_meta( $product_id, '_nutzen_affiliate_value', true ),
);

try {
	$user_id = wp_create_user( 'nutzen-integration-' . time(), wp_generate_password( 24 ), 'integration-' . time() . '@nutzen.test' );
	if ( is_wp_error( $user_id ) ) throw new RuntimeException( $user_id->get_error_message() );
	$now = current_time( 'mysql', true );
	$wpdb->insert( $wpdb->prefix . 'nutzen_affiliates', array( 'user_id' => $user_id, 'code' => 'test-' . $user_id, 'status' => 'approved', 'created_at' => $now, 'updated_at' => $now ), array( '%d', '%s', '%s', '%s', '%s' ) );
	$affiliate_id = (int) $wpdb->insert_id;
	update_post_meta( $product_id, '_nutzen_affiliate_enabled', 'yes' );
	update_post_meta( $product_id, '_nutzen_affiliate_type', 'percentage' );
	update_post_meta( $product_id, '_nutzen_affiliate_value', '10' );

	$order = wc_create_order( array( 'customer_id' => $user_id ) );
	if ( is_wp_error( $order ) ) throw new RuntimeException( $order->get_error_message() );
	$order->add_product( $product, 2 );
	$order->update_meta_data( '_nutzen_affiliate_id', $affiliate_id );
	$order->calculate_totals();
	$order->save();
	$order_id = $order->get_id();
	Nutzen_Affiliates_Plugin::record_commissions( $order );
	Nutzen_Affiliates_Plugin::record_commissions( $order );
	$count = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . $wpdb->prefix . 'nutzen_affiliate_commissions WHERE order_id=%d', $order_id ) );
	nutzen_test( 1 === $count, 'commission recording is idempotent per order item' );
	Nutzen_Affiliates_Plugin::order_refunded( $order_id );
	$status = $wpdb->get_var( $wpdb->prepare( 'SELECT status FROM ' . $wpdb->prefix . 'nutzen_affiliate_commissions WHERE order_id=%d', $order_id ) );
	nutzen_test( 'reversed' === $status, 'refund reverses pending commission' );

	$wpdb->insert( $wpdb->prefix . 'nutzen_subscriptions', array( 'user_id' => $user_id, 'plan_id' => 0, 'product_id' => $product_id, 'variation_id' => 0, 'quantity' => 1, 'interval_value' => 1, 'interval_unit' => 'month', 'discount_type' => 'percentage', 'discount_value' => 0, 'status' => 'active', 'start_date' => $now, 'next_charge_date' => null, 'last_order_id' => 0, 'created_at' => $now, 'updated_at' => $now ) );
	$subscription_id = (int) $wpdb->insert_id;
	wp_set_current_user( $user_id );
	$request = new WP_REST_Request( 'POST', "/nutzen/v1/subscription/{$subscription_id}/pause" );
	$request->set_param( 'id', $subscription_id );
	$request->set_param( 'action', 'pause' );
	$response = Nutzen_Subscriptions_Plugin::rest_transition( $request );
	nutzen_test( $response instanceof WP_REST_Response && 'paused' === $response->get_data()['status'], 'valid subscription status transition' );
	$repeat = Nutzen_Subscriptions_Plugin::rest_transition( $request );
	nutzen_test( is_wp_error( $repeat ) && 409 === $repeat->get_error_data()['status'], 'invalid repeated transition is blocked' );
	wp_set_current_user( 0 );
	$foreign = Nutzen_Subscriptions_Plugin::rest_transition( $request );
	nutzen_test( is_wp_error( $foreign ) && 404 === $foreign->get_error_data()['status'], 'subscription ownership is enforced' );
} catch ( Throwable $error ) {
	nutzen_test( false, 'integration setup: ' . $error->getMessage() );
} finally {
	wp_set_current_user( 0 );
	if ( $subscription_id ) {
		$wpdb->delete( $wpdb->prefix . 'nutzen_subscription_events', array( 'subscription_id' => $subscription_id ), array( '%d' ) );
		$wpdb->delete( $wpdb->prefix . 'nutzen_subscriptions', array( 'id' => $subscription_id ), array( '%d' ) );
	}
	if ( $order_id ) {
		$wpdb->delete( $wpdb->prefix . 'nutzen_affiliate_commissions', array( 'order_id' => $order_id ), array( '%d' ) );
		$order = wc_get_order( $order_id );
		if ( $order ) $order->delete( true );
	}
	if ( $affiliate_id ) $wpdb->delete( $wpdb->prefix . 'nutzen_affiliates', array( 'id' => $affiliate_id ), array( '%d' ) );
	if ( $user_id ) wp_delete_user( $user_id );
	foreach ( $original_meta as $key => $value ) {
		$meta_key = '_nutzen_affiliate_' . $key;
		if ( '' === $value ) delete_post_meta( $product_id, $meta_key ); else update_post_meta( $product_id, $meta_key, $value );
	}
}

echo "RESULT passed={$passed} failed={$failed}\n";
exit( $failed > 0 ? 1 : 0 );
