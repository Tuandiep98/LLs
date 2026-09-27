import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { MemoryMatch } from "@/games/memory-match/MemoryMatch";

export async function generateMetadata({ params }: PageProps<"/[locale]/games/memory-match">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "games.memory-match" });
  return { title: t("name"), description: t("desc") };
}

export default async function MemoryMatchPage({ params }: PageProps<"/[locale]/games/memory-match">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <MemoryMatch />
    </Suspense>
  );
}
