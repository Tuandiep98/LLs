import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ListenPick } from "@/games/listen-pick/ListenPick";

export async function generateMetadata({ params }: PageProps<"/[locale]/games/listen-pick">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "games.listen-pick" });
  return { title: t("name"), description: t("desc") };
}

export default async function ListenPickPage({ params }: PageProps<"/[locale]/games/listen-pick">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <ListenPick />
    </Suspense>
  );
}
