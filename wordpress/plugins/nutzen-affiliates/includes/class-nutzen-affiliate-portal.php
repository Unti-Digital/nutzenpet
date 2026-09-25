<?php
/**
 * Campaign links, click attribution and payout profiles for Nutzen Affiliates.
 *
 * @package NutzenAffiliates
 */

defined( 'ABSPATH' ) || exit;

final class Nutzen_Affiliate_Portal {
	private const LINK_COOKIE = 'nutzen_affiliate_link';

	private static function table( string $suffix ): string {
		global $wpdb;
		return $wpdb->prefix . 'nutzen_affiliate_' . $suffix;
	}

	public static function activate(): void {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$charset = $wpdb->get_charset_collate();

		dbDelta( 'CREATE TABLE ' . self::table( 'campaigns' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			affiliate_id bigint(20) unsigned NOT NULL,
			name varchar(160) NOT NULL,
			status varchar(20) NOT NULL DEFAULT 'active',
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY affiliate_status (affiliate_id,status)
		) {$charset};" );

		dbDelta( 'CREATE TABLE ' . self::table( 'links' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			affiliate_id bigint(20) unsigned NOT NULL,
			campaign_id bigint(20) unsigned NOT NULL DEFAULT 0,
			product_id bigint(20) unsigned NOT NULL,
			channel varchar(40) NOT NULL,
			token varchar(64) NOT NULL,
			destination_url varchar(500) NOT NULL,
			status varchar(20) NOT NULL DEFAULT 'active',
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY token (token),
			KEY affiliate_status (affiliate_id,status),
			KEY campaign_id (campaign_id),
			KEY product_id (product_id)
		) {$charset};" );

		dbDelta( 'CREATE TABLE ' . self::table( 'clicks' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			link_id bigint(20) unsigned NOT NULL,
			affiliate_id bigint(20) unsigned NOT NULL,
			dedupe_key char(64) NOT NULL,
			referrer_host varchar(190) NOT NULL DEFAULT '',
			created_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY dedupe_key (dedupe_key),
			KEY affiliate_created (affiliate_id,created_at),
			KEY link_created (link_id,created_at)
		) {$charset};" );

		dbDelta( 'CREATE TABLE ' . self::table( 'attributions' ) . " (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			affiliate_id bigint(20) unsigned NOT NULL,
			link_id bigint(20) unsigned NOT NULL DEFAULT 0,
			campaign_id bigint(20) unsigned NOT NULL DEFAULT 0,
			order_id bigint(20) unsigned NOT NULL,
			order_status varchar(30) NOT NULL,
			order_total decimal(18,4) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY order_id (order_id),
			KEY affiliate_status (affiliate_id,order_status),
			KEY link_id (link_id),
			KEY campaign_id (campaign_id)
		) {$charset};" );

		self::upgrade_existing_tables();
	}

	private static function upgrade_existing_tables(): void {
		global $wpdb;
		$commissions = $wpdb->prefix . 'nutzen_affiliate_commissions';
		$withdrawals = $wpdb->prefix . 'nutzen_affiliate_withdrawals';
		$affiliates  = $wpdb->prefix . 'nutzen_affiliates';

		foreach ( array(
			array( $commissions, 'link_id', "ALTER TABLE {$commissions} ADD link_id bigint(20) unsigned NOT NULL DEFAULT 0 AFTER affiliate_id" ),
			array( $commissions, 'campaign_id', "ALTER TABLE {$commissions} ADD campaign_id bigint(20) unsigned NOT NULL DEFAULT 0 AFTER link_id" ),
			array( $affiliates, 'pix_key_type', "ALTER TABLE {$affiliates} ADD pix_key_type varchar(20) NOT NULL DEFAULT '' AFTER status" ),
			array( $affiliates, 'pix_key_encrypted', "ALTER TABLE {$affiliates} ADD pix_key_encrypted longtext NOT NULL AFTER pix_key_type" ),
			array( $affiliates, 'pix_key_last4', "ALTER TABLE {$affiliates} ADD pix_key_last4 varchar(12) NOT NULL DEFAULT '' AFTER pix_key_encrypted" ),
			array( $affiliates, 'pix_holder_name', "ALTER TABLE {$affiliates} ADD pix_holder_name varchar(190) NOT NULL DEFAULT '' AFTER pix_key_last4" ),
			array( $affiliates, 'pix_updated_at', "ALTER TABLE {$affiliates} ADD pix_updated_at datetime NULL AFTER pix_holder_name" ),
			array( $withdrawals, 'pix_snapshot_encrypted', "ALTER TABLE {$withdrawals} ADD pix_snapshot_encrypted longtext NOT NULL AFTER note" ),
			array( $withdrawals, 'pix_snapshot_last4', "ALTER TABLE {$withdrawals} ADD pix_snapshot_last4 varchar(12) NOT NULL DEFAULT '' AFTER pix_snapshot_encrypted" ),
			array( $withdrawals, 'payment_reference', "ALTER TABLE {$withdrawals} ADD payment_reference varchar(190) NOT NULL DEFAULT '' AFTER processed_by" ),
			array( $withdrawals, 'paid_at', "ALTER TABLE {$withdrawals} ADD paid_at datetime NULL AFTER payment_reference" ),
		) as $change ) {
			$column = $wpdb->get_var( $wpdb->prepare( "SHOW COLUMNS FROM {$change[0]} LIKE %s", $change[1] ) );
			if ( ! $column ) {
				$wpdb->query( $change[2] ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- Static schema migration.
			}
		}
	}

	public static function register_routes(): void {
		register_rest_route( 'nutzen/v1', '/affiliate/dashboard', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'rest_dashboard' ), 'permission_callback' => array( 'Nutzen_Affiliates_Plugin', 'rest_permission' ) ) );
		register_rest_route( 'nutzen/v1', '/affiliate/campaigns', array( 'methods' => array( 'GET', 'POST' ), 'callback' => array( __CLASS__, 'rest_campaigns' ), 'permission_callback' => array( 'Nutzen_Affiliates_Plugin', 'rest_permission' ) ) );
		register_rest_route( 'nutzen/v1', '/affiliate/links', array( 'methods' => array( 'GET', 'POST' ), 'callback' => array( __CLASS__, 'rest_links' ), 'permission_callback' => array( 'Nutzen_Affiliates_Plugin', 'rest_permission' ) ) );
		register_rest_route( 'nutzen/v1', '/affiliate/pix', array( 'methods' => array( 'GET', 'POST' ), 'callback' => array( __CLASS__, 'rest_pix' ), 'permission_callback' => array( 'Nutzen_Affiliates_Plugin', 'rest_permission' ) ) );
	}

	/** @return array<string,mixed>|null */
	private static function current_affiliate(): ?array {
		global $wpdb;
		$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . $wpdb->prefix . 'nutzen_affiliates WHERE user_id=%d AND status=%s', get_current_user_id(), 'approved' ), ARRAY_A );
		return is_array( $row ) ? $row : null;
	}

	/** @return array<string,mixed>|null */
	private static function link_by_token( string $token, int $affiliate_id = 0 ): ?array {
		global $wpdb;
		$sql  = 'SELECT * FROM ' . self::table( 'links' ) . ' WHERE token=%s AND status=%s';
		$args = array( $token, 'active' );
		if ( $affiliate_id > 0 ) {
			$sql   .= ' AND affiliate_id=%d';
			$args[] = $affiliate_id;
		}
		$row = $wpdb->get_row( $wpdb->prepare( $sql, ...$args ), ARRAY_A );
		return is_array( $row ) ? $row : null;
	}

	/** @return array<string,mixed> */
	public static function track( string $code, string $token, WP_REST_Request $request ): array {
		global $wpdb;
		$result = array( 'link_id' => 0, 'campaign_id' => 0 );
		if ( '' === $token ) {
			return $result;
		}
		$affiliate_id = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . $wpdb->prefix . 'nutzen_affiliates WHERE code=%s AND status=%s', $code, 'approved' ) );
		$link = self::link_by_token( $token, $affiliate_id );
		if ( ! $link ) {
			return $result;
		}
		$ip       = sanitize_text_field( (string) ( $_SERVER['REMOTE_ADDR'] ?? '' ) );
		$agent    = sanitize_text_field( (string) ( $_SERVER['HTTP_USER_AGENT'] ?? '' ) );
		$bucket   = (string) floor( time() / ( 30 * MINUTE_IN_SECONDS ) );
		$dedupe   = hash_hmac( 'sha256', $link['id'] . '|' . $ip . '|' . $agent . '|' . $bucket, wp_salt( 'nonce' ) );
		$referrer = wp_parse_url( (string) $request->get_header( 'referer' ), PHP_URL_HOST );
		$wpdb->query( $wpdb->prepare( 'INSERT IGNORE INTO ' . self::table( 'clicks' ) . ' (link_id,affiliate_id,dedupe_key,referrer_host,created_at) VALUES (%d,%d,%s,%s,%s)', $link['id'], $affiliate_id, $dedupe, sanitize_text_field( (string) $referrer ), current_time( 'mysql', true ) ) );
		return array( 'link_id' => (int) $link['id'], 'campaign_id' => (int) $link['campaign_id'] );
	}

	public static function attach_to_order( WC_Order $order ): void {
		if ( empty( $_COOKIE[ self::LINK_COOKIE ] ) ) {
			return;
		}
		$affiliate_id = (int) $order->get_meta( '_nutzen_affiliate_id', true );
		$link = self::link_by_token( sanitize_key( wp_unslash( $_COOKIE[ self::LINK_COOKIE ] ) ), $affiliate_id );
		if ( ! $link ) {
			return;
		}
		$order->update_meta_data( '_nutzen_affiliate_link_id', (int) $link['id'] );
		$order->update_meta_data( '_nutzen_affiliate_campaign_id', (int) $link['campaign_id'] );
	}

	public static function record_attribution( WC_Order $order, string $status = '' ): void {
		global $wpdb;
		$affiliate_id = (int) $order->get_meta( '_nutzen_affiliate_id', true );
		if ( $affiliate_id <= 0 ) {
			return;
		}
		$now = current_time( 'mysql', true );
		$wpdb->query( $wpdb->prepare( 'INSERT INTO ' . self::table( 'attributions' ) . ' (affiliate_id,link_id,campaign_id,order_id,order_status,order_total,created_at,updated_at) VALUES (%d,%d,%d,%d,%s,%f,%s,%s) ON DUPLICATE KEY UPDATE order_status=VALUES(order_status),order_total=VALUES(order_total),updated_at=VALUES(updated_at)', $affiliate_id, (int) $order->get_meta( '_nutzen_affiliate_link_id', true ), (int) $order->get_meta( '_nutzen_affiliate_campaign_id', true ), $order->get_id(), $status ?: $order->get_status(), (float) $order->get_total(), $now, $now ) );
	}

	public static function rest_campaigns( WP_REST_Request $request ) {
		global $wpdb;
		$affiliate = self::current_affiliate();
		if ( 'POST' === $request->get_method() ) {
			$name = sanitize_text_field( (string) $request->get_param( 'name' ) );
			if ( mb_strlen( $name ) < 2 || mb_strlen( $name ) > 160 ) {
				return new WP_Error( 'nutzen_campaign_name', 'Informe um nome de campanha válido.', array( 'status' => 400 ) );
			}
			$now = current_time( 'mysql', true );
			$wpdb->insert( self::table( 'campaigns' ), array( 'affiliate_id' => $affiliate['id'], 'name' => $name, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now ), array( '%d', '%s', '%s', '%s', '%s' ) );
			return new WP_REST_Response( array( 'id' => (int) $wpdb->insert_id, 'name' => $name, 'status' => 'active' ), 201 );
		}
		$rows = $wpdb->get_results( $wpdb->prepare( 'SELECT id,name,status,created_at FROM ' . self::table( 'campaigns' ) . ' WHERE affiliate_id=%d ORDER BY id DESC', $affiliate['id'] ), ARRAY_A );
		return new WP_REST_Response( array( 'items' => $rows ) );
	}

	public static function rest_links( WP_REST_Request $request ) {
		global $wpdb;
		$affiliate = self::current_affiliate();
		if ( 'POST' === $request->get_method() ) {
			$link_id = absint( $request->get_param( 'link_id' ) );
			$action  = sanitize_key( (string) $request->get_param( 'action' ) );
			if ( $link_id > 0 && in_array( $action, array( 'archive', 'activate' ), true ) ) {
				$status = 'archive' === $action ? 'archived' : 'active';
				$wpdb->update( self::table( 'links' ), array( 'status' => $status, 'updated_at' => current_time( 'mysql', true ) ), array( 'id' => $link_id, 'affiliate_id' => $affiliate['id'] ), array( '%s', '%s' ), array( '%d', '%d' ) );
				return new WP_REST_Response( array( 'id' => $link_id, 'status' => $status ) );
			}

			$product_id = absint( $request->get_param( 'product_id' ) );
			$product    = $product_id ? wc_get_product( $product_id ) : null;
			if ( ! $product || 'publish' !== get_post_status( $product->get_id() ) ) {
				return new WP_Error( 'nutzen_link_product', 'Selecione um produto publicado da loja.', array( 'status' => 400 ) );
			}
			$campaign_id = absint( $request->get_param( 'campaign_id' ) );
			if ( $campaign_id > 0 ) {
				$owned = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . self::table( 'campaigns' ) . ' WHERE id=%d AND affiliate_id=%d AND status=%s', $campaign_id, $affiliate['id'], 'active' ) );
				if ( 1 !== $owned ) {
					return new WP_Error( 'nutzen_link_campaign', 'Campanha inválida.', array( 'status' => 403 ) );
				}
			}
			$channels = array( 'instagram', 'youtube', 'whatsapp', 'site', 'facebook', 'tiktok', 'email', 'other' );
			$channel  = sanitize_key( (string) $request->get_param( 'channel' ) );
			$channel  = in_array( $channel, $channels, true ) ? $channel : 'other';
			$token    = strtolower( wp_generate_password( 20, false, false ) );
			$switch   = wp_parse_args( (array) get_option( 'nutzen_switch_settings', array() ), array( 'frontend_url' => home_url( '/' ) ) );
			$base     = trailingslashit( esc_url_raw( (string) $switch['frontend_url'] ) ?: home_url( '/' ) );
			$target   = $base . 'produto/' . $product->get_slug();
			$now      = current_time( 'mysql', true );
			$wpdb->insert( self::table( 'links' ), array( 'affiliate_id' => $affiliate['id'], 'campaign_id' => $campaign_id, 'product_id' => $product->get_id(), 'channel' => $channel, 'token' => $token, 'destination_url' => $target, 'status' => 'active', 'created_at' => $now, 'updated_at' => $now ), array( '%d', '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%s' ) );
			return new WP_REST_Response( self::format_link( array( 'id' => $wpdb->insert_id, 'campaign_id' => $campaign_id, 'product_id' => $product->get_id(), 'channel' => $channel, 'token' => $token, 'destination_url' => $target, 'status' => 'active', 'created_at' => $now ), $affiliate ), 201 );
		}
		$rows = $wpdb->get_results( $wpdb->prepare( 'SELECT l.*,c.name campaign_name,p.post_title product_name,(SELECT COUNT(*) FROM ' . self::table( 'clicks' ) . ' cl WHERE cl.link_id=l.id) clicks,(SELECT COUNT(*) FROM ' . self::table( 'attributions' ) . ' a WHERE a.link_id=l.id AND a.order_status NOT IN (\'cancelled\',\'failed\',\'refunded\')) orders_count FROM ' . self::table( 'links' ) . ' l LEFT JOIN ' . self::table( 'campaigns' ) . ' c ON c.id=l.campaign_id LEFT JOIN ' . $wpdb->posts . ' p ON p.ID=l.product_id WHERE l.affiliate_id=%d ORDER BY l.id DESC', $affiliate['id'] ), ARRAY_A );
		return new WP_REST_Response( array( 'items' => array_map( static fn( array $row ): array => self::format_link( $row, $affiliate ), $rows ) ) );
	}

	/** @param array<string,mixed> $row @param array<string,mixed> $affiliate @return array<string,mixed> */
	private static function format_link( array $row, array $affiliate ): array {
		$row['id']          = (int) $row['id'];
		$row['campaign_id'] = (int) $row['campaign_id'];
		$row['product_id']  = (int) $row['product_id'];
		$row['clicks']      = (int) ( $row['clicks'] ?? 0 );
		$row['orders_count']= (int) ( $row['orders_count'] ?? 0 );
		$row['url']         = add_query_arg( array( 'ref' => $affiliate['code'], 'nl' => $row['token'] ), $row['destination_url'] );
		unset( $row['affiliate_id'] );
		return $row;
	}

	public static function rest_dashboard(): WP_REST_Response {
		global $wpdb;
		$affiliate = self::current_affiliate();
		$clicks = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . self::table( 'clicks' ) . ' WHERE affiliate_id=%d', $affiliate['id'] ) );
		$orders = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM " . self::table( 'attributions' ) . " WHERE affiliate_id=%d AND order_status NOT IN ('cancelled','failed','refunded')", $affiliate['id'] ) );
		$campaigns = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . self::table( 'campaigns' ) . ' WHERE affiliate_id=%d AND status=%s', $affiliate['id'], 'active' ) );
		$links = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . self::table( 'links' ) . ' WHERE affiliate_id=%d AND status=%s', $affiliate['id'], 'active' ) );
		return new WP_REST_Response( array( 'clicks' => $clicks, 'orders' => $orders, 'conversion_rate' => $clicks > 0 ? round( 100 * $orders / $clicks, 2 ) : 0, 'campaigns' => $campaigns, 'links' => $links ) );
	}

	public static function rest_pix( WP_REST_Request $request ) {
		$affiliate = self::current_affiliate();
		if ( 'POST' === $request->get_method() ) {
			$type   = sanitize_key( (string) $request->get_param( 'type' ) );
			$key    = trim( sanitize_text_field( (string) $request->get_param( 'key' ) ) );
			$holder = sanitize_text_field( (string) $request->get_param( 'holder_name' ) );
			if ( ! in_array( $type, array( 'cpf', 'cnpj', 'email', 'phone', 'random' ), true ) || mb_strlen( $key ) < 5 || mb_strlen( $key ) > 190 || mb_strlen( $holder ) < 2 ) {
				return new WP_Error( 'nutzen_pix_invalid', 'Revise os dados da chave PIX.', array( 'status' => 400 ) );
			}
			self::save_pix( (int) $affiliate['id'], $type, $key, $holder );
			$affiliate = self::current_affiliate();
		}
		return new WP_REST_Response( self::pix_public_data( $affiliate ) );
	}

	private static function save_pix( int $affiliate_id, string $type, string $key, string $holder ): void {
		global $wpdb;
		$wpdb->update( $wpdb->prefix . 'nutzen_affiliates', array( 'pix_key_type' => $type, 'pix_key_encrypted' => self::encrypt( $key ), 'pix_key_last4' => mb_substr( preg_replace( '/\s+/', '', $key ), -4 ), 'pix_holder_name' => $holder, 'pix_updated_at' => current_time( 'mysql', true ), 'updated_at' => current_time( 'mysql', true ) ), array( 'id' => $affiliate_id ), array( '%s', '%s', '%s', '%s', '%s', '%s' ), array( '%d' ) );
	}

	/** @param array<string,mixed> $affiliate @return array<string,mixed> */
	private static function pix_public_data( array $affiliate ): array {
		return array( 'configured' => ! empty( $affiliate['pix_key_encrypted'] ), 'type' => $affiliate['pix_key_type'], 'masked_key' => $affiliate['pix_key_last4'] ? '•••• ' . $affiliate['pix_key_last4'] : '', 'holder_name' => $affiliate['pix_holder_name'], 'updated_at' => $affiliate['pix_updated_at'] );
	}

	public static function pix_snapshot( int $affiliate_id ): array {
		global $wpdb;
		$row = $wpdb->get_row( $wpdb->prepare( 'SELECT pix_key_encrypted,pix_key_last4 FROM ' . $wpdb->prefix . 'nutzen_affiliates WHERE id=%d', $affiliate_id ), ARRAY_A );
		return is_array( $row ) ? $row : array( 'pix_key_encrypted' => '', 'pix_key_last4' => '' );
	}

	public static function decrypt_pix( string $encrypted ): string {
		return self::decrypt( $encrypted );
	}

	private static function encrypt( string $value ): string {
		$key = hash( 'sha256', AUTH_KEY . SECURE_AUTH_KEY, true );
		$iv  = random_bytes( 12 );
		$tag = '';
		$data = openssl_encrypt( $value, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag );
		return base64_encode( $iv . $tag . $data );
	}

	private static function decrypt( string $value ): string {
		$raw = base64_decode( $value, true );
		if ( false === $raw || strlen( $raw ) < 29 ) {
			return '';
		}
		$key = hash( 'sha256', AUTH_KEY . SECURE_AUTH_KEY, true );
		$out = openssl_decrypt( substr( $raw, 28 ), 'aes-256-gcm', $key, OPENSSL_RAW_DATA, substr( $raw, 0, 12 ), substr( $raw, 12, 16 ) );
		return is_string( $out ) ? $out : '';
	}

	public static function admin_summary(): void {
		global $wpdb;
		$clicks = (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . self::table( 'clicks' ) );
		$links  = (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . self::table( 'links' ) );
		$campaigns = (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . self::table( 'campaigns' ) );
		echo '<h2>Links e campanhas</h2><div class="nutzen-stat-grid"><article><strong>' . esc_html( number_format_i18n( $links ) ) . '</strong><span>links rastreáveis</span></article><article><strong>' . esc_html( number_format_i18n( $campaigns ) ) . '</strong><span>campanhas</span></article><article><strong>' . esc_html( number_format_i18n( $clicks ) ) . '</strong><span>cliques válidos</span></article></div>';
	}
}
