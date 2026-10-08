import { ContentPage } from "@/components/content-page";

export const metadata = { title: "Intermediação de Crédito" };

const identityDetails = [
  ["1. Nome / firma ou denominação", "Automóveisamucar - Mediação Automóvel Lda."],
  ["2. Domicílio profissional / sede social", "Estrada da Algazarra nº 1, 2810-014 Almada"],
  ["3. Número de registo junto do Banco de Portugal", "0002884"],
  ["4. Contacto telefónico", "211 818 706"],
  ["5. Endereço de correio eletrónico", "geral.mediauto@gmail.com"],
  ["6. Categoria de intermediário de crédito", "Intermediário a Título Acessório"],
] as const;

const serviceDetails = [
  ["8. Regime de exclusividade", "Não"],
  ["9. Serviços de intermediação de crédito", "Apresentação ou proposta de contratos de crédito a consumidores"],
  ["10. Serviços de consultoria", "Não"],
  ["11. Entidade que garante a responsabilidade civil", "Ageas Portugal, Companhia de Seguros S.A."],
  ["12. Número dos contratos de seguro", "008410231981"],
  ["13. Período de validade dos contratos", "De: 28/02/2026 | Até: 27/02/2027"],
] as const;

export default function CreditIntermediationPage() {
  return (
    <ContentPage title="Intermediação de Crédito">
      <dl className="credit-details">
        {identityDetails.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {label.startsWith("4.") ? <a href="tel:+351211818706">{value}</a> : label.startsWith("5.") ? <a href={`mailto:${value}`}>{value}</a> : value}
            </dd>
          </div>
        ))}
      </dl>

      <h2>7. Mutuantes ou grupo de mutuantes com quem mantém contrato de vinculação</h2>
      <ul>
        <li>321Crédito Instituição Financeira de Crédito S.A.</li>
        <li>Cofidis</li>
        <li>Banco Credibom S.A.</li>
        <li>BNP Paribas Personal Finance S.A. - Sucursal em Portugal</li>
        <li>Bicredit Sociedade Financeira de Crédito S.A.</li>
        <li>Banco Primus</li>
      </ul>

      <dl className="credit-details">
        {serviceDetails.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <h2>14. Informação legal</h2>
      <p>O registo do intermediário de crédito pode ser consultado no <a href="https://clientebancario.bportugal.pt/" target="_blank" rel="noreferrer">Portal do Cliente Bancário</a>.</p>
      <p>É proibido ao intermediário de crédito receber ou entregar quaisquer valores relacionados com a formação, a execução e o cumprimento antecipado dos contratos de crédito, nos termos do artigo 46.º do regime jurídico dos intermediários de crédito, aprovado pelo Decreto-Lei n.º 81-C/2017, de 7 de julho.</p>
      <p>A atividade de Automóveisamucar - Mediação Automóvel Lda. como intermediário de crédito está sujeita à supervisão do Banco de Portugal.</p>

      <h2>Pedido de financiamento</h2>
      <p>Se pretende adquirir ou trocar a sua viatura, poderemos mediar o seu financiamento através de instituições financeiras com soluções adequadas a cada cliente. Reúna os documentos indicados para avaliação da sua proposta e peça-nos uma simulação.</p>

      <h2>Documentos para particulares</h2>
      <ul>
        <li>Bilhete de Identidade ou Cartão de Cidadão</li>
        <li>Número de Contribuinte</li>
        <li>Recibo de vencimento dos últimos 3 meses</li>
        <li>I.R.S. do último ano civil</li>
        <li>NIB (número de identificação bancária)</li>
        <li>Um recibo ou fatura de água, luz ou telefone</li>
      </ul>

      <h2>Documentos para empresas</h2>
      <ul>
        <li>Bilhete de Identidade dos sócios</li>
        <li>Número de Contribuinte dos sócios</li>
        <li>Recibo de água, eletricidade ou telefone dos sócios</li>
        <li>NIB da conta bancária dos sócios</li>
        <li>IRS dos sócios</li>
        <li>Certidão do registo comercial atual</li>
        <li>Início de atividade</li>
        <li>Último balanço</li>
        <li>NIB da conta bancária</li>
        <li>Número de contribuinte da empresa</li>
        <li>Recibo de água, eletricidade ou telefone</li>
        <li>IRS</li>
      </ul>
    </ContentPage>
  );
}
