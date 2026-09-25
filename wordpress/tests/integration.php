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
$tables = array( 'nutzen_sessions', 'nutzen_affiliates', 'nutzen_affiliate_commissions', 'nutzen_affiliate_withdrawals', 'nutzen_affiliate_campaigns', 'nutzen_affiliate_links', 'nutzen_affiliate_clicks', 'nutzen_affiliate_attributions', 'nutzen_subscriptions', 'nutzen_subscription_events' );
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
nutzen_test( ! empty( $field_data['feeding_guide'] ) && isset( $field_data['feeding_guide'][0]['weight'], $field_data['feeding_guide'][0]['amount'] ), 'Store API field payload contains the editable feeding guide' );
ob_start();
Nutzen_Fields_Plugin::render_meta_box( get_post( $product_id ) );
$fields_admin_html = ob_get_clean();
nutzen_test( str_contains( $fields_admin_html, 'data-nutzen-repeater' ) && str_contains( $fields_admin_html, 'data-nutzen-repeater-value' ), 'nutrition is edited through a repeater while preserving its JSON storage contract' );
nutzen_test( str_contains( $fields_admin_html, 'data-first-key="weight"' ) && str_contains( $fields_admin_html, 'Tabela de quantidade diária' ), 'feeding guide is edited through weight and daily amount rows' );
$administrator = get_users( array( 'role' => 'administrator', 'number' => 1 ) );
if ( $administrator ) {
	wp_set_current_user( $administrator[0]->ID );
	$previous_get = $_GET;
	$_GET = array();
	ob_start();
	Nutzen_Subscription_Admin::render();
	$subscription_admin_html = ob_get_clean();
	$_GET = $previous_get;
	wp_set_current_user( 0 );
	nutzen_test( str_contains( $subscription_admin_html, 'Ver assinante' ) || str_contains( $subscription_admin_html, 'Nenhum assinante encontrado' ), 'subscription admin opens with the subscriber list' );
}

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
$checkout_subscription_id = 0;
$application_id = 0;
$application_user_id = 0;
$subscription_application_id = 0;
$banner_id = 0;
$campaign_id = 0;
$affiliate_link_id = 0;
$plan_id = 0;
$original_product_status = $product->get_status();
$original_subscription_eligible = get_post_meta( $product_id, '_nutzen_subscription_eligible', true );
$original_subscription_plans = get_post_meta( $product_id, '_nutzen_subscription_plan_ids', true );
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
	$track_request = new WP_REST_Request( 'POST', '/nutzen/v1/affiliate/track' );
	$track_request->set_param( 'code', 'test-' . $user_id );
	$track_response = Nutzen_Affiliates_Plugin::rest_track( $track_request );
	nutzen_test( $track_response instanceof WP_REST_Response && true === $track_response->get_data()['valid'], 'approved affiliate referral code is trackable' );
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
	$wpdb->update( $wpdb->prefix . 'nutzen_affiliate_commissions', array( 'commission_amount' => 150, 'status' => 'approved' ), array( 'order_id' => $order_id ), array( '%f', '%s' ), array( '%d' ) );
	wp_set_current_user( $user_id );
	$product->set_status( 'publish' );
	$product->save();
	$campaign_request = new WP_REST_Request( 'POST', '/nutzen/v1/affiliate/campaigns' );
	$campaign_request->set_param( 'name', 'Campanha de integracao' );
	$campaign_response = Nutzen_Affiliate_Portal::rest_campaigns( $campaign_request );
	$campaign_id = $campaign_response instanceof WP_REST_Response ? (int) $campaign_response->get_data()['id'] : 0;
	nutzen_test( $campaign_response instanceof WP_REST_Response && 201 === $campaign_response->get_status() && $campaign_id > 0, 'affiliate creates an owned campaign' );
	$link_request = new WP_REST_Request( 'POST', '/nutzen/v1/affiliate/links' );
	$link_request->set_param( 'product_id', $product_id );
	$link_request->set_param( 'campaign_id', $campaign_id );
	$link_request->set_param( 'channel', 'instagram' );
	$link_response = Nutzen_Affiliate_Portal::rest_links( $link_request );
	$link_data = $link_response instanceof WP_REST_Response ? $link_response->get_data() : array();
	$affiliate_link_id = (int) ( $link_data['id'] ?? 0 );
	nutzen_test( $link_response instanceof WP_REST_Response && 201 === $link_response->get_status() && str_contains( (string) ( $link_data['url'] ?? '' ), 'nl=' ), 'affiliate creates a tracked product link' );
	$order->update_meta_data( '_nutzen_affiliate_link_id', $affiliate_link_id );
	$order->update_meta_data( '_nutzen_affiliate_campaign_id', $campaign_id );
	$order->save();
	Nutzen_Affiliate_Portal::record_attribution( $order, $order->get_status() );
	$_SERVER['REMOTE_ADDR'] = '127.0.0.44';
	$_SERVER['HTTP_USER_AGENT'] = 'Nutzen integration test';
	$link_track = new WP_REST_Request( 'POST', '/nutzen/v1/affiliate/track' );
	$link_track->set_param( 'code', 'test-' . $user_id );
	$link_track->set_param( 'link_token', $link_data['token'] ?? '' );
	Nutzen_Affiliates_Plugin::rest_track( $link_track );
	Nutzen_Affiliates_Plugin::rest_track( $link_track );
	$click_count = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . $wpdb->prefix . 'nutzen_affiliate_clicks WHERE link_id=%d', $affiliate_link_id ) );
	nutzen_test( 1 === $click_count, 'affiliate clicks are deduplicated in the attribution window' );
	$dashboard_data = Nutzen_Affiliate_Portal::rest_dashboard()->get_data();
	nutzen_test( 1 === (int) $dashboard_data['clicks'] && 1 === (int) $dashboard_data['orders'], 'affiliate dashboard uses tracked clicks and attributed orders' );
	$low_withdrawal = new WP_REST_Request( 'POST', '/nutzen/v1/affiliate/withdrawals' );
	$low_withdrawal->set_param( 'amount', 99 );
	$low_response = Nutzen_Affiliates_Plugin::rest_withdrawals( $low_withdrawal );
	nutzen_test( is_wp_error( $low_response ) && 400 === $low_response->get_error_data()['status'], 'withdrawal below R$ 100 is rejected' );
	$missing_pix_request = new WP_REST_Request( 'POST', '/nutzen/v1/affiliate/withdrawals' );
	$missing_pix_request->set_param( 'amount', 100 );
	$missing_pix_response = Nutzen_Affiliates_Plugin::rest_withdrawals( $missing_pix_request );
	nutzen_test( is_wp_error( $missing_pix_response ) && 'nutzen_withdrawal_pix' === $missing_pix_response->get_error_code(), 'withdrawal requires a registered PIX key' );
	$pix_request = new WP_REST_Request( 'POST', '/nutzen/v1/affiliate/pix' );
	$pix_request->set_param( 'type', 'email' );
	$pix_request->set_param( 'key', 'financeiro@nutzen.test' );
	$pix_request->set_param( 'holder_name', 'Afiliado de Integracao' );
	$pix_response = Nutzen_Affiliate_Portal::rest_pix( $pix_request );
	$pix_data = $pix_response instanceof WP_REST_Response ? $pix_response->get_data() : array();
	nutzen_test( ! empty( $pix_data['configured'] ) && ! str_contains( (string) ( $pix_data['masked_key'] ?? '' ), 'financeiro' ), 'PIX is stored and returned only in masked form' );
	$withdrawal_request = new WP_REST_Request( 'POST', '/nutzen/v1/affiliate/withdrawals' );
	$withdrawal_request->set_param( 'amount', 100 );
	$withdrawal_response = Nutzen_Affiliates_Plugin::rest_withdrawals( $withdrawal_request );
	nutzen_test( $withdrawal_response instanceof WP_REST_Response && 201 === $withdrawal_response->get_status(), 'valid withdrawal opens a support ticket' );
	$ticket = $withdrawal_response instanceof WP_REST_Response ? $withdrawal_response->get_data()['ticket_number'] : '';
	nutzen_test( str_starts_with( (string) $ticket, 'NS-' ), 'withdrawal receives a ticket number' );
	Nutzen_Affiliates_Plugin::order_refunded( $order_id );
	$status = $wpdb->get_var( $wpdb->prepare( 'SELECT status FROM ' . $wpdb->prefix . 'nutzen_affiliate_commissions WHERE order_id=%d', $order_id ) );
	nutzen_test( 'reversed' === $status, 'refund reverses pending commission' );

	$_SERVER['REMOTE_ADDR'] = '127.0.0.' . random_int( 10, 240 );
	$application_request = new WP_REST_Request( 'POST', '/nutzen/v1/applications/retailer' );
	$application_request->set_param( 'type', 'retailer' );
	$application_request->set_param( 'name', 'Loja de Integração' );
	$application_request->set_param( 'email', 'lojista-' . time() . '@nutzen.test' );
	$application_request->set_param( 'phone', '+55 11 99999-9999' );
	$application_request->set_param( 'consent', true );
	$application_response = Nutzen_Switch_Plugin::rest_application( $application_request );
	$application_id = $application_response instanceof WP_REST_Response ? (int) $application_response->get_data()['id'] : 0;
	nutzen_test( $application_response instanceof WP_REST_Response && 201 === $application_response->get_status() && $application_id > 0, 'retailer application creates an editable CPT entry' );

	$banner_attachment_id = (int) $product->get_image_id();
	$banner_id = wp_insert_post( array( 'post_type' => 'nutzen_banner', 'post_status' => 'publish', 'post_title' => 'Banner de integração' ), true );
	if ( is_wp_error( $banner_id ) ) throw new RuntimeException( $banner_id->get_error_message() );
	update_post_meta( $banner_id, '_nutzen_banner_desktop_id', $banner_attachment_id );
	update_post_meta( $banner_id, '_nutzen_banner_mobile_id', $banner_attachment_id );
	update_post_meta( $banner_id, '_nutzen_banner_link', '/produto' );
	update_post_meta( $banner_id, '_nutzen_banner_order', 7 );
	$banner_response = Nutzen_Switch_Plugin::rest_banners();
	$banner_items = $banner_response->get_data()['items'] ?? array();
	$banner_matches = array_filter( $banner_items, static fn( array $item ): bool => (int) $item['id'] === (int) $banner_id );
	nutzen_test( $banner_attachment_id > 0 && 1 === count( $banner_matches ), 'published rotating banner is exposed by the public endpoint' );
	$subscription_email = 'club-' . time() . '@nutzen.test';
	$subscription_application = new WP_REST_Request( 'POST', '/nutzen/v1/applications/subscription' );
	$subscription_application->set_param( 'type', 'subscription' );
	$subscription_application->set_param( 'name', 'Cliente do Club' );
	$subscription_application->set_param( 'email', $subscription_email );
	$subscription_application->set_param( 'phone', '+55 11 98888-8888' );
	$subscription_application->set_param( 'password', 'SenhaForte123!' );
	$subscription_application->set_param( 'message', 'Kit de integração mensal' );
	$subscription_application->set_param( 'consent', true );
	$subscription_application_response = Nutzen_Switch_Plugin::rest_application( $subscription_application );
	$subscription_application_data = $subscription_application_response instanceof WP_REST_Response ? $subscription_application_response->get_data() : array();
	$subscription_application_id = (int) ( $subscription_application_data['id'] ?? 0 );
	$application_user = get_user_by( 'email', $subscription_email );
	$application_user_id = $application_user ? (int) $application_user->ID : 0;
	nutzen_test( $subscription_application_response instanceof WP_REST_Response && 201 === $subscription_application_response->get_status() && $application_user_id > 0 && ! empty( $subscription_application_data['token'] ), 'subscription application creates a customer account and session' );

	$plan_id = wp_insert_post( array( 'post_type' => 'nutzen_plan', 'post_status' => 'publish', 'post_title' => 'Plano bimestral de integracao' ), true );
	if ( is_wp_error( $plan_id ) ) throw new RuntimeException( $plan_id->get_error_message() );
	update_post_meta( $plan_id, '_nutzen_interval', 2 );
	update_post_meta( $plan_id, '_nutzen_interval_unit', 'month' );
	update_post_meta( $plan_id, '_nutzen_discount_type', 'percentage' );
	update_post_meta( $plan_id, '_nutzen_discount_value', 5 );
	update_post_meta( $product_id, '_nutzen_subscription_eligible', 'yes' );
	update_post_meta( $product_id, '_nutzen_subscription_plan_ids', array( $plan_id ) );
	$subscription_store_data = Nutzen_Subscriptions_Plugin::store_api_data( $product );
	nutzen_test( ! empty( $subscription_store_data['eligible'] ) && 1 === count( $subscription_store_data['plans'] ), 'Store API exposes only configured subscription plans for the product' );
	$cart_request = new WP_REST_Request( 'POST', '/wc/store/v1/cart/add-item' );
	$cart_request->set_param( 'extensions', array( 'nutzen-subscriptions' => array( 'purchase_type' => 'subscription', 'plan_id' => $plan_id ) ) );
	$cart_data = Nutzen_Subscriptions_Plugin::store_api_add_to_cart_data( array( 'id' => $product_id, 'quantity' => 1, 'cart_item_data' => array() ), $cart_request );
	$cart_extension = Nutzen_Subscriptions_Plugin::store_api_cart_item_data( $cart_data['cart_item_data'] );
	nutzen_test( 'subscription' === $cart_extension['purchase_type'] && (int) $plan_id === $cart_extension['plan_id'] && (float) $cart_extension['unit_total'] < (float) $product->get_price(), 'subscription cart metadata and server-side recurring price are derived from the configured plan' );
	$invalid_plan_blocked = false;
	try {
		$invalid_request = new WP_REST_Request( 'POST', '/wc/store/v1/cart/add-item' );
		$invalid_request->set_param( 'extensions', array( 'nutzen-subscriptions' => array( 'purchase_type' => 'subscription', 'plan_id' => 999999 ) ) );
		Nutzen_Subscriptions_Plugin::store_api_add_to_cart_data( array( 'id' => $product_id, 'quantity' => 1, 'cart_item_data' => array() ), $invalid_request );
	} catch ( Throwable $error ) {
		$invalid_plan_blocked = str_contains( $error->getMessage(), 'plano' );
	}
	nutzen_test( $invalid_plan_blocked, 'subscription cart rejects plans that are not assigned to the product' );
	$wpdb->insert( $wpdb->prefix . 'nutzen_subscriptions', array( 'user_id' => $user_id, 'plan_id' => 0, 'product_id' => $product_id, 'variation_id' => 0, 'quantity' => 1, 'interval_value' => 1, 'interval_unit' => 'month', 'discount_type' => 'percentage', 'discount_value' => 0, 'status' => 'active', 'start_date' => $now, 'next_charge_date' => null, 'last_order_id' => 0, 'created_at' => $now, 'updated_at' => $now ) );
	$subscription_id = (int) $wpdb->insert_id;
	wp_set_current_user( $user_id );
	$frequency_request = new WP_REST_Request( 'POST', "/nutzen/v1/subscription/{$subscription_id}/frequency" );
	$frequency_request->set_param( 'id', $subscription_id );
	$frequency_request->set_param( 'plan_id', $plan_id );
	$frequency_response = Nutzen_Subscriptions_Plugin::rest_frequency( $frequency_request );
	nutzen_test( $frequency_response instanceof WP_REST_Response && 'pending_gateway' === $frequency_response->get_data()['status'], 'frequency change is recorded without simulating a renewal charge' );
	$wpdb->update( $wpdb->prefix . 'nutzen_subscriptions', array( 'status' => 'active' ), array( 'id' => $subscription_id ), array( '%s' ), array( '%d' ) );
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
	if ( $checkout_subscription_id ) {
		$wpdb->delete( $wpdb->prefix . 'nutzen_subscription_events', array( 'subscription_id' => $checkout_subscription_id ), array( '%d' ) );
		$wpdb->delete( $wpdb->prefix . 'nutzen_subscriptions', array( 'id' => $checkout_subscription_id ), array( '%d' ) );
	}
	if ( $order_id ) {
		$wpdb->delete( $wpdb->prefix . 'nutzen_affiliate_withdrawals', array( 'affiliate_id' => $affiliate_id ), array( '%d' ) );
		$wpdb->delete( $wpdb->prefix . 'nutzen_affiliate_commissions', array( 'order_id' => $order_id ), array( '%d' ) );
		$order = wc_get_order( $order_id );
		if ( $order ) $order->delete( true );
	}
	if ( $affiliate_id ) $wpdb->delete( $wpdb->prefix . 'nutzen_affiliates', array( 'id' => $affiliate_id ), array( '%d' ) );
	if ( $affiliate_link_id ) {
		$wpdb->delete( $wpdb->prefix . 'nutzen_affiliate_clicks', array( 'link_id' => $affiliate_link_id ), array( '%d' ) );
		$wpdb->delete( $wpdb->prefix . 'nutzen_affiliate_attributions', array( 'link_id' => $affiliate_link_id ), array( '%d' ) );
		$wpdb->delete( $wpdb->prefix . 'nutzen_affiliate_links', array( 'id' => $affiliate_link_id ), array( '%d' ) );
	}
	if ( $campaign_id ) $wpdb->delete( $wpdb->prefix . 'nutzen_affiliate_campaigns', array( 'id' => $campaign_id ), array( '%d' ) );
	if ( $application_id ) wp_delete_post( $application_id, true );
	if ( $banner_id && ! is_wp_error( $banner_id ) ) wp_delete_post( (int) $banner_id, true );
	if ( $subscription_application_id ) wp_delete_post( $subscription_application_id, true );
	if ( $plan_id && ! is_wp_error( $plan_id ) ) wp_delete_post( (int) $plan_id, true );
	if ( $application_user_id ) {
		$wpdb->delete( $wpdb->prefix . 'nutzen_sessions', array( 'user_id' => $application_user_id ), array( '%d' ) );
		wp_delete_user( $application_user_id );
	}
	if ( $user_id ) wp_delete_user( $user_id );
	if ( $product ) {
		$product->set_status( $original_product_status );
		$product->save();
	}
	if ( '' === $original_subscription_eligible ) delete_post_meta( $product_id, '_nutzen_subscription_eligible' ); else update_post_meta( $product_id, '_nutzen_subscription_eligible', $original_subscription_eligible );
	if ( '' === $original_subscription_plans ) delete_post_meta( $product_id, '_nutzen_subscription_plan_ids' ); else update_post_meta( $product_id, '_nutzen_subscription_plan_ids', $original_subscription_plans );
	foreach ( $original_meta as $key => $value ) {
		$meta_key = '_nutzen_affiliate_' . $key;
		if ( '' === $value ) delete_post_meta( $product_id, $meta_key ); else update_post_meta( $product_id, $meta_key, $value );
	}
}

echo "RESULT passed={$passed} failed={$failed}\n";
exit( $failed > 0 ? 1 : 0 );
