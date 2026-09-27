"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { needsReview } from "@/lib/core/leitner";
import { db } from "@/lib/storage/db";
import { useLanguagePair } from "@/lib/useLearnLang";

export function ReviewBanner() {
  const t = useTranslations("home");
  const { learn } = useLanguagePair();
  const count = useLiveQuery(async () => {
    if (!learn) return 0;
    const now = Date.now();
    const rows = await db.progress.where("learn").equals(learn).toArray();
    return rows.filter((p) => needsReview(p, now)).length;
  }, [learn]);

  if (!count) return null;
  return (
    <Link
      href={{ pathname: "/games/picture-guess", query: { review: "1" } }}
      className="card-chunky flex items-center gap-3 bg-yellow p-4 text-on-color active:translate-y-1"
    >
      <span className="text-4xl" aria-hidden>
        🔁
      </span>
      <span className="flex flex-col">
        <span className="font-display text-xl font-extrabold">{t("review", { count })}</span>
        <span className="text-sm">{t("reviewHint")}</span>
      </span>
      <span className="ml-auto text-3xl" aria-hidden>
        ▶
      </span>
    </Link>
  );
}
