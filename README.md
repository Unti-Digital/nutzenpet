# NutzenPet Headless Commerce

Frontend Next.js conectado a WordPress e WooCommerce em arquitetura headless. O WooCommerce é a fonte oficial de produtos, preços, estoque, cupons, carrinho, entrega, clientes e pedidos. O Next.js preserva a experiência visual e atua como Backend for Frontend (BFF).

## Arquitetura

```text
Navegador
  -> Next.js App Router
     -> Route Handlers /api/* (BFF)
        -> WordPress REST API
        -> WooCommerce Store API

WordPress + WooCommerce
  -> nutzen-fields
  -> nutzen-switch
  -> nutzen-affiliates
  -> nutzen-subscriptions
```

- Next.js: `16.3.4`, React `19.2.8`, TypeScript e Tailwind CSS.
- WordPress local: `C:\xampp\htdocs\nutzen-wp`.
- WooCommerce: Store API para catálogo e carrinho; REST própria somente onde necessário.
- Sessão do carrinho: `Cart-Token` armazenado pelo Next.js em cookie `HttpOnly`.
- Sessão de cliente: token opaco de 256 bits; somente o hash SHA-256 é salvo no WordPress.
- Cache: catálogo com tags e invalidação por webhook HMAC.
- HPOS: os quatro plugins declaram compatibilidade.

## Ambiente

Copie as chaves de `.env.example` para um arquivo local de ambiente. Nunca use prefixo `NEXT_PUBLIC_` em segredos.

```dotenv
WORDPRESS_URL=http://localhost/nutzen-wp
FRONTEND_URL=http://localhost:3000
NUTZEN_REVALIDATE_SECRET=uma-chave-longa-e-aleatoria
WOOCOMMERCE_CONSUMER_KEY=
WOOCOMMERCE_CONSUMER_SECRET=
```

As credenciais da REST API administrativa ainda não são necessárias no navegador e não devem ser expostas. O ambiente de desenvolvimento local usa `.env.development.local`, que não é versionado.

## Instalação local

1. Inicie Apache e MySQL no XAMPP.
2. Confirme `http://localhost/nutzen-wp/wp-json/`.
3. Copie os diretórios de `wordpress/plugins/` para `C:\xampp\htdocs\nutzen-wp\wp-content\plugins\`.
4. Ative `Nutzen Fields`, `Nutzen Switch`, `Nutzen Affiliates` e `Nutzen Subscriptions` no WordPress.
5. Em **Nutzen Switch**, configure a URL do frontend e o mesmo segredo usado em `NUTZEN_REVALIDATE_SECRET`.
6. Execute `npm install` e `npm run dev`.
7. Acesse `http://localhost:3000`.

O Nutzen Switch nunca exibe novamente o segredo armazenado. Como o BFF é same-origin, CORS não é necessário na configuração local atual.

## Produtos

Foram identificados 9 SKUs em 3 linhas:

- Cães, raças médias e grandes: 1 kg, 3 kg e 15 kg.
- Cães, raças pequenas: 1 kg, 3 kg e 10 kg.
- Gatos adultos castrados: 1 kg, 3 kg e 10,1 kg.

Cada embalagem é um produto simples independente. Isso permite preço, estoque, cupom, promoção, URL e comissão próprios, como solicitado. A linha e o peso são atributos para agrupamento visual.

### Importação segura

Prévia sem escrita:

```powershell
C:\xampp\php\php.exe wordpress\tools\import-products.php `
  --wp=C:/xampp/htdocs/nutzen-wp `
  --assets=C:/Trabalho/nutzenpet/meu-prototipo/public
```

Aplicação como rascunho:

```powershell
C:\xampp\php\php.exe wordpress\tools\import-products.php `
  --wp=C:/xampp/htdocs/nutzen-wp `
  --assets=C:/Trabalho/nutzenpet/meu-prototipo/public `
  --apply
```

Atualização somente de itens pertencentes ao importador:

```powershell
C:\xampp\php\php.exe wordpress\tools\import-products.php `
  --wp=C:/xampp/htdocs/nutzen-wp `
  --assets=C:/Trabalho/nutzenpet/meu-prototipo/public `
  --apply --update
```

`--publish` exige `--apply` e só deve ser usado após aprovação de preços, imagens, estoque e conteúdo. A importação usa `_nutzen_import_key`, não duplica mídia idêntica e não sobrescreve produtos que não pertençam ao importador.

## Plugins

### Nutzen Fields

- Metabox organizada no produto.
- Ingredientes, composição, nutrição, benefícios, uso, armazenamento, porte, fase, peso, PDF e informações técnicas.
- Metadados sanitizados e disponíveis na REST API.
- Extensão `extensions.nutzen-fields` na Store API de produtos.

### Nutzen Switch

- Estado dos módulos e dependências.
- Diagnóstico de REST API e WooCommerce.
- URLs de conexão e segredo de webhook protegido.
- Logs técnicos limitados aos 50 eventos mais recentes.
- Webhook assinado para invalidar o catálogo Next.js.
- Sessões headless de clientes.

### Nutzen Affiliates

- Cadastro administrativo e status do afiliado.
- Código e link exclusivos.
- Comissão percentual ou fixa por SKU e por variação.
- Variações não herdam comissão do produto principal.
- Registro idempotente por item do pedido.
- Reversão configurável em reembolso.
- Painel REST isolado por usuário.
- Inscrição pública, aprovação automática e pagamentos permanecem desativados.

### Nutzen Subscriptions

- Planos administrativos com intervalo, unidade e desconto.
- Produtos elegíveis.
- Tabelas de assinaturas e histórico.
- Pausa, cancelamento e reativação com transições validadas.
- Nenhuma renovação cria pedido ou pagamento sem gateway compatível.

## Endpoints

### Next.js BFF

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/api/commerce/products` | Catálogo adaptado para os componentes existentes |
| GET/POST | `/api/store/cart/*` | Carrinho, cupom, cliente e frete via Store API |
| POST | `/api/revalidate` | Webhook HMAC do WordPress |
| GET/POST | `/api/auth/[action]` | Login, cadastro, perfil, pedidos e endereços |
| POST | `/api/subscriptions/[id]/[action]` | Pausa, cancelamento e reativação |

### WordPress

| Método | Endpoint | Proteção |
|---|---|---|
| POST | `/wp-json/nutzen/v1/auth/register` | Público, sujeito à configuração do WooCommerce e rate limit |
| POST | `/wp-json/nutzen/v1/auth/login` | Público com rate limit |
| GET/POST | `/wp-json/nutzen/v1/auth/me` | Bearer token |
| POST | `/wp-json/nutzen/v1/auth/logout` | Bearer token |
| GET | `/wp-json/nutzen/v1/customer/orders` | Somente pedidos do cliente autenticado |
| GET/POST | `/wp-json/nutzen/v1/customer/addresses` | Somente dados do cliente autenticado |
| GET | `/wp-json/nutzen/v1/affiliate/me` | Afiliado aprovado autenticado |
| GET | `/wp-json/nutzen/v1/affiliate/commissions` | Afiliado aprovado autenticado |
| GET | `/wp-json/nutzen/v1/subscription/plans` | Público |
| GET | `/wp-json/nutzen/v1/subscription/me` | Cliente autenticado |
| POST | `/wp-json/nutzen/v1/subscription/{id}/{action}` | Proprietário da assinatura |

## Testes

Frontend:

```powershell
npm run lint
npm run build
```

Plugins e banco:

```powershell
C:\xampp\php\php.exe wordpress\tests\integration.php --wp=C:/xampp/htdocs/nutzen-wp
```

O teste PHP cria dados temporários para comissão e assinatura, verifica idempotência e permissões, e remove tudo no bloco de limpeza.

## Pendências de produção

- Revisar e aprovar preços, imagens, estoque, dimensões e conteúdo antes de publicar os 9 SKUs.
- Configurar um domínio WordPress público com HTTPS; a Vercel não acessa `localhost`.
- Instalar e homologar gateway WooCommerce compatível com checkout headless e cobrança recorrente.
- Definir zonas, métodos e integrações de frete no WooCommerce.
- Aprovar base de comissão, impostos, descontos, atribuição, prazo e política de reembolso.
- Definir regras de elegibilidade, saque e documentação fiscal dos afiliados.
- Criar e aprovar planos comerciais de assinatura.
- Cadastro público de clientes habilitado; revisar textos legais, política de senha e confirmação de e-mail antes da produção.
- Configurar e-mail transacional, política de privacidade/LGPD, observabilidade e backups de produção.

O projeto não deve ser considerado pronto para produção enquanto pagamentos, frete e regras comerciais permanecerem pendentes.
