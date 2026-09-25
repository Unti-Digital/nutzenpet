<?php
/**
 * Administrative screens for Nutzen subscriptions.
 *
 * @package NutzenSubscriptions
 */

defined( 'ABSPATH' ) || exit;

final class Nutzen_Subscription_Admin {
	private const PAGE_SIZE = 25;

	public static function render(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) return;
		$subscriber_id = absint( $_GET['subscriber_id'] ?? 0 );
		$view          = sanitize_key( wp_unslash( $_GET['view'] ?? '' ) );
		if ( $subscriber_id > 0 ) {
			self::render_detail( $subscriber_id );
			return;
		}
		if ( 'add' === $view ) {
			self::render_add();
			return;
		}
		self::render_list();
	}

	private static function subscriptions_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'nutzen_subscriptions';
	}

	private static function events_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'nutzen_subscription_events';
	}

	/** @param array<string,string|int> $args */
	private static function url( array $args = array() ): string {
		return add_query_arg( array_merge( array( 'page' => 'nutzen-subscriptions' ), $args ), admin_url( 'admin.php' ) );
	}

	/** @return array<string,string> */
	private static function statuses(): array {
		return array(
			'pending_gateway' => 'Pendente de gateway',
			'active'          => 'Ativa',
			'paused'          => 'Pausada',
			'cancelled'       => 'Cancelada',
			'rejected'        => 'Rejeitada',
			'removed'         => 'Removida',
		);
	}

	private static function header( string $eyebrow, string $title, string $description ): void {
		?>
		<section class="nutzen-admin-hero">
			<div><span class="nutzen-kicker"><?php echo esc_html( $eyebrow ); ?></span><h1><?php echo esc_html( $title ); ?></h1><p><?php echo esc_html( $description ); ?></p></div>
			<div class="nutzen-record-card__actions">
				<a class="button" href="<?php echo esc_url( self::url() ); ?>">Assinantes</a>
				<a class="button" href="<?php echo esc_url( self::url( array( 'view' => 'add' ) ) ); ?>">Nova assinatura</a>
				<a class="button" href="<?php echo esc_url( admin_url( 'edit.php?post_type=nutzen_plan' ) ); ?>">Gerenciar planos</a>
			</div>
		</section>
		<?php
	}

	private static function render_list(): void {
		global $wpdb;
		$status = sanitize_key( wp_unslash( $_GET['subscription_status'] ?? '' ) );
		$search = sanitize_text_field( wp_unslash( $_GET['subscription_search'] ?? '' ) );
		$page   = max( 1, absint( $_GET['paged'] ?? 1 ) );
		$where  = array( '1=1' );
		$args   = array();
		$table  = self::subscriptions_table();
		if ( isset( self::statuses()[ $status ] ) ) {
			$where[] = 'EXISTS (SELECT 1 FROM ' . $table . ' sf WHERE sf.user_id=s.user_id AND sf.status=%s)';
			$args[]  = $status;
		}
		if ( '' !== $search ) {
			$like    = '%' . $wpdb->esc_like( $search ) . '%';
			$where[] = '(u.display_name LIKE %s OR u.user_email LIKE %s OR EXISTS (SELECT 1 FROM ' . $table . ' sp LEFT JOIN ' . $wpdb->posts . ' p ON p.ID=sp.product_id WHERE sp.user_id=s.user_id AND p.post_title LIKE %s))';
			array_push( $args, $like, $like, $like );
		}
		$from      = ' FROM ' . $table . ' s LEFT JOIN ' . $wpdb->users . ' u ON u.ID=s.user_id WHERE ' . implode( ' AND ', $where );
		$count_sql = 'SELECT COUNT(DISTINCT s.user_id)' . $from;
		$total     = (int) $wpdb->get_var( $args ? $wpdb->prepare( $count_sql, ...$args ) : $count_sql );
		$query     = 'SELECT s.user_id,u.display_name,u.user_email,COUNT(*) subscription_count,'
			. "SUM(s.status='active') active_count,SUM(s.status='pending_gateway') pending_count,SUM(s.status='paused') paused_count,"
			. "MIN(CASE WHEN s.status IN ('active','pending_gateway','paused') THEN s.next_charge_date END) next_charge_date,MAX(s.created_at) latest_created"
			. $from . ' GROUP BY s.user_id,u.display_name,u.user_email ORDER BY latest_created DESC LIMIT %d OFFSET %d';
		$query_args = array_merge( $args, array( self::PAGE_SIZE, ( $page - 1 ) * self::PAGE_SIZE ) );
		$rows       = $wpdb->get_results( $wpdb->prepare( $query, ...$query_args ), ARRAY_A );
		$metrics    = array(
			'subscribers' => (int) $wpdb->get_var( 'SELECT COUNT(DISTINCT user_id) FROM ' . $table . " WHERE status NOT IN ('removed','rejected')" ),
			'active'      => (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . $table . " WHERE status='active'" ),
			'pending'     => (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . $table . " WHERE status='pending_gateway'" ),
			'paused'      => (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . $table . " WHERE status='paused'" ),
		);
		?>
		<div class="wrap nutzen-admin">
			<?php self::header( 'NUTZEN CLUB', 'Assinantes', 'Consulte os clientes primeiro e abra o painel individual para administrar produtos, recorrências e histórico.' ); ?>
			<div class="nutzen-stat-grid"><article><strong><?php echo esc_html( number_format_i18n( $metrics['subscribers'] ) ); ?></strong><span>assinantes cadastrados</span></article><article><strong><?php echo esc_html( number_format_i18n( $metrics['active'] ) ); ?></strong><span>assinaturas ativas</span></article><article><strong><?php echo esc_html( number_format_i18n( $metrics['pending'] ) ); ?></strong><span>aguardando gateway</span></article><article><strong><?php echo esc_html( number_format_i18n( $metrics['paused'] ) ); ?></strong><span>assinaturas pausadas</span></article></div>
			<form method="get" class="nutzen-admin-filter"><input type="hidden" name="page" value="nutzen-subscriptions"><input type="search" name="subscription_search" value="<?php echo esc_attr( $search ); ?>" placeholder="Buscar nome, e-mail ou produto"><select name="subscription_status"><option value="">Todos os status</option><?php foreach ( self::statuses() as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $status, $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select><button class="button button-primary">Filtrar</button><a class="button" href="<?php echo esc_url( self::url() ); ?>">Limpar</a></form>
			<div class="nutzen-table-wrap"><table class="widefat striped"><thead><tr><th>Assinante</th><th>Assinaturas</th><th>Ativas</th><th>Pendentes</th><th>Pausadas</th><th>Próxima cobrança</th><th></th></tr></thead><tbody>
			<?php if ( ! $rows ) : ?><tr><td colspan="7">Nenhum assinante encontrado.</td></tr><?php endif; ?>
			<?php foreach ( $rows as $row ) : ?><tr><td><strong><?php echo esc_html( $row['display_name'] ?: 'Usuário removido' ); ?></strong><br><small><?php echo esc_html( $row['user_email'] ); ?></small></td><td><?php echo esc_html( number_format_i18n( $row['subscription_count'] ) ); ?></td><td><span class="nutzen-status nutzen-status--active"><?php echo esc_html( number_format_i18n( $row['active_count'] ) ); ?></span></td><td><?php echo esc_html( number_format_i18n( $row['pending_count'] ) ); ?></td><td><?php echo esc_html( number_format_i18n( $row['paused_count'] ) ); ?></td><td><?php echo $row['next_charge_date'] ? esc_html( wp_date( 'd/m/Y H:i', strtotime( $row['next_charge_date'] . ' UTC' ) ) ) : '—'; ?></td><td><a class="button button-primary" href="<?php echo esc_url( self::url( array( 'subscriber_id' => (int) $row['user_id'] ) ) ); ?>">Ver assinante</a></td></tr><?php endforeach; ?>
			</tbody></table></div>
			<?php if ( $total > self::PAGE_SIZE ) : ?><div class="tablenav"><div class="tablenav-pages"><?php echo wp_kses_post( paginate_links( array( 'base' => add_query_arg( 'paged', '%#%' ), 'format' => '', 'current' => $page, 'total' => (int) ceil( $total / self::PAGE_SIZE ) ) ) ); ?></div></div><?php endif; ?>
		</div>
		<?php
	}

	private static function render_add(): void {
		$customers = get_users( array( 'number' => 300, 'orderby' => 'display_name', 'order' => 'ASC', 'fields' => array( 'ID', 'display_name', 'user_email' ) ) );
		$products  = wc_get_products( array( 'limit' => 300, 'status' => array( 'publish', 'draft' ), 'orderby' => 'name', 'order' => 'ASC' ) );
		$plans     = get_posts( array( 'post_type' => 'nutzen_plan', 'post_status' => array( 'publish', 'draft' ), 'numberposts' => 100, 'orderby' => 'menu_order title', 'order' => 'ASC' ) );
		?>
		<div class="wrap nutzen-admin"><?php self::header( 'CADASTRO MANUAL', 'Nova assinatura', 'Vincule um cliente a um produto e plano sem efetuar cobranças automáticas.' ); ?>
		<form method="post" class="nutzen-settings-card"><?php wp_nonce_field( 'nutzen_subscription_admin' ); ?><input type="hidden" name="nutzen_subscription_action" value="save"><input type="hidden" name="subscription_id" value="0"><div class="nutzen-form-grid"><label><span>Cliente</span><select name="user_id" required><option value="">Selecione</option><?php foreach ( $customers as $customer ) : ?><option value="<?php echo (int) $customer->ID; ?>"><?php echo esc_html( $customer->display_name . ' · ' . $customer->user_email ); ?></option><?php endforeach; ?></select></label><label><span>Produto</span><select name="product_id" required><option value="">Selecione</option><?php foreach ( $products as $product ) : ?><option value="<?php echo (int) $product->get_id(); ?>"><?php echo esc_html( $product->get_name() ); ?></option><?php endforeach; ?></select></label><label><span>Plano</span><select name="plan_id"><option value="0">Sem plano</option><?php foreach ( $plans as $plan ) : ?><option value="<?php echo (int) $plan->ID; ?>"><?php echo esc_html( $plan->post_title ); ?></option><?php endforeach; ?></select></label><label><span>Status</span><select name="status"><option value="pending_gateway">Pendente de gateway</option><option value="active">Ativa</option><option value="paused">Pausada</option><option value="rejected">Rejeitada</option></select></label><label><span>Quantidade</span><input type="number" min="1" step="1" name="quantity" value="1"></label><label><span>Recorrência</span><span class="nutzen-inline-form"><input type="number" min="1" name="interval_value" value="1"><select name="interval_unit"><option value="month">Mês</option><option value="week">Semana</option><option value="day">Dia</option></select></span></label><label><span>Desconto</span><span class="nutzen-inline-form"><input type="number" min="0" step="0.01" name="discount_value" value="0"><select name="discount_type"><option value="percentage">%</option><option value="fixed">R$</option></select></span></label><label><span>Próxima cobrança</span><input type="datetime-local" name="next_charge_date"></label></div><?php submit_button( 'Criar assinatura' ); ?><p class="description">A ativação manual não cobra o cliente. O gateway recorrente será integrado em uma etapa posterior.</p></form></div>
		<?php
	}

	private static function render_detail( int $user_id ): void {
		global $wpdb;
		$user = get_user_by( 'id', $user_id );
		if ( ! $user ) wp_die( esc_html__( 'Assinante não encontrado.', 'nutzen-subscriptions' ) );
		$rows = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . self::subscriptions_table() . ' WHERE user_id=%d ORDER BY id DESC', $user_id ), ARRAY_A );
		if ( ! $rows ) wp_die( esc_html__( 'Este cliente não possui assinaturas.', 'nutzen-subscriptions' ) );
		$plans = get_posts( array( 'post_type' => 'nutzen_plan', 'post_status' => array( 'publish', 'draft' ), 'numberposts' => 100, 'orderby' => 'menu_order title', 'order' => 'ASC' ) );
		$events = $wpdb->get_results( $wpdb->prepare( 'SELECT e.*,s.product_id,s.variation_id FROM ' . self::events_table() . ' e INNER JOIN ' . self::subscriptions_table() . ' s ON s.id=e.subscription_id WHERE s.user_id=%d ORDER BY e.id DESC LIMIT 100', $user_id ), ARRAY_A );
		$active = count( array_filter( $rows, static fn( array $row ): bool => 'active' === $row['status'] ) );
		$pending = count( array_filter( $rows, static fn( array $row ): bool => 'pending_gateway' === $row['status'] ) );
		$paused = count( array_filter( $rows, static fn( array $row ): bool => 'paused' === $row['status'] ) );
		?>
		<div class="wrap nutzen-admin">
			<?php self::header( 'PAINEL DO ASSINANTE', (string) $user->display_name, 'Administre as assinaturas deste cliente e consulte todo o histórico operacional em um único lugar.' ); ?>
			<div class="nutzen-stat-grid"><article><strong><?php echo esc_html( number_format_i18n( count( $rows ) ) ); ?></strong><span>assinaturas cadastradas</span></article><article><strong><?php echo esc_html( number_format_i18n( $active ) ); ?></strong><span>ativas</span></article><article><strong><?php echo esc_html( number_format_i18n( $pending ) ); ?></strong><span>aguardando gateway</span></article><article><strong><?php echo esc_html( number_format_i18n( $paused ) ); ?></strong><span>pausadas</span></article></div>
			<article class="nutzen-settings-card"><div class="nutzen-record-card__head"><div><span class="nutzen-kicker">DADOS DO CLIENTE</span><h2><?php echo esc_html( $user->user_email ); ?></h2><p>Cliente desde <?php echo esc_html( wp_date( 'd/m/Y', strtotime( $user->user_registered . ' UTC' ) ) ); ?></p></div><a class="button" href="<?php echo esc_url( get_edit_user_link( $user_id ) ); ?>">Abrir cadastro do cliente</a></div></article>
			<h2>Assinaturas</h2><div class="nutzen-subscription-list"><?php foreach ( $rows as $row ) self::render_subscription_form( $row, $plans ); ?></div>
			<h2>Histórico operacional</h2><div class="nutzen-table-wrap"><table class="widefat striped"><thead><tr><th>Data</th><th>Assinatura</th><th>Produto</th><th>Evento</th><th>Alteração</th><th>Observação</th></tr></thead><tbody><?php if ( ! $events ) : ?><tr><td colspan="6">Nenhum evento registrado.</td></tr><?php endif; foreach ( $events as $event ) : $product = wc_get_product( $event['variation_id'] ?: $event['product_id'] ); ?><tr><td><?php echo esc_html( wp_date( 'd/m/Y H:i', strtotime( $event['created_at'] . ' UTC' ) ) ); ?></td><td>#<?php echo (int) $event['subscription_id']; ?></td><td><?php echo esc_html( $product ? $product->get_name() : 'Produto indisponível' ); ?></td><td><?php echo esc_html( str_replace( '_', ' ', ucfirst( $event['event_type'] ) ) ); ?></td><td><?php echo esc_html( ( self::statuses()[ $event['from_status'] ] ?? $event['from_status'] ?: '—' ) . ' → ' . ( self::statuses()[ $event['to_status'] ] ?? $event['to_status'] ?: '—' ) ); ?></td><td><?php echo esc_html( $event['note'] ); ?></td></tr><?php endforeach; ?></tbody></table></div>
		</div>
		<?php
	}

	/** @param array<string,mixed> $row @param WP_Post[] $plans */
	private static function render_subscription_form( array $row, array $plans ): void {
		$product = wc_get_product( $row['variation_id'] ?: $row['product_id'] );
		?>
		<form method="post" class="nutzen-record-card"><?php wp_nonce_field( 'nutzen_subscription_admin' ); ?><input type="hidden" name="nutzen_subscription_action" value="save"><input type="hidden" name="redirect_subscriber_id" value="<?php echo (int) $row['user_id']; ?>"><input type="hidden" name="subscription_id" value="<?php echo (int) $row['id']; ?>"><input type="hidden" name="user_id" value="<?php echo (int) $row['user_id']; ?>"><input type="hidden" name="product_id" value="<?php echo (int) $row['product_id']; ?>"><input type="hidden" name="variation_id" value="<?php echo (int) $row['variation_id']; ?>">
		<div class="nutzen-record-card__head"><div><span class="nutzen-kicker">ASSINATURA #<?php echo (int) $row['id']; ?></span><h3><?php echo esc_html( $product ? $product->get_name() : 'Produto indisponível' ); ?></h3><p>Criada em <?php echo esc_html( wp_date( 'd/m/Y', strtotime( $row['created_at'] . ' UTC' ) ) ); ?><?php if ( $row['last_order_id'] ) : ?> · Pedido #<?php echo (int) $row['last_order_id']; ?><?php endif; ?></p></div><span class="nutzen-status nutzen-status--<?php echo esc_attr( $row['status'] ); ?>"><?php echo esc_html( self::statuses()[ $row['status'] ] ?? $row['status'] ); ?></span></div>
		<div class="nutzen-form-grid"><label><span>Plano</span><select name="plan_id"><option value="0">Sem plano</option><?php foreach ( $plans as $plan ) : ?><option value="<?php echo (int) $plan->ID; ?>" <?php selected( $row['plan_id'], $plan->ID ); ?>><?php echo esc_html( $plan->post_title ); ?></option><?php endforeach; ?></select></label><label><span>Status</span><select name="status"><?php foreach ( self::statuses() as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $row['status'], $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select></label><label><span>Quantidade</span><input type="number" min="1" name="quantity" value="<?php echo esc_attr( $row['quantity'] ); ?>"></label><label><span>Recorrência</span><span class="nutzen-inline-form"><input type="number" min="1" name="interval_value" value="<?php echo esc_attr( $row['interval_value'] ); ?>"><select name="interval_unit"><option value="day" <?php selected( $row['interval_unit'], 'day' ); ?>>Dia</option><option value="week" <?php selected( $row['interval_unit'], 'week' ); ?>>Semana</option><option value="month" <?php selected( $row['interval_unit'], 'month' ); ?>>Mês</option></select></span></label><label><span>Desconto</span><span class="nutzen-inline-form"><input type="number" min="0" step="0.01" name="discount_value" value="<?php echo esc_attr( $row['discount_value'] ); ?>"><select name="discount_type"><option value="percentage" <?php selected( $row['discount_type'], 'percentage' ); ?>>%</option><option value="fixed" <?php selected( $row['discount_type'], 'fixed' ); ?>>R$</option></select></span></label><label><span>Próxima cobrança</span><input type="datetime-local" name="next_charge_date" value="<?php echo esc_attr( $row['next_charge_date'] ? str_replace( ' ', 'T', substr( $row['next_charge_date'], 0, 16 ) ) : '' ); ?>"></label></div>
		<div class="nutzen-record-card__actions"><button class="button button-primary">Salvar alterações</button><button class="button-link-delete" name="nutzen_subscription_action" value="archive" onclick="return confirm('Remover esta assinatura da operação? O histórico será preservado.');">Remover</button></div></form>
		<?php
	}
}
