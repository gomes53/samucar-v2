import type { Metadata } from "next";
import { VehicleRequestPage } from "@/components/vehicle-request-page";

export const metadata: Metadata = {
  title: "Compramos o seu carro",
  description: "Venda a sua viatura à Samucar. Envie os dados do seu automóvel e receba uma avaliação personalizada.",
  alternates: { canonical: "/compramos-o-seu-carro" },
};

export default function SellYourCarPage() {
  return (
    <VehicleRequestPage
      type="sell"
      eyebrow="Avaliação de viaturas"
      title="Compramos o seu carro"
      introduction="Quer vender a sua viatura? Partilhe connosco os dados principais e entraremos em contacto para analisar o seu automóvel."
      benefits={[
        "Pedido simples, gratuito e sem compromisso.",
        "Avaliação personalizada com base nas informações da viatura.",
        "Contacto direto da equipa Samucar para esclarecer os próximos passos.",
      ]}
    />
  );
}
