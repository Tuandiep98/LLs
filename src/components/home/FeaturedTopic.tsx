"use client";

import { useTranslations } from "next-intl";
import { conceptsFor, featuredTopics } from "@/content";
import { Sticker } from "@/games/shared/Sticker";
import { Link } from "@/i18n/navigation";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";

/** Seasonal topic banner (topics.json `featured` dates), e.g. Mid-Autumn or Christmas. */
export function FeaturedTopic() {
  const t = useTranslations("home");
  const mounted = useMounted();
  const { native, learn } = useLanguagePair();
  if (!mounted || !learn) return null;

  const topic = featuredTopics()[0];
  if (!topic) return null;
  const covers = conceptsFor(learn, native, topic.id).slice(0, 3);
  if (!covers.length) return null;

  return (
    <Link
      href={{ pathname: "/games/picture-guess", query: { topic: topic.id } }}
      className={`card-chunky bg-topic-${topic.color} flex items-center gap-3 overflow-hidden p-4 text-on-color active:translate-y-1`}
    >
      <span className="flex shrink-0 -space-x-4" aria-hidden>
        {covers.map((c, i) => (
          <Sticker key={c.id} concept={c} tilt={(i - 1) * 10} className="h-14 w-14 sm:h-16 sm:w-16" />
        ))}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-bold uppercase opacity-80">✨ {t("featured")}</span>
        <span className="font-display truncate text-2xl font-extrabold">
          {topic.icon} {topic.names[native]}
        </span>
      </span>
      <span className="ml-auto text-3xl" aria-hidden>
        ▶
      </span>
    </Link>
  );
}
