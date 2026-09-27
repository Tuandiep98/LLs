import { useFormatter, useLocale, useTranslations } from "next-intl";
import { PAID_PLANS_ENABLED, type LegalDoc, type LegalLang } from "@/content/legal/types";

export function LegalPage({ title, doc }: { title: string; doc: LegalDoc }) {
  const t = useTranslations("legal");
  const format = useFormatter();
  const locale = useLocale();
  const lang: LegalLang = locale === "vi" ? "vi" : "en";
  const sections = [...doc.sections[lang], ...(PAID_PLANS_ENABLED ? doc.paidSections[lang] : [])];

  return (
    <article className="card-chunky mx-auto my-2 max-w-3xl p-5 leading-relaxed sm:p-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {t("updated", { date: format.dateTime(new Date(doc.updated), { dateStyle: "long" }) })}
      </p>
      <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-sm font-semibold">
        {t("draftNotice")}
        {lang !== locale && <> {t("englishOnly")}</>}
      </p>
      {sections.map((s) => (
        <section key={s.heading} className="mt-6">
          <h2 className="text-xl font-extrabold">{s.heading}</h2>
          {s.paragraphs?.map((p) => (
            <p key={p} className="mt-2">
              {p}
            </p>
          ))}
          {s.list && (
            <ul className="mt-2 list-disc space-y-1 pl-6">
              {s.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
