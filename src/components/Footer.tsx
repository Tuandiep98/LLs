import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations();
  return (
    <footer className="mx-auto mt-10 w-full max-w-5xl px-4 pb-8 text-center text-sm text-ink-soft">
      <p>{t("footer.tagline")}</p>
      <nav className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        <Link href="/privacy" className="underline underline-offset-2">
          {t("parents.privacy")}
        </Link>
        <Link href="/terms" className="underline underline-offset-2">
          {t("parents.terms")}
        </Link>
        <Link href="/credits" className="underline underline-offset-2">
          {t("parents.credits")}
        </Link>
      </nav>
    </footer>
  );
}
