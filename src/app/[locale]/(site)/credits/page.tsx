import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "credits" });
  return { title: t("title") };
}

export default async function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("credits");
  return (
    <article className="card-chunky mx-auto my-2 max-w-3xl p-5 leading-relaxed sm:p-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t("title")}</h1>
      <p className="mt-3">{t("intro")}</p>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>
          {t("fluent")} –{" "}
          <a className="underline" href="https://github.com/microsoft/fluentui-emoji" rel="noopener noreferrer" target="_blank">
            github.com/microsoft/fluentui-emoji
          </a>
        </li>
        <li>{t("font")}</li>
      </ul>
    </article>
  );
}
