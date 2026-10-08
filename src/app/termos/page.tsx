import { ContentPage } from "@/components/content-page";

export const metadata = { title: "Termos de uso" };

export default function TermsPage() {
  return <ContentPage title="Termos de uso"><p>Copyright © Samucar. Reservados todos os direitos.</p><p>O texto, imagens, gráficos, materiais e conteúdos deste site, incluindo o seu desenho, configuração e forma de apresentação, estão sujeitos às disposições legais aplicáveis à proteção de direitos de autor e de propriedade intelectual.</p><p>Estes elementos não poderão ser copiados para uso comercial ou distribuição, nem modificados ou publicados noutros sites sem autorização prévia da Samucar.</p><h2>Informação sobre viaturas</h2><p>Os elementos constantes neste site são meramente informativos e não têm caráter contratual. Preços, equipamento e características devem ser confirmados junto da Samucar antes da compra.</p></ContentPage>;
}
