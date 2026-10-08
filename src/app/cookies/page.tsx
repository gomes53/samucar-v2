import { ContentPage } from "@/components/content-page";

export const metadata = { title: "Política de cookies" };

export default function CookiesPage() {
  return <ContentPage title="Política de cookies"><p>Cookies são pequenos ficheiros de texto guardados no seu dispositivo que permitem recolher informação sobre a sua experiência de utilização e compilar estatísticas sobre a atividade do website.</p><h2>Tipos de cookies</h2><ul><li><strong>Cookies próprios:</strong> geridos por este domínio.</li><li><strong>Cookies de terceiros:</strong> geridos por outro domínio.</li><li><strong>Cookies persistentes:</strong> armazenados no equipamento por um período definido.</li><li><strong>Cookies de sessão:</strong> eliminados no final da sessão.</li></ul><h2>Como gerir cookies</h2><p>Pode configurar o navegador para recusar ou remover cookies. A sua não aceitação poderá afetar algumas funcionalidades do website.</p><p>Este site utiliza apenas cookies técnicos necessários e, quando expressamente consentido, cookies de análise. Os cookies não são utilizados para finalidades diferentes das aqui descritas.</p></ContentPage>;
}
