<?php
/**
 * Safe CLI importer for NutzenPet products.
 *
 * Preview:
 * php import-products.php --wp=C:/xampp/htdocs/nutzen-wp --assets=C:/path/to/frontend/public
 *
 * Apply as drafts:
 * php import-products.php --wp=C:/xampp/htdocs/nutzen-wp --assets=C:/path/to/frontend/public --apply
 */

if ( PHP_SAPI !== 'cli' ) {
	exit( "CLI only.\n" );
}

$options = getopt( '', array( 'wp:', 'assets:', 'manifest::', 'apply', 'update', 'publish' ) );
$wp_root = isset( $options['wp'] ) ? rtrim( $options['wp'], '/\\' ) : '';
$assets  = isset( $options['assets'] ) ? rtrim( $options['assets'], '/\\' ) : '';
$manifest = isset( $options['manifest'] ) && is_string( $options['manifest'] )
	? $options['manifest']
	: dirname( __DIR__ ) . '/import/products.json';
$apply   = isset( $options['apply'] );
$update  = isset( $options['update'] );
$publish = isset( $options['publish'] );

if ( ! $wp_root || ! is_file( $wp_root . '/wp-load.php' ) || ! is_dir( $assets ) || ! is_file( $manifest ) ) {
	fwrite( STDERR, "Use --wp, --assets and a valid manifest path.\n" );
	exit( 1 );
}

define( 'WP_USE_THEMES', false );
require $wp_root . '/wp-load.php';

if ( ! class_exists( 'WooCommerce' ) || ! class_exists( 'WC_Product_Simple' ) ) {
	fwrite( STDERR, "WooCommerce is not active.\n" );
	exit( 1 );
}

$products = json_decode( (string) file_get_contents( $manifest ), true );
$lines_file = dirname( $manifest ) . '/product-lines.json';
$lines = is_file( $lines_file ) ? json_decode( (string) file_get_contents( $lines_file ), true ) : array();
if ( ! is_array( $products ) ) {
	fwrite( STDERR, "Invalid product manifest.\n" );
	exit( 1 );
}

if ( $publish && ! $apply ) {
	fwrite( STDERR, "--publish requires --apply.\n" );
	exit( 1 );
}

/** @return int */
function nutzen_import_image( string $file, int $product_id ): int {
	$hash = hash_file( 'sha256', $file );
	$existing = get_posts(
		array(
			'post_type'   => 'attachment',
			'post_status' => 'inherit',
			'numberposts' => 1,
			'meta_key'    => '_nutzen_source_hash',
			'meta_value'  => $hash,
			'fields'      => 'ids',
		)
	);
	if ( $existing ) {
		return (int) $existing[0];
	}

	$filename = sanitize_file_name( basename( $file ) );
	$upload   = wp_upload_bits( $filename, null, (string) file_get_contents( $file ) );
	if ( ! empty( $upload['error'] ) ) {
		throw new RuntimeException( $upload['error'] );
	}

	require_once ABSPATH . 'wp-admin/includes/image.php';
	$attachment_id = wp_insert_attachment(
		array( 'post_mime_type' => wp_check_filetype( $upload['file'] )['type'], 'post_title' => pathinfo( $filename, PATHINFO_FILENAME ), 'post_status' => 'inherit', 'post_parent' => $product_id ),
		$upload['file'],
		$product_id,
		true
	);
	if ( is_wp_error( $attachment_id ) ) {
		throw new RuntimeException( $attachment_id->get_error_message() );
	}
	wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $upload['file'] ) );
	update_post_meta( $attachment_id, '_nutzen_source_hash', $hash );
	return (int) $attachment_id;
}

$summary = array( 'create' => 0, 'update' => 0, 'skip' => 0, 'errors' => 0 );
foreach ( $products as $row ) {
	$slug = isset( $row['slug'] ) ? sanitize_title( $row['slug'] ) : '';
	if ( ! $slug || empty( $row['name'] ) || ! isset( $row['price'] ) ) {
		++$summary['errors'];
		echo "ERROR invalid row\n";
		continue;
	}

	$existing = get_page_by_path( $slug, OBJECT, 'product' );
	if ( $existing && $update && $slug !== get_post_meta( $existing->ID, '_nutzen_import_key', true ) ) {
		++$summary['errors'];
		echo "ERROR {$slug}: existing product is not owned by the Nutzen importer\n";
		continue;
	}
	$action   = $existing ? ( $update ? 'update' : 'skip' ) : 'create';
	++$summary[ $action ];
	echo strtoupper( $action ) . " {$slug}" . ( $apply && 'skip' !== $action ? "\n" : " (preview)\n" );
	if ( ! $apply || 'skip' === $action ) {
		continue;
	}

	try {
		$product = $existing ? wc_get_product( $existing->ID ) : new WC_Product_Simple();
		if ( ! $product instanceof WC_Product ) {
			throw new RuntimeException( 'Unable to load product.' );
		}
		$product->set_name( sanitize_text_field( $row['name'] ) );
		$product->set_slug( $slug );
		$product->set_status( $publish ? 'publish' : 'draft' );
		$product->set_catalog_visibility( 'visible' );
		$product->set_description( wp_kses_post( $row['description'] ?? '' ) );
		$product->set_short_description( wp_kses_post( $row['description'] ?? '' ) );
		$product->set_regular_price( wc_format_decimal( $row['price'] ) );
		$product->set_weight( wc_format_decimal( $row['weight_kg'] ?? '' ) );
		$product->set_manage_stock( false );
		$product->set_reviews_allowed( false );
		$line_key  = sanitize_key( $row['line_key'] ?? '' );
		$line_data = isset( $lines[ $line_key ] ) && is_array( $lines[ $line_key ] ) ? $lines[ $line_key ] : array();
		if ( ! empty( $line_data['category'] ) && ! empty( $line_data['category_slug'] ) ) {
			$term = term_exists( $line_data['category_slug'], 'product_cat' );
			if ( ! $term ) $term = wp_insert_term( sanitize_text_field( $line_data['category'] ), 'product_cat', array( 'slug' => sanitize_title( $line_data['category_slug'] ) ) );
			if ( ! is_wp_error( $term ) ) $product->set_category_ids( array( (int) ( is_array( $term ) ? $term['term_id'] : $term ) ) );
		}

		$attributes = array();
		foreach ( array( 'Peso da embalagem' => $row['weight'] ?? '', 'Linha' => $row['line'] ?? '', 'Espécie' => $row['species'] ?? '' ) as $name => $value ) {
			$attribute = new WC_Product_Attribute();
			$attribute->set_name( $name );
			$attribute->set_options( array( sanitize_text_field( $value ) ) );
			$attribute->set_visible( true );
			$attribute->set_variation( false );
			$attributes[] = $attribute;
		}
		$product->set_attributes( $attributes );
		$product_id = $product->save();

		update_post_meta( $product_id, '_nutzen_import_key', $slug );
		update_post_meta( $product_id, '_nutzen_import_version', '1' );
		update_post_meta( $product_id, '_nutzen_subscription_eligible', 'yes' );
		update_post_meta( $product_id, '_nutzen_package_weight', sanitize_text_field( $row['weight'] ?? '' ) );
		update_post_meta( $product_id, '_nutzen_product_line', sanitize_text_field( $row['line'] ?? '' ) );
		update_post_meta( $product_id, '_nutzen_pet_size', sanitize_text_field( $line_data['pet_size'] ?? '' ) );
		update_post_meta( $product_id, '_nutzen_life_stage', sanitize_text_field( $line_data['life_stage'] ?? '' ) );
		update_post_meta( $product_id, '_nutzen_ingredients', sanitize_textarea_field( $line_data['ingredients'] ?? '' ) );
		update_post_meta( $product_id, '_nutzen_directions', sanitize_textarea_field( $line_data['directions'] ?? '' ) );
		update_post_meta( $product_id, '_nutzen_storage', sanitize_textarea_field( $line_data['storage'] ?? '' ) );
		update_post_meta( $product_id, '_nutzen_benefits', implode( "\n", array_map( 'sanitize_text_field', (array) ( $line_data['benefits'] ?? array() ) ) ) );
		update_post_meta( $product_id, '_nutzen_nutrition', wp_json_encode( (array) ( $line_data['nutrition'] ?? array() ), JSON_UNESCAPED_UNICODE ) );

		$image_ids = array();
		foreach ( (array) ( $row['images'] ?? array() ) as $relative ) {
			$file = $assets . DIRECTORY_SEPARATOR . str_replace( array( '/', '\\' ), DIRECTORY_SEPARATOR, $relative );
			if ( ! is_file( $file ) ) {
				throw new RuntimeException( 'Missing image: ' . $relative );
			}
			$image_ids[] = nutzen_import_image( $file, $product_id );
		}
		if ( $image_ids ) {
			$product->set_image_id( array_shift( $image_ids ) );
			$product->set_gallery_image_ids( $image_ids );
			$product->save();
		}
	} catch ( Throwable $error ) {
		++$summary['errors'];
		echo 'ERROR ' . $slug . ': ' . $error->getMessage() . "\n";
	}
}

echo wp_json_encode( $summary, JSON_PRETTY_PRINT ) . "\n";
exit( $summary['errors'] > 0 ? 2 : 0 );
