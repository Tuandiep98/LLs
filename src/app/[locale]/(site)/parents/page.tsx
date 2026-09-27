import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ParentalGate } from "@/components/parents/ParentalGate";
import { ParentSettings } from "@/components/parents/ParentSettings";

export async function generateMetadata({ params }: PageProps<"/[locale]/parents">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "parents" });
  return { title: t("title"), robots: { index: false } };
}

export default async function ParentsPage({ params }: PageProps<"/[locale]/parents">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ParentalGate>
      <ParentSettings />
    </ParentalGate>
  );
}
