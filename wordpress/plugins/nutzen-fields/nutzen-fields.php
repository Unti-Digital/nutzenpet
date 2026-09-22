<?php
/**
 * Plugin Name: Nutzen Fields
 * Description: Construtor de campos técnicos de produtos e integração com as APIs do WooCommerce.
 * Version: 0.2.0
 * Author: NutzenPet
 * Requires at least: 6.7
 * Requires PHP: 8.1
 * WC requires at least: 9.0
 * WC tested up to: 11.1
 * Text Domain: nutzen-fields
 */

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\StoreApi\Schemas\V1\ProductSchema;
use Automattic\WooCommerce\Utilities\FeaturesUtil;

final class Nutzen_Fields_Plugin {
	private const VERSION      = '0.2.0';
	private const OPTION       = 'nutzen_fields_definitions';
	private const NONCE_ACTION = 'nutzen_fields_save_product';
	private const NONCE_NAME   = 'nutzen_fields_nonce';

	/** @var array<int, array<string, string>> */
	private const DEFAULT_FIELDS = array(
		array( 'key' => '_nutzen_ingredients', 'label' => 'Ingredientes', 'type' => 'textarea', 'description' => 'Lista completa de ingredientes do alimento.', 'options' => '', 'public' => '1' ),
		array( 'key' => '_nutzen_composition', 'label' => 'Composição', 'type' => 'textarea', 'description' => 'Composição básica ou garantida.', 'options' => '', 'public' => '1' ),
		array( 'key' => '_nutzen_nutrition', 'label' => 'Informações nutricionais', 'type' => 'json', 'description' => 'JSON no formato [{"label":"Proteína","value":"23%"}].', 'options' => '', 'public' => '1' ),
		array( 'key' => '_nutzen_benefits', 'label' => 'Benefícios', 'type' => 'lines', 'description' => 'Informe um benefício por linha.', 'options' => '', 'public' => '1' ),
		array( 'key' => '_nutzen_directions', 'label' => 'Recomendações de uso', 'type' => 'textarea', 'description' => 'Orientações de consumo e adaptação.', 'options' => '', 'public' => '1' ),
		array( 'key' => '_nutzen_storage', 'label' => 'Armazenamento', 'type' => 'textarea', 'description' => 'Cuidados para conservação do produto.', 'options' => '', 'public' => '1' ),
		array( 'key' => '_nutzen_pet_size', 'label' => 'Porte do animal', 'type' => 'text', 'description' => '', 'options' => '', 'public' => '1' ),
		array( 'key' => '_nutzen_life_stage', 'label' => 'Faixa etária', 'type' => 'text', 'description' => '', 'options' => '', 'public' => '1' ),
		array( 'key' => '_nutzen_package_weight', 'label' => 'Peso da embalagem', 'type' => 'text', 'description' => 'Exemplo: 1 kg, 3 kg ou 15 kg.', 'options' => '', 'public' => '1' ),
		array( 'key' => '_nutzen_technical_information', 'label' => 'Informações técnicas', 'type' => 'textarea', 'description' => '', 'options' => '', 'public' => '1' ),
		array( 'key' => '_nutzen_pdf_url', 'label' => 'Arquivo PDF', 'type' => 'url', 'description' => 'URL pública da ficha técnica.', 'options' => '', 'public' => '1' ),
		array( 'key' => '_nutzen_complementary_information', 'label' => 'Informações complementares', 'type' => 'textarea', 'description' => '', 'options' => '', 'public' => '1' ),
		array( 'key' => '_nutzen_product_line', 'label' => 'Linha do produto', 'type' => 'select', 'description' => 'Usado para organizar o catálogo no frontend.', 'options' => "medium-large-dogs|Cães médios e grandes\nsmall-dogs|Cães pequenos\nneutered-cats|Gatos castrados\nother|Outros", 'public' => '1' ),
	);

	public static function bootstrap(): void {
		register_activation_hook( __FILE__, array( __CLASS__, 'activate' ) );
		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_compatibility' ) );
		add_action( 'init', array( __CLASS__, 'register_meta' ) );
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ), 19 );
		add_action( 'admin_init', array( __CLASS__, 'handle_admin_actions' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'admin_assets' ) );
		add_action( 'add_meta_boxes_product', array( __CLASS__, 'add_meta_box' ) );
		add_action( 'save_post_product', array( __CLASS__, 'save_product' ), 10, 2 );
		add_action( 'woocommerce_blocks_loaded', array( __CLASS__, 'extend_store_api' ) );
	}

	public static function activate(): void {
		if ( false === get_option( self::OPTION, false ) ) {
			add_option( self::OPTION, self::DEFAULT_FIELDS, '', false );
		}
	}

	public static function declare_compatibility(): void {
		if ( class_exists( FeaturesUtil::class ) ) {
			FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
		}
	}

	private static function enabled(): bool {
		return (bool) apply_filters( 'nutzen_module_enabled', true, 'fields' );
	}

	/** @return array<int, array<string, string>> */
	private static function fields(): array {
		$stored = get_option( self::OPTION, null );
		return is_array( $stored ) ? array_values( $stored ) : self::DEFAULT_FIELDS;
	}

	public static function register_meta(): void {
		foreach ( self::fields() as $field ) {
			register_post_meta(
				'product',
				$field['key'],
				array(
					'single'            => true,
					'type'              => 'string',
					'sanitize_callback' => static fn( $value ): string => self::sanitize_value( (string) $value, $field['type'], $field['options'] ),
					'auth_callback'     => static fn(): bool => current_user_can( 'edit_products' ),
					'show_in_rest'      => true,
				)
			);
		}
	}

	public static function admin_menu(): void {
		$parent = class_exists( 'Nutzen_Switch_Plugin' ) ? 'nutzen-switch' : 'woocommerce';
		add_submenu_page( $parent, 'Campos de produto', 'Campos de produto', 'manage_woocommerce', 'nutzen-fields', array( __CLASS__, 'admin_page' ) );
	}

	public static function admin_assets( string $hook ): void {
		$screen    = get_current_screen();
		$post_type = $screen instanceof WP_Screen ? $screen->post_type : '';
		if ( 'nutzen-switch_page_nutzen-fields' === $hook || 'product' === $post_type ) {
			wp_enqueue_style( 'nutzen-fields-admin', plugins_url( 'assets/admin-fields.css', __FILE__ ), array(), self::VERSION );
		}
		if ( 'nutzen-switch_page_nutzen-fields' === $hook ) {
			wp_enqueue_script( 'nutzen-fields-admin', plugins_url( 'assets/admin-fields.js', __FILE__ ), array(), self::VERSION, true );
		}
	}

	public static function handle_admin_actions(): void {
		$action = isset( $_POST['nutzen_fields_action'] ) ? sanitize_key( wp_unslash( $_POST['nutzen_fields_action'] ) ) : '';
		if ( 'save_definitions' !== $action || ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		check_admin_referer( 'nutzen_fields_definitions' );
		$posted = isset( $_POST['nutzen_fields'] ) && is_array( $_POST['nutzen_fields'] ) ? wp_unslash( $_POST['nutzen_fields'] ) : array();
		$clean  = array();
		$seen   = array();
		foreach ( $posted as $definition ) {
			if ( ! is_array( $definition ) ) continue;
			$field = self::sanitize_definition( $definition );
			if ( '' === $field['label'] || isset( $seen[ $field['key'] ] ) ) continue;
			$seen[ $field['key'] ] = true;
			$clean[] = $field;
		}
		update_option( self::OPTION, $clean, false );
		wp_safe_redirect( add_query_arg( array( 'page' => 'nutzen-fields', 'updated' => '1' ), admin_url( 'admin.php' ) ) );
		exit;
	}

	/** @param array<string, mixed> $definition @return array<string, string> */
	private static function sanitize_definition( array $definition ): array {
		$key = sanitize_key( preg_replace( '/^_?nutzen_/', '', (string) ( $definition['key'] ?? '' ) ) );
		if ( '' === $key ) $key = 'campo_' . wp_generate_password( 6, false, false );
		$type = sanitize_key( (string) ( $definition['type'] ?? 'text' ) );
		$allowed = array( 'text', 'textarea', 'number', 'url', 'select', 'lines', 'json' );
		return array(
			'key'         => '_nutzen_' . $key,
			'label'       => sanitize_text_field( (string) ( $definition['label'] ?? '' ) ),
			'type'        => in_array( $type, $allowed, true ) ? $type : 'text',
			'description' => sanitize_textarea_field( (string) ( $definition['description'] ?? '' ) ),
			'options'     => sanitize_textarea_field( (string) ( $definition['options'] ?? '' ) ),
			'public'      => isset( $definition['public'] ) ? '1' : '0',
		);
	}

	public static function admin_page(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) return;
		$fields = self::fields();
		?>
		<div class="wrap nutzen-fields-builder">
			<section class="nutzen-fields-hero"><div><span>ESTRUTURA DO CATÁLOGO</span><h1>Campos de produto</h1><p>Monte os campos técnicos exibidos na edição dos produtos e disponibilizados para o frontend.</p></div><button type="button" class="button button-primary" data-add-field>Adicionar campo</button></section>
			<?php if ( isset( $_GET['updated'] ) ) : ?><div class="notice notice-success is-dismissible"><p>Estrutura de campos atualizada.</p></div><?php endif; ?>
			<div class="nutzen-fields-note"><strong>Alterações seguras:</strong> remover uma definição não apaga os valores já gravados nos produtos. Chaves devem ser únicas e não devem ser alteradas depois que o frontend começar a utilizá-las.</div>
			<form method="post">
				<?php wp_nonce_field( 'nutzen_fields_definitions' ); ?>
				<input type="hidden" name="nutzen_fields_action" value="save_definitions">
				<div class="nutzen-fields-list" data-fields-list>
					<?php foreach ( $fields as $index => $field ) self::render_definition_row( $field, $index ); ?>
				</div>
				<div class="nutzen-fields-footer"><button type="button" class="button" data-add-field>Adicionar outro campo</button><?php submit_button( 'Salvar estrutura', 'primary', 'submit', false ); ?></div>
			</form>
			<script type="text/html" id="tmpl-nutzen-field"><?php self::render_definition_row( array( 'key' => '_nutzen_novo_campo', 'label' => 'Novo campo', 'type' => 'text', 'description' => '', 'options' => '', 'public' => '1' ), '__INDEX__' ); ?></script>
		</div>
		<?php
	}

	/** @param array<string, string> $field @param int|string $index */
	private static function render_definition_row( array $field, $index ): void {
		$name = 'nutzen_fields[' . $index . ']';
		$types = array( 'text' => 'Texto curto', 'textarea' => 'Texto longo', 'number' => 'Número', 'url' => 'URL / arquivo', 'select' => 'Lista de opções', 'lines' => 'Lista (um item por linha)', 'json' => 'Tabela nutricional (JSON)' );
		?>
		<article class="nutzen-field-row" data-field-row>
			<div class="nutzen-field-row__top"><span class="dashicons dashicons-move" aria-hidden="true"></span><strong data-field-title><?php echo esc_html( $field['label'] ); ?></strong><div><button type="button" class="button-link" data-move-up aria-label="Mover para cima">↑</button><button type="button" class="button-link" data-move-down aria-label="Mover para baixo">↓</button><button type="button" class="button-link" data-duplicate-field>Duplicar</button><button type="button" class="button-link-delete" data-remove-field>Remover</button></div></div>
			<div class="nutzen-field-grid">
				<label><span>Nome do campo</span><input type="text" name="<?php echo esc_attr( $name ); ?>[label]" value="<?php echo esc_attr( $field['label'] ); ?>" data-field-label required></label>
				<label><span>Chave técnica</span><div class="nutzen-key-input"><code>_nutzen_</code><input type="text" name="<?php echo esc_attr( $name ); ?>[key]" value="<?php echo esc_attr( preg_replace( '/^_nutzen_/', '', $field['key'] ) ); ?>" pattern="[a-z0-9_\-]+" required></div></label>
				<label><span>Tipo</span><select name="<?php echo esc_attr( $name ); ?>[type]" data-field-type><?php foreach ( $types as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $field['type'], $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select></label>
				<label class="nutzen-field-public"><input type="checkbox" name="<?php echo esc_attr( $name ); ?>[public]" value="1" <?php checked( '1', $field['public'] ); ?>><span>Disponível para o frontend</span></label>
				<label class="nutzen-field-wide"><span>Descrição / ajuda para preenchimento</span><textarea name="<?php echo esc_attr( $name ); ?>[description]" rows="2"><?php echo esc_textarea( $field['description'] ); ?></textarea></label>
				<label class="nutzen-field-wide nutzen-field-options" data-field-options><span>Opções da lista <small>(uma por linha; use valor|Rótulo)</small></span><textarea name="<?php echo esc_attr( $name ); ?>[options]" rows="3"><?php echo esc_textarea( $field['options'] ); ?></textarea></label>
			</div>
		</article>
		<?php
	}

	public static function add_meta_box(): void {
		if ( self::enabled() ) add_meta_box( 'nutzen-product-fields', 'NutzenPet — Informações técnicas', array( __CLASS__, 'render_meta_box' ), 'product', 'normal', 'default' );
	}

	public static function render_meta_box( WP_Post $post ): void {
		wp_nonce_field( self::NONCE_ACTION, self::NONCE_NAME );
		echo '<div class="nutzen-product-fields">';
		foreach ( self::fields() as $field ) {
			$value = (string) get_post_meta( $post->ID, $field['key'], true );
			echo '<div class="nutzen-product-field"><label for="' . esc_attr( $field['key'] ) . '"><strong>' . esc_html( $field['label'] ) . '</strong></label>';
			self::render_product_input( $field, $value );
			if ( $field['description'] ) echo '<p class="description">' . esc_html( $field['description'] ) . '</p>';
			echo '</div>';
		}
		echo '</div>';
	}

	/** @param array<string, string> $field */
	private static function render_product_input( array $field, string $value ): void {
		$key = $field['key'];
		if ( in_array( $field['type'], array( 'textarea', 'json', 'lines' ), true ) ) {
			echo '<textarea class="widefat" rows="5" id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '">' . esc_textarea( $value ) . '</textarea>';
			return;
		}
		if ( 'select' === $field['type'] ) {
			echo '<select class="widefat" id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '"><option value="">Selecione</option>';
			foreach ( self::parse_options( $field['options'] ) as $option_value => $option_label ) echo '<option value="' . esc_attr( $option_value ) . '" ' . selected( $value, $option_value, false ) . '>' . esc_html( $option_label ) . '</option>';
			echo '</select>';
			return;
		}
		$type = in_array( $field['type'], array( 'url', 'number' ), true ) ? $field['type'] : 'text';
		echo '<input class="widefat" type="' . esc_attr( $type ) . '" id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '" value="' . esc_attr( $value ) . '"' . ( 'number' === $type ? ' step="any"' : '' ) . '>';
	}

	public static function save_product( int $post_id, WP_Post $post ): void {
		$nonce = isset( $_POST[ self::NONCE_NAME ] ) ? sanitize_text_field( wp_unslash( $_POST[ self::NONCE_NAME ] ) ) : '';
		if ( ! self::enabled() || ! wp_verify_nonce( $nonce, self::NONCE_ACTION ) || ! current_user_can( 'edit_product', $post_id ) || wp_is_post_autosave( $post_id ) || 'product' !== $post->post_type ) return;
		foreach ( self::fields() as $field ) {
			if ( ! isset( $_POST[ $field['key'] ] ) ) continue;
			$value = self::sanitize_value( (string) wp_unslash( $_POST[ $field['key'] ] ), $field['type'], $field['options'] );
			if ( '' === $value ) delete_post_meta( $post_id, $field['key'] ); else update_post_meta( $post_id, $field['key'], $value );
		}
	}

	private static function sanitize_value( string $value, string $type, string $options = '' ): string {
		if ( 'url' === $type ) return esc_url_raw( $value );
		if ( 'number' === $type ) return '' === trim( $value ) ? '' : (string) (float) str_replace( ',', '.', $value );
		if ( 'select' === $type ) return array_key_exists( $value, self::parse_options( $options ) ) ? sanitize_text_field( $value ) : '';
		if ( 'json' === $type ) {
			$decoded = json_decode( $value, true );
			if ( ! is_array( $decoded ) ) return '';
			$clean = array();
			foreach ( $decoded as $row ) if ( is_array( $row ) && isset( $row['label'], $row['value'] ) ) $clean[] = array( 'label' => sanitize_text_field( $row['label'] ), 'value' => sanitize_text_field( $row['value'] ) );
			return wp_json_encode( $clean, JSON_UNESCAPED_UNICODE );
		}
		return in_array( $type, array( 'textarea', 'lines' ), true ) ? sanitize_textarea_field( $value ) : sanitize_text_field( $value );
	}

	/** @return array<string, string> */
	private static function parse_options( string $options ): array {
		$parsed = array();
		foreach ( preg_split( '/\R/', $options ) ?: array() as $line ) {
			$line = trim( $line );
			if ( '' === $line ) continue;
			$parts = array_map( 'trim', explode( '|', $line, 2 ) );
			$parsed[ sanitize_key( $parts[0] ) ] = sanitize_text_field( $parts[1] ?? $parts[0] );
		}
		return $parsed;
	}

	public static function extend_store_api(): void {
		if ( ! self::enabled() || ! function_exists( 'woocommerce_store_api_register_endpoint_data' ) || ! class_exists( ProductSchema::class ) ) return;
		woocommerce_store_api_register_endpoint_data( array( 'endpoint' => ProductSchema::IDENTIFIER, 'namespace' => 'nutzen-fields', 'data_callback' => array( __CLASS__, 'store_api_data' ), 'schema_callback' => array( __CLASS__, 'store_api_schema' ), 'schema_type' => ARRAY_A ) );
	}

	/** @return array<string, mixed> */
	public static function store_api_data( WC_Product $product ): array {
		$post_id   = $product->get_id();
		$nutrition = json_decode( (string) get_post_meta( $post_id, '_nutzen_nutrition', true ), true );
		$benefits  = preg_split( '/\R/', (string) get_post_meta( $post_id, '_nutzen_benefits', true ) );
		$custom    = array();
		foreach ( self::fields() as $field ) {
			if ( '1' !== $field['public'] ) continue;
			$value = (string) get_post_meta( $post_id, $field['key'], true );
			if ( '' === $value ) continue;
			$custom[] = array( 'key' => preg_replace( '/^_nutzen_/', '', $field['key'] ), 'label' => $field['label'], 'type' => $field['type'], 'value' => $value );
		}
		return array(
			'ingredients' => (string) get_post_meta( $post_id, '_nutzen_ingredients', true ), 'composition' => (string) get_post_meta( $post_id, '_nutzen_composition', true ),
			'nutrition' => is_array( $nutrition ) ? $nutrition : array(), 'benefits' => array_values( array_filter( array_map( 'trim', is_array( $benefits ) ? $benefits : array() ) ) ),
			'directions' => (string) get_post_meta( $post_id, '_nutzen_directions', true ), 'storage' => (string) get_post_meta( $post_id, '_nutzen_storage', true ),
			'pet_size' => (string) get_post_meta( $post_id, '_nutzen_pet_size', true ), 'life_stage' => (string) get_post_meta( $post_id, '_nutzen_life_stage', true ),
			'package_weight' => (string) get_post_meta( $post_id, '_nutzen_package_weight', true ), 'technical_information' => (string) get_post_meta( $post_id, '_nutzen_technical_information', true ),
			'pdf_url' => (string) get_post_meta( $post_id, '_nutzen_pdf_url', true ), 'complementary_information' => (string) get_post_meta( $post_id, '_nutzen_complementary_information', true ),
			'product_line' => (string) get_post_meta( $post_id, '_nutzen_product_line', true ), 'custom_fields' => $custom,
		);
	}

	/** @return array<string, mixed> */
	public static function store_api_schema(): array {
		$text = array( 'description' => 'NutzenPet product data.', 'type' => 'string', 'readonly' => true );
		return array(
			'ingredients' => $text, 'composition' => $text, 'directions' => $text, 'storage' => $text, 'pet_size' => $text, 'life_stage' => $text, 'package_weight' => $text, 'technical_information' => $text, 'complementary_information' => $text, 'product_line' => $text,
			'pdf_url' => array( 'description' => 'Technical PDF URL.', 'type' => 'string', 'format' => 'uri', 'readonly' => true ),
			'nutrition' => array( 'description' => 'Nutrition rows.', 'type' => 'array', 'readonly' => true, 'items' => array( 'type' => 'object' ) ),
			'benefits' => array( 'description' => 'Product benefits.', 'type' => 'array', 'readonly' => true, 'items' => array( 'type' => 'string' ) ),
			'custom_fields' => array( 'description' => 'Configurable public product fields.', 'type' => 'array', 'readonly' => true, 'items' => array( 'type' => 'object' ) ),
		);
	}
}

Nutzen_Fields_Plugin::bootstrap();
