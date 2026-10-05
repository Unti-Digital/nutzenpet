import { Mail, ShieldCheck } from "lucide-react";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { contactDetails } from "../data/contact";

const sectionClass = "border-t border-slate-200 pt-8";
const headingClass = "text-xl font-black text-[#3E1255] sm:text-2xl";
const paragraphClass = "mt-3 text-sm leading-7 text-slate-600 sm:text-base";
const listClass = "mt-4 grid list-disc gap-2 pl-5 text-sm leading-7 text-slate-600 marker:text-[#FE8C05] sm:text-base";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />

      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <article className="reveal-up mx-auto max-w-4xl">
          <header>
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#FFF3E5]">
              <ShieldCheck className="h-7 w-7 text-[#FE8C05]" aria-hidden="true" />
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#3E1255]">Privacidade e transparência</p>
            <h1 className="mt-3 text-4xl font-black text-[#123F55] sm:text-5xl">Política de privacidade</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              Esta Política explica como a NutzenPet trata os seus dados pessoais quando você acessa o site, cria uma conta,
              realiza uma compra ou utiliza nossos canais e programas.
            </p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Última atualização: 5 de outubro de 2026</p>
          </header>

          <div className="mt-12 grid gap-8">
            <section className={sectionClass}>
              <h2 className={headingClass}>1. Quem é responsável pelos seus dados</h2>
              <p className={paragraphClass}>
                A controladora dos dados pessoais tratados neste site é <strong className="text-[#123F55]">NUTZEN PET NUTRICAO ANIMAL LTDA</strong>,
                inscrita no CNPJ sob o nº <strong className="text-[#123F55]">50.419.103/0001-69</strong>, identificada nesta Política como “NutzenPet”,
                “nós” ou “nosso”.
              </p>
              <p className={paragraphClass}>
                Para dúvidas ou solicitações relacionadas à privacidade, entre em contato pelo e-mail{" "}
                <a className="font-black text-[#3E1255] underline decoration-[#D9C7E3] underline-offset-4 hover:text-[#FE8C05]" href={contactDetails.emailHref}>
                  {contactDetails.email}
                </a>.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>2. Quais dados podemos coletar</h2>
              <p className={paragraphClass}>Dependendo da sua interação com a NutzenPet, podemos tratar:</p>
              <ul className={listClass}>
                <li><strong className="text-[#123F55]">Dados de cadastro e contato:</strong> nome, e-mail, telefone e informações de acesso à conta.</li>
                <li><strong className="text-[#123F55]">Dados de compra e entrega:</strong> endereço, CEP, produtos adquiridos, valores, frete, histórico e situação dos pedidos.</li>
                <li><strong className="text-[#123F55]">Dados de pagamento:</strong> meio escolhido, situação, identificadores da transação e CPF quando necessário para emitir boleto.</li>
                <li><strong className="text-[#123F55]">Dados de atendimento:</strong> mensagens, solicitações e informações fornecidas ao nosso suporte.</li>
                <li><strong className="text-[#123F55]">Dados de programas e parcerias:</strong> informações enviadas em candidaturas de lojistas, afiliados ou interessados em assinaturas, inclusive empresa, CNPJ, cidade, público e experiência, quando aplicável.</li>
                <li><strong className="text-[#123F55]">Dados técnicos:</strong> endereço IP, informações do navegador e do dispositivo, registros de acesso, cookies e dados necessários à segurança e ao funcionamento do site.</li>
              </ul>
              <p className={paragraphClass}>
                Os dados completos do cartão são inseridos em campos seguros e processados pelo Mercado Pago. A NutzenPet recebe apenas as informações
                necessárias para identificar a transação e acompanhar seu resultado.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>3. Como utilizamos os dados</h2>
              <p className={paragraphClass}>Utilizamos os dados pessoais para:</p>
              <ul className={listClass}>
                <li>criar e administrar sua conta, autenticar acessos e manter suas preferências;</li>
                <li>processar pedidos, pagamentos, entregas, cancelamentos, trocas e reembolsos;</li>
                <li>emitir documentos fiscais e manter registros comerciais e financeiros;</li>
                <li>prestar atendimento e enviar comunicações relacionadas à compra ou ao serviço solicitado;</li>
                <li>operar programas de afiliados, comissões, parcerias e assinaturas, quando utilizados;</li>
                <li>prevenir fraudes, abusos e incidentes de segurança;</li>
                <li>cumprir obrigações legais, regulatórias, fiscais e exercer direitos em processos;</li>
                <li>melhorar a estabilidade, a segurança e a experiência de navegação.</li>
              </ul>
              <p className={paragraphClass}>
                O tratamento ocorre conforme as bases legais aplicáveis, incluindo execução de contrato ou de procedimentos preliminares,
                cumprimento de obrigação legal ou regulatória, exercício regular de direitos, legítimo interesse e consentimento, quando necessário.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>4. Compartilhamento de dados</h2>
              <p className={paragraphClass}>
                Não vendemos dados pessoais. Podemos compartilhá-los, somente na medida necessária, com fornecedores que apoiam a operação da loja, como:
              </p>
              <ul className={listClass}>
                <li><strong className="text-[#123F55]">WooCommerce e WordPress:</strong> cadastro, catálogo, carrinho, pedidos e conta do cliente;</li>
                <li><strong className="text-[#123F55]">Mercado Pago:</strong> processamento e confirmação de pagamentos;</li>
                <li><strong className="text-[#123F55]">Melhor Envio, transportadoras e operadores logísticos:</strong> cotação, postagem, entrega e rastreamento;</li>
                <li><strong className="text-[#123F55]">Bling:</strong> gestão de produtos, estoque, vendas e documentos fiscais, conforme os recursos habilitados;</li>
                <li><strong className="text-[#123F55]">Provedores de tecnologia e hospedagem:</strong> funcionamento, armazenamento, segurança e manutenção do site;</li>
                <li>autoridades públicas, órgãos reguladores ou terceiros, quando houver obrigação legal ou necessidade de proteger direitos.</li>
              </ul>
              <p className={paragraphClass}>
                Alguns fornecedores podem armazenar ou processar informações fora do Brasil. Quando isso ocorrer, adotamos medidas compatíveis com a
                legislação aplicável para proteger os dados pessoais.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>5. Cookies e tecnologias semelhantes</h2>
              <p className={paragraphClass}>
                Utilizamos cookies necessários para manter a sessão de acesso, preservar o carrinho, proteger o site e viabilizar suas funcionalidades.
                Quando você acessa a loja por um link de afiliado, também podemos usar cookies para registrar a indicação pelo período informado no programa,
                normalmente de até 30 dias.
              </p>
              <p className={paragraphClass}>
                Você pode bloquear ou excluir cookies nas configurações do navegador. A desativação dos cookies necessários, porém, pode impedir o login,
                apagar o carrinho ou comprometer partes da compra. Caso sejam ativados cookies não essenciais, apresentaremos opções de escolha apropriadas.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>6. Armazenamento e segurança</h2>
              <p className={paragraphClass}>
                Mantemos os dados pelo tempo necessário para cumprir as finalidades descritas nesta Política, atender obrigações legais e regulatórias,
                preservar registros de transações e exercer ou defender direitos. Depois disso, os dados são eliminados ou anonimizados, salvo quando a
                conservação for permitida ou exigida por lei.
              </p>
              <p className={paragraphClass}>
                Adotamos medidas técnicas e administrativas para reduzir riscos de acesso não autorizado, perda, alteração ou divulgação indevida.
                Apesar desses cuidados, nenhum ambiente digital é totalmente imune a incidentes.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>7. Seus direitos</h2>
              <p className={paragraphClass}>Nos termos da legislação aplicável, você pode solicitar, quando cabível:</p>
              <ul className={listClass}>
                <li>confirmação da existência de tratamento e acesso aos dados;</li>
                <li>correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
                <li>portabilidade, observadas as normas aplicáveis e os segredos comercial e industrial;</li>
                <li>informações sobre compartilhamentos e sobre a possibilidade de não fornecer consentimento;</li>
                <li>revogação do consentimento e eliminação dos dados tratados com base nele, ressalvadas as hipóteses legais de conservação;</li>
                <li>oposição a tratamentos realizados em desconformidade com a legislação.</li>
              </ul>
              <p className={paragraphClass}>
                Para proteger sua conta e evitar fraudes, poderemos solicitar informações que permitam confirmar sua identidade antes de atender ao pedido.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>8. Dados de crianças e adolescentes</h2>
              <p className={paragraphClass}>
                A loja é destinada a pessoas com capacidade legal para contratar. Não coletamos intencionalmente dados de crianças. Caso o responsável
                identifique um cadastro ou envio indevido de informações, poderá solicitar a análise e a exclusão pelo nosso canal de privacidade.
              </p>
            </section>

            <section className={sectionClass}>
              <h2 className={headingClass}>9. Atualizações desta Política</h2>
              <p className={paragraphClass}>
                Esta Política poderá ser atualizada para refletir mudanças nos serviços, nos fornecedores ou na legislação. A versão vigente estará sempre
                disponível nesta página, acompanhada da data da última atualização.
              </p>
            </section>

            <section className="rounded-lg border border-[#E2D4E9] bg-[#F5EFF8] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Mail className="mt-1 h-6 w-6 shrink-0 text-[#FE8C05]" aria-hidden="true" />
                <div>
                  <h2 className={headingClass}>10. Fale conosco</h2>
                  <p className={paragraphClass}>
                    Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados pessoais, escreva para{" "}
                    <a className="font-black text-[#3E1255] underline decoration-[#D9C7E3] underline-offset-4 hover:text-[#FE8C05]" href={contactDetails.emailHref}>
                      {contactDetails.email}
                    </a>. Informe no assunto “Privacidade de dados” para facilitar o atendimento.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
