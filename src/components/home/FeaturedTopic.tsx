"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/Icon";
import { conceptsFor, featuredTopics } from "@/content";
import { Sticker } from "@/games/shared/Sticker";
import { Link } from "@/i18n/navigation";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";

const POSES = [
  { tilt: -12, lift: "translate-y-1", size: "h-16 w-16 sm:h-24 sm:w-24", delay: "0s" },
  { tilt: 4, lift: "-translate-y-3", size: "h-[4.5rem] w-[4.5rem] sm:h-28 sm:w-28", delay: "-0.8s" },
  { tilt: 12, lift: "translate-y-2", size: "h-16 w-16 sm:h-24 sm:w-24", delay: "-1.6s" },
];

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
      className={`card-chunky card-press pattern-dots group bg-topic-${topic.color} relative mt-8 flex items-center gap-3 py-3 pr-3 pl-2 text-on-color sm:mt-8 sm:gap-5 sm:py-4 sm:pr-5`}
    >
      {/* Stickers pop out above the banner */}
      <span className="-mt-12 flex shrink-0 items-end -space-x-5 sm:-mt-16 sm:-space-x-6" aria-hidden>
        {covers.map((c, i) => {
          const pose = POSES[i];
          return (
            <span
              key={c.id}
              className={`${pose.lift} ${i === 2 ? "hidden sm:block" : ""} transition-transform duration-200 group-hover:-translate-y-4`}
              style={{ zIndex: i === 1 ? 2 : 1 }}
            >
              <span className="animate-float block" style={{ animationDelay: pose.delay }}>
                <Sticker concept={c} tilt={pose.tilt} className={pose.size} />
              </span>
            </span>
          );
        })}
      </span>
      {/* Label sits on the top edge like a tag */}
      <span className="absolute -top-4 right-4 rounded-full border-[3px] border-outline bg-surface px-3 py-0.5 text-xs font-extrabold tracking-wide whitespace-nowrap text-ink uppercase shadow-[0_3px_0_var(--outline)] sm:right-6 sm:text-sm">
        ✨ {t("featured")}
      </span>
      <span className="font-display min-w-0 text-2xl leading-tight font-extrabold sm:text-3xl">
        {topic.icon} {topic.names[native]}
      </span>
      <PlayBubble />
    </Link>
  );
}

/** Round "go" button at the end of home banners. */
export function PlayBubble() {
  return (
    <span
      className="ml-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-outline bg-surface text-3xl text-green shadow-[0_4px_0_var(--outline)] transition-transform group-hover:scale-110 sm:h-16 sm:w-16"
      aria-hidden
    >
      <Icon name="play" className="ml-1 h-8 w-8 stroke-outline sm:h-9 sm:w-9" />
    </span>
  );
}
