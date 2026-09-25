<?php
/**
 * Administrative screens for Nutzen affiliates.
 *
 * @package NutzenAffiliates
 */

defined( 'ABSPATH' ) || exit;

final class Nutzen_Affiliate_Admin {
	private const PAGE_SIZE = 25;

	public static function render(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) return;
		$affiliate_id = absint( $_GET['affiliate_id'] ?? 0 );
		$view         = sanitize_key( wp_unslash( $_GET['view'] ?? '' ) );
		if ( $affiliate_id > 0 ) {
			self::render_detail( $affiliate_id );
			return;
		}
		if ( 'settings' === $view ) {
			self::render_settings();
			return;
		}
		if ( 'add' === $view ) {
			self::render_add();
			return;
		}
		self::render_list();
	}

	private static function table( string $suffix ): string {
		global $wpdb;
		return $wpdb->prefix . 'nutzen_affiliate_' . $suffix;
	}

	/** @param array<string,string|int> $args */
	private static function url( array $args = array() ): string {
		return add_query_arg( array_merge( array( 'page' => 'nutzen-affiliates' ), $args ), admin_url( 'admin.php' ) );
	}

	/** @return array<string,string> */
	private static function statuses(): array {
		return array( 'pending' => 'Pendente', 'approved' => 'Aprovado', 'suspended' => 'Suspenso', 'rejected' => 'Rejeitado', 'removed' => 'Removido' );
	}

	private static function header( string $eyebrow, string $title, string $description ): void {
		?>
		<section class="nutzen-admin-hero">
			<div><span class="nutzen-kicker"><?php echo esc_html( $eyebrow ); ?></span><h1><?php echo esc_html( $title ); ?></h1><p><?php echo esc_html( $description ); ?></p></div>
			<div class="nutzen-record-card__actions">
				<a class="button" href="<?php echo esc_url( self::url() ); ?>">Participantes</a>
				<a class="button" href="<?php echo esc_url( admin_url( 'edit.php?post_type=nutzen_application' ) ); ?>">Candidaturas</a>
				<a class="button" href="<?php echo esc_url( self::url( array( 'view' => 'settings' ) ) ); ?>">Regras</a>
			</div>
		</section>
		<?php
	}

	private static function render_list(): void {
		global $wpdb;
		$status = sanitize_key( wp_unslash( $_GET['affiliate_status'] ?? '' ) );
		$search = sanitize_text_field( wp_unslash( $_GET['affiliate_search'] ?? '' ) );
		$page   = max( 1, absint( $_GET['paged'] ?? 1 ) );
		$where  = array( '1=1' );
		$args   = array();
		if ( isset( self::statuses()[ $status ] ) ) { $where[] = 'a.status=%s'; $args[] = $status; }
		if ( '' !== $search ) {
			$like = '%' . $wpdb->esc_like( $search ) . '%';
			$where[] = '(u.display_name LIKE %s OR u.user_email LIKE %s OR a.code LIKE %s)';
			array_push( $args, $like, $like, $like );
		}
		$from = ' FROM ' . $wpdb->prefix . 'nutzen_affiliates a LEFT JOIN ' . $wpdb->users . ' u ON u.ID=a.user_id WHERE ' . implode( ' AND ', $where );
		$count_sql = 'SELECT COUNT(*)' . $from;
		$total = (int) $wpdb->get_var( $args ? $wpdb->prepare( $count_sql, ...$args ) : $count_sql );
		$query = 'SELECT a.*,u.user_email,u.display_name,'
			. '(SELECT COUNT(*) FROM ' . self::table( 'clicks' ) . ' cl WHERE cl.affiliate_id=a.id) click_count,'
			. '(SELECT COUNT(DISTINCT c.order_id) FROM ' . $wpdb->prefix . 'nutzen_affiliate_commissions c WHERE c.affiliate_id=a.id) order_count,'
			. '(SELECT COALESCE(SUM(c.commission_amount),0) FROM ' . $wpdb->prefix . "nutzen_affiliate_commissions c WHERE c.affiliate_id=a.id AND c.status='approved') approved_total"
			. $from . ' ORDER BY a.id DESC LIMIT %d OFFSET %d';
		$query_args = array_merge( $args, array( self::PAGE_SIZE, ( $page - 1 ) * self::PAGE_SIZE ) );
		$rows = $wpdb->get_results( $wpdb->prepare( $query, ...$query_args ), ARRAY_A );
		$metrics = array(
			'approved' => (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}nutzen_affiliates WHERE status='approved'" ),
			'pending' => (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}nutzen_affiliates WHERE status='pending'" ),
			'commissions' => (float) $wpdb->get_var( "SELECT COALESCE(SUM(commission_amount),0) FROM {$wpdb->prefix}nutzen_affiliate_commissions WHERE status='approved'" ),
			'withdrawals' => (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}nutzen_affiliate_withdrawals WHERE status IN ('requested','in_review')" ),
		);
		?>
		<div class="wrap nutzen-admin">
			<?php self::header( 'PROGRAMA COMERCIAL', 'Afiliados', 'Consulte participantes e abra o perfil individual para administrar resultados, comissões e saques.' ); ?>
			<div class="nutzen-stat-grid"><article><strong><?php echo esc_html( number_format_i18n( $metrics['approved'] ) ); ?></strong><span>afiliados ativos</span></article><article><strong><?php echo esc_html( number_format_i18n( $metrics['pending'] ) ); ?></strong><span>cadastros pendentes</span></article><article><strong><?php echo wp_kses_post( wc_price( $metrics['commissions'] ) ); ?></strong><span>comissões aprovadas</span></article><article><strong><?php echo esc_html( number_format_i18n( $metrics['withdrawals'] ) ); ?></strong><span>saques em atendimento</span></article></div>
			<form method="get" class="nutzen-admin-filter"><input type="hidden" name="page" value="nutzen-affiliates"><input type="search" name="affiliate_search" value="<?php echo esc_attr( $search ); ?>" placeholder="Buscar nome, e-mail ou código"><select name="affiliate_status"><option value="">Todos os status</option><?php foreach ( self::statuses() as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $status, $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select><button class="button button-primary">Filtrar</button><a class="button" href="<?php echo esc_url( self::url() ); ?>">Limpar</a><a class="button" href="<?php echo esc_url( self::url( array( 'view' => 'add' ) ) ); ?>">Adicionar afiliado</a></form>
			<div class="nutzen-table-wrap"><table class="widefat striped"><thead><tr><th>Afiliado</th><th>Código</th><th>Status</th><th>Cliques</th><th>Pedidos</th><th>Comissão aprovada</th><th>PIX</th><th></th></tr></thead><tbody>
			<?php if ( ! $rows ) : ?><tr><td colspan="8">Nenhum afiliado encontrado.</td></tr><?php endif; ?>
			<?php foreach ( $rows as $row ) : ?><tr><td><strong><?php echo esc_html( $row['display_name'] ?: 'Usuário removido' ); ?></strong><br><small><?php echo esc_html( $row['user_email'] ); ?></small></td><td><code><?php echo esc_html( $row['code'] ); ?></code></td><td><span class="nutzen-status nutzen-status--<?php echo esc_attr( $row['status'] ); ?>"><?php echo esc_html( self::statuses()[ $row['status'] ] ?? $row['status'] ); ?></span></td><td><?php echo esc_html( number_format_i18n( $row['click_count'] ) ); ?></td><td><?php echo esc_html( number_format_i18n( $row['order_count'] ) ); ?></td><td><?php echo wp_kses_post( wc_price( $row['approved_total'] ) ); ?></td><td><?php echo $row['pix_key_last4'] ? esc_html( strtoupper( $row['pix_key_type'] ) . ' · •••• ' . $row['pix_key_last4'] ) : '<em>Não cadastrado</em>'; ?></td><td><a class="button button-primary" href="<?php echo esc_url( self::url( array( 'affiliate_id' => (int) $row['id'] ) ) ); ?>">Ver afiliado</a></td></tr><?php endforeach; ?>
			</tbody></table></div>
			<?php if ( $total > self::PAGE_SIZE ) : ?><div class="tablenav"><div class="tablenav-pages"><?php echo wp_kses_post( paginate_links( array( 'base' => add_query_arg( 'paged', '%#%' ), 'format' => '', 'current' => $page, 'total' => (int) ceil( $total / self::PAGE_SIZE ) ) ) ); ?></div></div><?php endif; ?>
		</div>
		<?php
	}

	private static function render_add(): void {
		$users = get_users( array( 'number' => 300, 'orderby' => 'display_name', 'order' => 'ASC', 'fields' => array( 'ID', 'display_name', 'user_email' ) ) );
		?>
		<div class="wrap nutzen-admin"><?php self::header( 'NOVO PARTICIPANTE', 'Adicionar afiliado', 'Vincule um usuário existente ao programa. Nenhum valor financeiro será criado automaticamente.' ); ?>
		<form method="post" class="nutzen-settings-card"><?php wp_nonce_field( 'nutzen_affiliate_admin' ); ?><input type="hidden" name="nutzen_affiliate_action" value="save"><div class="nutzen-form-grid"><label><span>Usuário</span><select name="user_id" required><option value="">Selecione</option><?php foreach ( $users as $user ) : ?><option value="<?php echo (int) $user->ID; ?>"><?php echo esc_html( $user->display_name . ' · ' . $user->user_email ); ?></option><?php endforeach; ?></select></label><label><span>Status</span><select name="status"><?php foreach ( self::statuses() as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>"><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select></label><label><span>Código personalizado</span><input name="code" placeholder="Gerado automaticamente"></label><label class="is-wide"><span>Observações internas</span><textarea name="notes" rows="5"></textarea></label></div><?php submit_button( 'Salvar afiliado' ); ?></form></div>
		<?php
	}

	private static function render_settings(): void {
		$settings = wp_parse_args( get_option( 'nutzen_affiliates_settings', array() ), array( 'attribution_days' => 30, 'minimum_withdrawal' => 100, 'public_registration' => true ) );
		?>
		<div class="wrap nutzen-admin"><?php self::header( 'CONFIGURAÇÕES', 'Regras do programa', 'Defina atribuição e solicitações de saque sem misturar configurações com a operação diária.' ); ?>
		<form method="post" class="nutzen-settings-card"><?php wp_nonce_field( 'nutzen_affiliate_admin' ); ?><input type="hidden" name="nutzen_affiliate_action" value="settings"><input type="hidden" name="redirect_view" value="settings"><div class="nutzen-form-grid"><label><span>Dias de atribuição por cookie</span><input type="number" min="1" max="365" name="attribution_days" value="<?php echo esc_attr( $settings['attribution_days'] ); ?>"></label><label><span>Saque mínimo (R$)</span><input type="number" min="100" step="0.01" name="minimum_withdrawal" value="<?php echo esc_attr( $settings['minimum_withdrawal'] ); ?>"></label><label class="is-wide"><input type="checkbox" name="public_registration" value="1" <?php checked( ! empty( $settings['public_registration'] ) ); ?>> Aceitar candidaturas pelo frontend</label></div><?php submit_button( 'Salvar regras' ); ?></form></div>
		<?php
	}

	private static function render_detail( int $affiliate_id ): void {
		global $wpdb;
		$affiliate = $wpdb->get_row( $wpdb->prepare( 'SELECT a.*,u.display_name,u.user_email FROM ' . $wpdb->prefix . 'nutzen_affiliates a LEFT JOIN ' . $wpdb->users . ' u ON u.ID=a.user_id WHERE a.id=%d', $affiliate_id ), ARRAY_A );
		if ( ! $affiliate ) { wp_die( esc_html__( 'Afiliado não encontrado.', 'nutzen-affiliates' ) ); }
		$clicks = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . self::table( 'clicks' ) . ' WHERE affiliate_id=%d', $affiliate_id ) );
		$orders = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(DISTINCT order_id) FROM ' . $wpdb->prefix . 'nutzen_affiliate_commissions WHERE affiliate_id=%d', $affiliate_id ) );
		$approved = (float) $wpdb->get_var( $wpdb->prepare( "SELECT COALESCE(SUM(commission_amount),0) FROM {$wpdb->prefix}nutzen_affiliate_commissions WHERE affiliate_id=%d AND status='approved'", $affiliate_id ) );
		$pending = (float) $wpdb->get_var( $wpdb->prepare( "SELECT COALESCE(SUM(commission_amount),0) FROM {$wpdb->prefix}nutzen_affiliate_commissions WHERE affiliate_id=%d AND status='pending'", $affiliate_id ) );
		$links = $wpdb->get_results( $wpdb->prepare( 'SELECT l.*,c.name campaign_name,p.post_title product_name,(SELECT COUNT(*) FROM ' . self::table( 'clicks' ) . ' cl WHERE cl.link_id=l.id) clicks FROM ' . self::table( 'links' ) . ' l LEFT JOIN ' . self::table( 'campaigns' ) . ' c ON c.id=l.campaign_id LEFT JOIN ' . $wpdb->posts . ' p ON p.ID=l.product_id WHERE l.affiliate_id=%d ORDER BY l.id DESC LIMIT 100', $affiliate_id ), ARRAY_A );
		$commissions = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . $wpdb->prefix . 'nutzen_affiliate_commissions WHERE affiliate_id=%d ORDER BY id DESC LIMIT 100', $affiliate_id ), ARRAY_A );
		$withdrawals = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . $wpdb->prefix . 'nutzen_affiliate_withdrawals WHERE affiliate_id=%d ORDER BY id DESC LIMIT 100', $affiliate_id ), ARRAY_A );
		?>
		<div class="wrap nutzen-admin">
			<?php self::header( 'PERFIL DO AFILIADO', (string) ( $affiliate['display_name'] ?: 'Usuário removido' ), 'Acompanhe a operação individual sem expor dados financeiros de outros participantes.' ); ?>
			<div class="nutzen-stat-grid"><article><strong><?php echo esc_html( number_format_i18n( $clicks ) ); ?></strong><span>cliques válidos</span></article><article><strong><?php echo esc_html( number_format_i18n( $orders ) ); ?></strong><span>pedidos atribuídos</span></article><article><strong><?php echo wp_kses_post( wc_price( $pending ) ); ?></strong><span>comissão pendente</span></article><article><strong><?php echo wp_kses_post( wc_price( $approved ) ); ?></strong><span>comissão aprovada</span></article></div>
			<div class="nutzen-admin-columns"><form method="post" class="nutzen-settings-card"><?php wp_nonce_field( 'nutzen_affiliate_admin' ); ?><input type="hidden" name="nutzen_affiliate_action" value="save"><input type="hidden" name="redirect_affiliate_id" value="<?php echo (int) $affiliate_id; ?>"><input type="hidden" name="user_id" value="<?php echo (int) $affiliate['user_id']; ?>"><h2>Perfil e aprovação</h2><p><strong><?php echo esc_html( $affiliate['user_email'] ); ?></strong></p><div class="nutzen-form-grid"><label><span>Código</span><input name="code" value="<?php echo esc_attr( $affiliate['code'] ); ?>"></label><label><span>Status</span><select name="status"><?php foreach ( self::statuses() as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $affiliate['status'], $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select></label><label class="is-wide"><span>Observações internas</span><textarea name="notes" rows="4"><?php echo esc_textarea( get_user_meta( $affiliate['user_id'], 'nutzen_affiliate_notes', true ) ); ?></textarea></label></div><?php submit_button( 'Salvar perfil' ); ?><a class="button" href="<?php echo esc_url( get_edit_user_link( $affiliate['user_id'] ) ); ?>">Abrir usuário</a></form>
			<article class="nutzen-settings-card"><h2>Dados de recebimento</h2><p><strong>Chave PIX</strong><br><?php echo $affiliate['pix_key_last4'] ? esc_html( strtoupper( $affiliate['pix_key_type'] ) . ' · •••• ' . $affiliate['pix_key_last4'] ) : 'Não cadastrada'; ?></p><p><strong>Titular</strong><br><?php echo esc_html( $affiliate['pix_holder_name'] ?: 'Não informado' ); ?></p><p class="description">A chave completa permanece criptografada e não é exibida no painel.</p></article></div>
			<h2>Links e campanhas</h2><div class="nutzen-table-wrap"><table class="widefat striped"><thead><tr><th>Produto</th><th>Campanha</th><th>Canal</th><th>Token</th><th>Cliques</th><th>Status</th></tr></thead><tbody><?php if ( ! $links ) : ?><tr><td colspan="6">Nenhum link criado.</td></tr><?php endif; foreach ( $links as $link ) : ?><tr><td><?php echo esc_html( $link['product_name'] ?: 'Produto removido' ); ?></td><td><?php echo esc_html( $link['campaign_name'] ?: 'Sem campanha' ); ?></td><td><?php echo esc_html( ucfirst( $link['channel'] ) ); ?></td><td><code><?php echo esc_html( $link['token'] ); ?></code></td><td><?php echo esc_html( number_format_i18n( $link['clicks'] ) ); ?></td><td><?php echo esc_html( $link['status'] ); ?></td></tr><?php endforeach; ?></tbody></table></div>
			<h2>Comissões</h2><div class="nutzen-table-wrap"><table class="widefat striped"><thead><tr><th>Pedido</th><th>Produto</th><th>Base</th><th>Comissão</th><th>Status</th></tr></thead><tbody><?php if ( ! $commissions ) : ?><tr><td colspan="5">Nenhuma comissão registrada.</td></tr><?php endif; foreach ( $commissions as $commission ) : $product = wc_get_product( $commission['variation_id'] ?: $commission['product_id'] ); ?><tr><td>#<?php echo esc_html( $commission['order_id'] ); ?></td><td><?php echo esc_html( $product ? $product->get_name() : 'Produto indisponível' ); ?></td><td><?php echo wp_kses_post( wc_price( $commission['calculation_base'] ) ); ?></td><td><?php echo wp_kses_post( wc_price( $commission['commission_amount'] ) ); ?></td><td><form method="post" class="nutzen-inline-form"><?php wp_nonce_field( 'nutzen_affiliate_admin' ); ?><input type="hidden" name="nutzen_affiliate_action" value="commission"><input type="hidden" name="redirect_affiliate_id" value="<?php echo (int) $affiliate_id; ?>"><input type="hidden" name="commission_id" value="<?php echo (int) $commission['id']; ?>"><select name="commission_status"><?php foreach ( array( 'pending' => 'Pendente', 'approved' => 'Aprovada', 'rejected' => 'Rejeitada', 'reversed' => 'Estornada' ) as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $commission['status'], $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select><button class="button">Atualizar</button></form></td></tr><?php endforeach; ?></tbody></table></div>
			<h2>Solicitações de saque</h2><div class="nutzen-table-wrap"><table class="widefat striped"><thead><tr><th>Ticket</th><th>Valor</th><th>Solicitado</th><th>Status e atendimento</th></tr></thead><tbody><?php if ( ! $withdrawals ) : ?><tr><td colspan="4">Nenhuma solicitação de saque.</td></tr><?php endif; foreach ( $withdrawals as $withdrawal ) : ?><tr><td><code><?php echo esc_html( $withdrawal['ticket_number'] ); ?></code></td><td><?php echo wp_kses_post( wc_price( $withdrawal['amount'] ) ); ?></td><td><?php echo esc_html( $withdrawal['created_at'] ); ?></td><td><form method="post" class="nutzen-inline-form"><?php wp_nonce_field( 'nutzen_affiliate_admin' ); ?><input type="hidden" name="nutzen_affiliate_action" value="withdrawal"><input type="hidden" name="redirect_affiliate_id" value="<?php echo (int) $affiliate_id; ?>"><input type="hidden" name="withdrawal_id" value="<?php echo (int) $withdrawal['id']; ?>"><select name="withdrawal_status"><?php foreach ( array( 'requested' => 'Solicitado', 'in_review' => 'Em análise', 'paid' => 'Pago', 'rejected' => 'Rejeitado', 'cancelled' => 'Cancelado' ) as $value => $label ) : ?><option value="<?php echo esc_attr( $value ); ?>" <?php selected( $withdrawal['status'], $value ); ?>><?php echo esc_html( $label ); ?></option><?php endforeach; ?></select><input name="withdrawal_note" value="<?php echo esc_attr( $withdrawal['note'] ); ?>" placeholder="Observação"><input name="payment_reference" value="<?php echo esc_attr( $withdrawal['payment_reference'] ); ?>" placeholder="Comprovante obrigatório para marcar pago"><button class="button">Atualizar</button></form></td></tr><?php endforeach; ?></tbody></table></div>
		</div>
		<?php
	}
}
