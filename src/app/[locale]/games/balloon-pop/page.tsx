import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { BalloonPop } from "@/games/balloon-pop/BalloonPop";

export async function generateMetadata({ params }: PageProps<"/[locale]/games/balloon-pop">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "games.balloon-pop" });
  return { title: t("name"), description: t("desc") };
}

export default async function BalloonPopPage({ params }: PageProps<"/[locale]/games/balloon-pop">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <BalloonPop />
    </Suspense>
  );
}
