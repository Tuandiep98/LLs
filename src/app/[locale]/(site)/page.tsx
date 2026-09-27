import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { FeaturedTopic } from "@/components/home/FeaturedTopic";
import { HomeHero } from "@/components/home/HomeHero";
import { ReviewBanner } from "@/components/home/ReviewBanner";
import { games } from "@/games/registry";
import { Link } from "@/i18n/navigation";

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-6 pt-2">
      <HomeHero />
      <FeaturedTopic />
      <ReviewBanner />
      <section aria-label={t("home.subtitle")} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game, i) => {
          const ready = game.status === "ready";
          const card = (
            <>
              <span
                className={`bg-topic-${game.color} flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-[3px] border-outline text-6xl sm:h-28 sm:w-28`}
                style={{ rotate: `${i % 2 ? 3 : -3}deg` }}
                aria-hidden
              >
                {game.icon}
              </span>
              <span className="flex flex-col gap-1 text-left">
                <span className="font-display text-2xl leading-tight font-extrabold">{t(`games.${game.id}.name`)}</span>
                <span className="text-base text-ink-soft">{t(`games.${game.id}.desc`)}</span>
                {!ready && (
                  <span className="mt-1 w-fit rounded-full bg-surface-2 px-3 py-0.5 text-sm font-bold">
                    ⏳ {t("home.comingSoon")}
                  </span>
                )}
              </span>
            </>
          );
          const cls = "card-chunky flex items-center gap-4 p-4 transition-transform";
          return ready ? (
            <Link key={game.id} href={game.href} className={`${cls} active:translate-y-1 hover:-rotate-1`}>
              {card}
            </Link>
          ) : (
            <div key={game.id} className={`${cls} opacity-60`} aria-disabled>
              {card}
            </div>
          );
        })}
      </section>
    </div>
  );
}
