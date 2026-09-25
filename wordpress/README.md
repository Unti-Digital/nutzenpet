# Plugins WordPress NutzenPet

Esta pasta é a fonte versionada dos plugins personalizados. O destino local é:

`C:\xampp\htdocs\nutzen-wp\wp-content\plugins\`

Diretórios:

- `plugins/nutzen-fields`
- `plugins/nutzen-switch`
- `plugins/nutzen-affiliates`
- `plugins/nutzen-subscriptions`
- `import`: manifesto seguro do catálogo.
- `tools`: importador CLI.
- `tests`: testes de integração com limpeza automática.

Os plugins não modificam o núcleo do WordPress nem o WooCommerce. Desabilitar um módulo no Nutzen Switch não remove dados. Cada plugin mantém funcionamento administrativo independente caso o Nutzen Switch não esteja ativo.

## Fluxos comerciais

- **Lojista parceiro:** o formulário público cria uma candidatura privada em `Nutzen Switch > Candidaturas`. A equipe pode analisar, aprovar, rejeitar ou mover o registro para a lixeira.
- **Afiliado:** a candidatura cria ou vincula uma conta de cliente. A aprovação no CPT habilita o painel, o código e o link do afiliado.
- **Indicação:** utiliza atribuição `last click` por cookie. O prazo padrão é de 30 dias e pode ser alterado em `Nutzen Switch > Afiliados`.
- **Comissões:** são configuradas por produto e continuam pendentes até tratamento administrativo. Não existe pagamento automático.
- **Saque:** exige saldo aprovado, respeita o mínimo configurado de R$ 100 e gera um ticket para atendimento no painel.
- **Assinatura:** o formulário do Nutzen Club registra a composição pretendida do kit. A assinatura operacional é gerenciada em `Nutzen Switch > Assinaturas`; nenhuma cobrança automática ocorre sem gateway compatível.

## Campos de produto

`Nutzen Switch > Campos de produto` funciona como um construtor de campos: permite adicionar, duplicar, ordenar e remover definições, escolher o tipo e controlar a exposição ao frontend. Remover uma definição preserva os metadados já gravados nos produtos.

## Banners rotativos

`Nutzen Switch > Banners rotativos` administra as artes adicionais exibidas na hero da home. Cada banner possui imagem desktop, imagem mobile, link opcional, ordem e o status nativo de publicação do WordPress.

- Desktop recomendado: 1920 x 840 px.
- Mobile recomendado: 1080 x 1350 px.
- Banners em rascunho ou agendados para o futuro não aparecem no frontend.
- A imagem desktop é usada como fallback quando a versão mobile não foi informada.
- Endpoint público: `GET /wp-json/nutzen/v1/banners`.
- Publicações e alterações invalidam a tag `nutzen-banners` quando o webhook está configurado.

## Portal de afiliados

O portal autenticado fica em `/painel-afiliado` e é separado da área de cliente. Apenas usuários com cadastro de afiliado aprovado conseguem acessar os dados.

- Campanhas e múltiplos links por produto e canal.
- Cookie de atribuição `last click`, com prazo configurável no WordPress.
- Cliques deduplicados em janelas de 30 minutos sem armazenar o IP em claro.
- Pedidos, comissões e conversão calculados somente a partir de eventos registrados.
- Chave PIX criptografada com AES-256-GCM e mascarada nas respostas públicas.
- Solicitações de saque idempotentes: somente um ticket aberto por afiliado.
- Pagamento exclusivamente manual; o administrador precisa informar uma referência antes de marcar o ticket como pago.

Endpoints autenticados:

- `GET /wp-json/nutzen/v1/affiliate/dashboard`
- `GET|POST /wp-json/nutzen/v1/affiliate/campaigns`
- `GET|POST /wp-json/nutzen/v1/affiliate/links`
- `GET|POST /wp-json/nutzen/v1/affiliate/pix`
- `GET|POST /wp-json/nutzen/v1/affiliate/withdrawals`

## Assinaturas por produto

Cada produto pode ser marcado como elegível e receber um conjunto explícito de planos na aba de dados do produto no WooCommerce. O frontend mostra a área `Quero assinar este produto` para SKUs elegíveis e informa quando ainda falta associar um plano publicado.

- Frequência e desconto são administrados nos planos `nutzen_plan`.
- Compra avulsa e assinatura usam o mesmo catálogo, mas são finalizadas separadamente para preservar totais, frete e recorrência.
- O plano é validado no servidor, o desconto é calculado pelo WooCommerce e os dados recorrentes são gravados no item do pedido.
- O carrinho e o checkout exibem modalidade, frequência e total por ciclo. Sem gateway recorrente, nenhuma cobrança é simulada.
- Quando um pedido recorrente for criado por um cliente autenticado, a assinatura nasce como `pending_gateway`; ativação e renovação dependem do gateway homologado.
- Mudança de frequência passa para `pending_gateway` e não gera cobrança.
- Pausa, cancelamento, reativação, histórico e isolamento por cliente continuam no painel atual de Minha Conta.
- `Monte seu Kit` permanece um fluxo comercial separado da assinatura de um SKU individual.

## Administração de afiliados

`Nutzen Switch > Afiliados` abre uma listagem operacional com busca, filtros e indicadores. O perfil robusto só é carregado ao selecionar `Ver afiliado` e concentra links, campanhas, comissões, PIX mascarado e tickets de saque daquele participante. As regras do programa ficam em uma tela separada.

## Administração de assinantes

`Nutzen Switch > Assinaturas` abre primeiro a listagem de assinantes, com busca, filtro por status e indicadores reais. `Ver assinante` abre o painel individual com todas as assinaturas daquele cliente, recorrência, desconto, próxima cobrança e histórico operacional. A criação manual permanece disponível em uma tela separada e não realiza cobranças.

Na edição de produtos, `Informações nutricionais` utiliza um repetidor visual com os campos `Item nutricional` e `Valor`. Internamente, o plugin continua armazenando o conteúdo como JSON para manter compatibilidade com a Store API e com o frontend; o administrador não precisa editar JSON manualmente.

O bloco `Como usar` é administrado por dois campos no mesmo painel técnico do produto:

- `Recomendações de uso`: texto com orientações gerais de consumo e adaptação.
- `Tabela de quantidade diária`: repetidor com `Peso do animal` e `Quantidade diária`; suas linhas alimentam diretamente a tabela exibida no frontend.
