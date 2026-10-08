export function ContentPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="content-page">
      <div className="shell">
        <article className="prose-page">
          <p className="eyebrow text-[#8d6a27]">Informações úteis</p>
          <h1>{title}</h1>
          {children}
        </article>
      </div>
    </section>
  );
}
