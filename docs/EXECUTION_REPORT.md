# Relatório de execução — integração headless

Data da execução: 21/09/2026.

## Auditoria

- Frontend localizado em `C:\Trabalho\nutzenpet\meu-prototipo`.
- Next.js 16.3.4 com App Router e React 19.2.8.
- Carrinho anterior armazenava somente slugs e quantidades em `localStorage`.
- WordPress 7.1.1, WooCommerce 11.1.1, PHP 8.2.12 e HPOS ativo.
- Apenas WooCommerce estava ativo antes da integração.
- Store API acessível e vazia porque não havia produtos cadastrados.
- WordPress não possuía repositório Git nem WP-CLI.

## Ponto de recuperação

Criado em:

`C:\xampp\htdocs\nutzen-wp-backups\20260921-201227`

- Dump SQL: `database.sql`.
- Cópia verificada dos plugins: 5.863 arquivos, 56.431.971 bytes.

## Implementado

- Cliente centralizado para WooCommerce Store API.
- Fallback estático quando WordPress está indisponível ou sem produtos publicados.
- BFF do carrinho com `Cart-Token` em cookie `HttpOnly`.
- Cupom, totais, endereço, entrega e seleção de método de frete.
- Checkout sem campos ou cobranças fictícias.
- Autenticação headless com token opaco e hash no WordPress.
- Perfil, endereços e pedidos isolados por cliente.
- Área Minha Conta alimentada por dados reais.
- Webhook HMAC de revalidação de catálogo.
- Quatro plugins próprios versionados e instalados.
- Importador idempotente com 9 SKUs criados como rascunho.
- Categorias, atributos, imagens e campos técnicos importados.

## Testes executados

- `npm run lint`: aprovado após os ajustes finais.
- `npm run build`: aprovado com 34 rotas.
- Sintaxe PHP: quatro plugins, importador e testes aprovados.
- Plugins e banco: 20 testes aprovados, 0 falhas.
- Store API: catálogo publicado temporariamente e restaurado a rascunho.
- Carrinho: sessão, adição, remoção e total aprovados.
- Cupom: desconto de 10% aplicado e removido; cupom temporário excluído.
- Cliente: login, perfil, endereço, pedidos, logout e bloqueio pós-logout aprovados; usuário temporário excluído.
- Webhook: duas invalidações registradas com HTTP 200.
- Frete: WooCommerce respondeu sem método disponível, conforme configuração atual.

## Estado dos dados

- Produtos publicados: 0.
- Produtos Nutzen em rascunho: 9.
- Pedidos de teste: removidos.
- Usuários de teste: removidos.
- Cupons de teste: removidos.
- Comissões e assinaturas de teste: removidas.

## Bloqueios e decisões pendentes

- Os preços vieram do protótipo e precisam de confirmação comercial.
- Não existe gateway de pagamento instalado/homologado.
- Não existem zonas ou métodos de frete configurados.
- Não existem planos de assinatura publicados.
- Cadastro público de clientes foi habilitado com papel padrão `customer`; confirmação de e-mail permanece pendente para produção.
- Comissão automática continua pendente e nunca é aprovada/paga automaticamente.
- O backend local precisa de hospedagem HTTPS antes do deploy integrado na Vercel.

## Atualização de homologação — 22/09/2026

- A área do cliente passou a permitir edição de dados pessoais e endereço completo de entrega/faturamento.
- O popup de usuário do cabeçalho agora consulta a sessão: visitantes recebem acesso ao login/cadastro e clientes autenticados veem nome, e-mail, conta e pedidos.
- O usuário local `Daniel Dev` (ID 8) foi aprovado como afiliado para homologação.
- Foi criada uma assinatura mensal de homologação vinculada ao produto ID 13, com 10% de desconto, status ativo e `last_order_id = 0`.
- A assinatura de homologação não criou pedido, pagamento ou cobrança recorrente.
- O Nutzen Switch passou a personalizar o painel e o login do WordPress, além de exibir indicadores e atalhos operacionais.
- O endpoint de assinaturas agora retorna também os nomes do plano e do produto.
- Validação adicional: edição de endereço via BFF aprovada com usuário temporário; usuário removido ao final.
- `npm run lint`, `npm run build`, sintaxe PHP e os 22 testes integrados foram aprovados novamente.
- A validação de segurança corrigiu e passou a cobrir explicitamente o bloqueio anônimo dos endpoints de afiliados e assinaturas.
