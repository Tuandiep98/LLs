import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { PictureGuess } from "@/games/picture-guess/PictureGuess";

export async function generateMetadata({ params }: PageProps<"/[locale]/games/picture-guess">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "games.picture-guess" });
  return { title: t("name"), description: t("desc") };
}

export default async function PictureGuessPage({ params }: PageProps<"/[locale]/games/picture-guess">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <PictureGuess />
    </Suspense>
  );
}
