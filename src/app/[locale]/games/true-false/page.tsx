import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { TrueFalse } from "@/games/true-false/TrueFalse";

export async function generateMetadata({ params }: PageProps<"/[locale]/games/true-false">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "games.true-false" });
  return { title: t("name"), description: t("desc") };
}

export default async function TrueFalsePage({ params }: PageProps<"/[locale]/games/true-false">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <TrueFalse />
    </Suspense>
  );
}
