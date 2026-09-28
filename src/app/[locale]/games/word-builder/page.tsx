import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { WordBuilder } from "@/games/word-builder/WordBuilder";

export async function generateMetadata({ params }: PageProps<"/[locale]/games/word-builder">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "games.word-builder" });
  return { title: t("name"), description: t("desc") };
}

export default async function WordBuilderPage({ params }: PageProps<"/[locale]/games/word-builder">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <WordBuilder />
    </Suspense>
  );
}
