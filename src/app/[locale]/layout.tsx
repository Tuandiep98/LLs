import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InlineScript } from "@/components/InlineScript";
import { LocaleMemory } from "@/components/LocaleMemory";
import { routing } from "@/i18n/routing";
import { basePath } from "@/lib/basePath";
import { contentSecurityPolicy } from "@/lib/csp";
import { themeInitScript } from "@/lib/settings";
import "../globals.css";

const baloo = Baloo_2({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["600", "700", "800"],
  variable: "--font-baloo",
});
const nunito = Nunito({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-nunito",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("title"), template: `%s · LLs` },
    description: t("description"),
    applicationName: "LLs",
    appleWebApp: { capable: true, title: "LLs", statusBarStyle: "default" },
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `${basePath}/${l}`])),
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff7e8" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1a2e" },
  ],
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${baloo.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        {/* Static hosting can't send headers, so the CSP goes in a meta tag there. */}
        {process.env.NEXT_PUBLIC_STATIC_EXPORT && (
          <meta httpEquiv="Content-Security-Policy" content={contentSecurityPolicy()} />
        )}
        <InlineScript html={themeInitScript} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <NextIntlClientProvider>
          <LocaleMemory />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
