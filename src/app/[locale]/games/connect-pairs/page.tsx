import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ConnectPairs } from "@/games/connect-pairs/ConnectPairs";

export async function generateMetadata({ params }: PageProps<"/[locale]/games/connect-pairs">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "games.connect-pairs" });
  return { title: t("name"), description: t("desc") };
}

export default async function ConnectPairsPage({ params }: PageProps<"/[locale]/games/connect-pairs">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <ConnectPairs />
    </Suspense>
  );
}
