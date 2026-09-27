import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StickerBook } from "@/components/progress/StickerBook";

export async function generateMetadata({ params }: PageProps<"/[locale]/progress">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "progress" });
  return { title: t("title") };
}

export default async function ProgressPage({ params }: PageProps<"/[locale]/progress">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StickerBook />;
}
