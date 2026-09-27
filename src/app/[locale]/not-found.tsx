import { useTranslations } from "next-intl";
import { Mascot } from "@/components/Mascot";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("nav");
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <Mascot mood="oops" className="w-48" />
      <h1 className="text-5xl font-extrabold">404</h1>
      <Link href="/" className="btn-chunky bg-yellow">
        🏠 {t("home")}
      </Link>
    </main>
  );
}
