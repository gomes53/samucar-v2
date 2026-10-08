import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { site } from "@/lib/site";

export const metadata = { title: "Contactos" };

export default function ContactsPage() {
  return (
    <section className="bg-[#f6f5f2] py-20 sm:py-28">
      <div className="shell">
        <p className="eyebrow text-[#8d6a27]">Estamos ao seu dispor</p>
        <h1 className="section-heading max-w-3xl">Venha conhecer a sua próxima viatura.</h1>
        <div className="mt-14 grid overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <h2 className="mb-8 text-2xl font-black">Fale connosco</h2>
            <div className="space-y-7">
              <Contact icon={<MapPin />} label="Morada" value={site.address} href={site.mapsUrl} />
              <Contact icon={<Phone />} label="Telefone" value={site.phone} href={site.phoneHref} />
              <Contact icon={<Mail />} label="Email" value={site.email} href={`mailto:${site.email}`} />
              <Contact icon={<MessageCircle />} label="WhatsApp" value="Enviar mensagem" href={site.whatsappUrl} />
              <div className="flex gap-4"><Clock3 className="shrink-0 text-[#a77d2e]" /><div><p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Horário</p><p className="mt-1 leading-7">Segunda a sexta: 10:00–13:00 / 15:00–19:00<br />Sábado: 10:00–13:00 / 15:00–18:00<br />Domingo: Encerrado</p></div></div>
            </div>
          </div>
          <iframe title="Localização da Samucar" src="https://www.google.com/maps?q=38.64809,-9.166308&z=16&output=embed" className="min-h-[450px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </section>
  );
}

function Contact({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return <div className="flex gap-4"><span className="text-[#a77d2e]">{icon}</span><div><p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{label}</p><a className="mt-1 block font-semibold hover:text-[#8d6a27]" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{value}</a></div></div>;
}
