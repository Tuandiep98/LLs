"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/Icon";
import { Link } from "@/i18n/navigation";
import { needsReview } from "@/lib/core/leitner";
import { db } from "@/lib/storage/db";
import { useLanguagePair } from "@/lib/useLearnLang";
import { PlayBubble } from "./FeaturedTopic";

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
      className="card-chunky card-press group flex items-center gap-3 bg-yellow p-3 text-on-color sm:gap-4 sm:p-4"
    >
      <span
        className="flex h-14 w-14 shrink-0 -rotate-6 items-center justify-center rounded-2xl border-[3px] border-outline bg-sky text-3xl sm:h-16 sm:w-16"
        aria-hidden
      >
        <Icon name="replay" />
      </span>
      <span className="flex flex-col">
        <span className="font-display text-xl font-extrabold">{t("review", { count })}</span>
        <span className="text-sm">{t("reviewHint")}</span>
      </span>
      <PlayBubble />
    </Link>
  );
}
