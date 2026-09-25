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

## Programas comerciais — 24/09/2026

- Criado o CPT privado `nutzen_application` para candidaturas de lojistas parceiros, afiliados e interessados no Nutzen Club.
- As candidaturas possuem dados editáveis, status administrativo e integração de aprovação com o cadastro de afiliados.
- Implementado cadastro público específico para afiliados e seleção de kit/recorrência para assinatura, ambos com criação segura de conta quando necessário.
- Implementada atribuição de afiliado por `last click`, armazenada em cookie `HttpOnly` por 30 dias e encaminhada ao checkout WooCommerce.
- Implementados saldo aprovado, saque mínimo de R$ 100 e chamados de saque com status e observações administrativas.
- O painel de afiliados no frontend voltou a exibir métricas, link, comissões reais e tickets, sem dados simulados.
- Afiliados, assinaturas e chamados podem ser aprovados, rejeitados, pausados ou removidos operacionalmente no painel WordPress.
- Todos os campos públicos de senha receberam controle de mostrar/ocultar.
- O Nutzen Switch ganhou o módulo de banners rotativos com artes desktop/mobile, link, ordem, status editorial e integração com a hero da home.
- A assinatura ID 4 do usuário de homologação permanece disponível para testar os estados ativo/pausado; não houve pedido, pagamento ou cobrança.
- Validação: `npm run lint`, `npm run build`, sintaxe PHP e 30 testes integrados aprovados.

## Portal comercial e otimização — 24/09/2026

- O painel de afiliados foi separado de Minha Conta e disponibilizado em `/painel-afiliado`, protegido pela sessão do cliente e pelo status de aprovação do afiliado.
- Implementadas campanhas, links individuais por produto/canal, múltiplos links, cópia, filtros e desempenho real por link.
- Implementados cliques deduplicados, atribuição de pedidos e métricas reais de conversão. Nenhuma métrica de demonstração é exibida.
- Chaves PIX agora são criptografadas e retornam sempre mascaradas. Saques continuam manuais, exigem PIX e bloqueiam tickets simultâneos.
- O painel administrativo ganhou busca, filtros e indicadores para afiliados, comissões, saques e assinaturas.
- Produtos elegíveis podem receber planos específicos. A Store API expõe apenas os planos associados ao SKU.
- A alteração de frequência é registrada como solicitação pendente de gateway; nenhuma cobrança ou renovação foi simulada.
- Catálogo e detalhes de produto passaram a usar cache de cinco minutos com tags para revalidação por webhook.
- Removido o carregamento das fontes Geist não utilizadas, mantendo a pilha tipográfica local do sistema.
- Adicionados metadados globais, Open Graph, Twitter, `robots.txt`, `sitemap.xml` e metadados dinâmicos de produto.
- Imagens oficiais continuam preservadas e entregues por `next/image`; artes desktop/mobile administradas no WordPress usam `picture`.
- Backup dos plugins anteriores: `C:\xampp\htdocs\nutzen-wp-backups\plugins-pre-affiliate-portal-20260924`.

### Validação desta etapa

- `npm run lint`: aprovado.
- `npx tsc --noEmit`: aprovado.
- `npm run build`: aprovado, 39 rotas compiladas.
- Sintaxe PHP: aprovada nos plugins e testes alterados.
- Integração WordPress/WooCommerce: 42 testes aprovados e 0 falhas.
- Rotas locais Next.js, catálogo público e Store API: HTTP 200.

### Configurações pendentes

- Substituir o plano mensal de homologação pelos planos comerciais definitivos quando frequência, desconto e condições forem aprovados.
- Confirmar prazo definitivo de atribuição, base de cálculo, tributos, descontos e conflitos de indicação.
- Confirmar se o saque mínimo atual de R$ 100 será a regra final; ele permanece configurável no painel.
- Definir prazos de análise e pagamento de saques.
- Homologar gateway com suporte a recorrência, frete recorrente e políticas de pausa/cancelamento.
- Configurar frete, zonas e métodos do WooCommerce antes da produção.

## Carrinho recorrente e admin de afiliados — 25/09/2026

- Restaurada a CTA `Quero assinar este produto` para produtos elegíveis.
- O carrinho da Store API agora recebe e valida `purchase_type` e `plan_id`, calcula o desconto recorrente no WooCommerce e devolve os dados estruturados ao Next.js.
- Compra avulsa e assinatura não podem coexistir no mesmo carrinho. O frontend solicita confirmação antes de substituir uma compra avulsa por uma assinatura.
- Carrinho e checkout distinguem total inicial e total recorrente, exibindo plano e frequência sem simular cobrança ou renovação.
- Itens recorrentes são persistidos no pedido; a assinatura é criada como `pending_gateway` somente para cliente autenticado e de forma idempotente.
- O plano mensal de homologação ID 42 foi associado aos nove SKUs elegíveis que estavam sem plano. Configurações existentes não foram substituídas.
- O painel WordPress de afiliados foi separado em listagem, perfil individual, inclusão e regras do programa.
- O perfil individual concentra dados reais de links, campanhas, cliques, pedidos, comissões, PIX mascarado e chamados de saque.
- Alterações em planos de assinatura agora invalidam o cache do catálogo pelo webhook do Nutzen Switch.
- Backup anterior à sincronização: `C:\xampp\htdocs\nutzen-wp-backups\plugins-pre-subscription-checkout-20260925-102310`.

### Validação desta etapa

- `npm run lint`, `npx tsc --noEmit` e `npm run build`: aprovados; 39 rotas.
- Sintaxe PHP: aprovada nos plugins alterados.
- Integração WordPress/WooCommerce: 44 testes aprovados, 0 falhas.
- Store API via Next.js: assinatura adicionada com plano ID 42, desconto de 10% e token de carrinho persistido.
- Proteção de modalidades: tentativa de misturar compra avulsa e assinatura bloqueada com HTTP 409.

### Pendências recorrentes

- Homologar um gateway WooCommerce compatível com checkout headless e cobrança recorrente.
- Definir a data de primeira renovação conforme retorno do gateway e as regras comerciais.
- Confirmar se o plano mensal de homologação será substituído por planos comerciais definitivos antes da produção.

## Painel de assinantes e tabela nutricional — 25/09/2026

- A administração de assinaturas passou a abrir em uma listagem de assinantes, com busca, filtro, indicadores e acesso ao painel individual.
- O painel individual reúne todas as assinaturas do cliente, edição de plano, status, quantidade, recorrência, desconto, próxima cobrança e histórico de eventos.
- A criação manual de assinatura foi isolada em uma tela própria e continua sem gerar cobrança.
- A edição de informações nutricionais agora usa linhas repetíveis de nome e valor, com adição, remoção e ordenação.
- O armazenamento JSON e a resposta da Store API foram preservados, portanto não houve migração nem perda dos dados existentes.
- Backup anterior à sincronização: `C:\xampp\htdocs\nutzen-wp-backups\admin-subscriptions-fields-20260925-110401`.

### Validação desta etapa

- Sintaxe PHP e JavaScript: aprovada.
- Integração WordPress/WooCommerce: 46 testes aprovados e 0 falhas, incluindo os novos testes de regressão.
- Renderização administrativa: listagem, painel individual e repetidor nutricional aprovados com dados locais.

## Guia diário de alimentação — 25/09/2026

- Criado o campo repetível `Tabela de quantidade diária` com as colunas `Peso do animal` e `Quantidade diária`.
- O texto de `Recomendações de uso` continua editável separadamente para instruções gerais.
- A Store API passou a expor `feeding_guide`, consumido pelo frontend na aba `Como usar`.
- As tabelas visuais existentes foram importadas para os nove produtos sem sobrescrever valores previamente cadastrados.
- Backup anterior à sincronização: `C:\xampp\htdocs\nutzen-wp-backups\feeding-guide-20260925-111758`.
- Validação final: build Next.js aprovado e 48 testes de integração aprovados, sem falhas.
