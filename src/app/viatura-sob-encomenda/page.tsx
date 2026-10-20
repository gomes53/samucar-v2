import type { Metadata } from "next";
import { VehicleRequestPage } from "@/components/vehicle-request-page";

export const metadata: Metadata = {
  title: "Viatura sob encomenda",
  description: "Indique a viatura que procura, a quilometragem e o orçamento máximos. A Samucar ajuda a encontrar a opção certa.",
  alternates: { canonical: "/viatura-sob-encomenda" },
};

export default function VehicleToOrderPage() {
  return (
    <VehicleRequestPage
      type="order"
      eyebrow="Encontramos por si"
      title="Viatura sob encomenda"
      introduction="Não encontrou no nosso stock a viatura que procura? Diga-nos as suas preferências e procuraremos uma opção adequada ao seu orçamento."
      benefits={[
        "Pesquisa orientada pela marca, modelo e características pretendidas.",
        "Quilometragem e orçamento máximos definidos por si.",
        "Acompanhamento personalizado durante todo o processo.",
      ]}
    />
  );
}
