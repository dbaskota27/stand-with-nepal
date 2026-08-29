import { createFileRoute } from "@tanstack/react-router";
import {
  Droplets,
  ExternalLink,
  HeartPulse,
  House,
  Radio,
  Share2,
  Truck,
} from "lucide-react";
import { Toaster } from "sonner";
import { PhotoGallery } from "@/components/photo-gallery";
import {
  CopyLinkButton,
  CopyPostButton,
  ShareOnXButton,
} from "@/components/share-actions";
import { Button } from "@/components/ui/button";
import {
  DONATE_NAME,
  DONATE_OPERATOR,
  DONATE_URL,
  FIGURES_NOTE,
  needs,
  officialPortals,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
  sources,
} from "@/data/relief";
import {
  FALLBACK_BRIEF,
  getOfficialBrief,
  type OfficialBrief,
} from "@/lib/official-brief";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    try {
      return await getOfficialBrief();
    } catch {
      return FALLBACK_BRIEF;
    }
  },
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
    ],
  }),
});

const needIcons = [House, Droplets, HeartPulse, Truck] as const;

function formatNpt(iso: string) {
  try {
    const formatted = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kathmandu",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
    return `${formatted} NPT`;
  } catch {
    return iso;
  }
}

function DonateButton({
  size = "md",
  label = "Donate",
  className,
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}) {
  return (
    <Button asChild size={size} className={className}>
      <a href={DONATE_URL} target="_blank" rel="noopener noreferrer">
        {label}
        <ExternalLink />
      </a>
    </Button>
  );
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7", className)}
      aria-hidden="true"
    >
      <path
        d="M4 24 L16 6 L28 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6 24 C10 20 14 22 16 21 C18 20 22 18 26 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:h-16 md:px-8">
        <a href="#top" className="flex items-center gap-2 text-fg">
          <LogoMark className="text-accent" />
          <span className="font-display text-base tracking-tight md:text-lg">
            Stand With Nepal
          </span>
        </a>
        <nav className="flex items-center gap-1 md:gap-2">
          <a
            href="#official"
            className="hidden h-11 items-center px-3 text-sm text-muted hover:text-fg md:inline-flex"
          >
            Official data
          </a>
          <a
            href="#situation"
            className="hidden h-11 items-center px-3 text-sm text-muted hover:text-fg lg:inline-flex"
          >
            Situation
          </a>
          <a
            href="#photos"
            className="hidden h-11 items-center px-3 text-sm text-muted hover:text-fg md:inline-flex"
          >
            Photos
          </a>
          <ShareOnXButton variant="ghost" size="sm" label="Share" />
          <DonateButton size="sm" />
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden"
    >
      <img
        src="/photos/hero.jpg"
        alt="Aerial view of a Himalayan town after the flash flood, half buried in mud beside a swollen grey river"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/75 to-bg/25" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-28 pt-28 md:px-8 md:pb-20">
        <p className="text-xs font-medium tracking-[0.2em] text-fg/80 uppercase">
          Rasuwa, Nepal · 26 August 2026
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.08] tracking-tight text-fg md:text-6xl">
          Entire villages washed away.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-fg/85 md:text-lg">
          A glacier collapse sent a wall of water down the Bhotekoshi and
          Trishuli rivers. Hundreds of families are missing. Isolated
          communities need shelter, water, and medical care now.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <DonateButton size="lg" label="Donate to the PM Relief Fund" />
          <ShareOnXButton variant="outline" size="lg" />
        </div>
        <p className="mt-6 text-xs text-muted">
          This page does not take money. Donate on the official Government of
          Nepal portal.
        </p>
      </div>
    </section>
  );
}

function StatsBar({ brief }: { brief: OfficialBrief }) {
  const c = brief.casualties ?? FALLBACK_BRIEF.casualties;
  const items = [
    { value: String(c.dead), label: "Confirmed dead" },
    { value: String(c.missing), label: "Missing" },
    { value: String(c.injured), label: "Injured" },
    { value: "14", label: "Hydropower plants damaged" },
  ];
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
        {items.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              "px-5 py-6 md:px-8 md:py-8",
              i < 3 && "border-b border-border md:border-b-0",
              i % 2 === 0 && "border-r border-border",
              i === 2 && "md:border-r",
            )}
          >
            <p className="font-display text-3xl tracking-tight text-fg md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
      <p className="border-t border-border px-5 py-3 text-center text-xs text-muted md:px-8">
        {c.live
          ? `Updated from ${c.source} as of ${formatNpt(c.asOf)}. `
          : `${FIGURES_NOTE} `}
        Rechecked from NDRRMA, BIPAD, and IFRC each time this page loads. Counts
        only move up when those official systems publish a higher number.
        Hydropower damage from the Nepal Electricity Authority.
      </p>
    </section>
  );
}

function OfficialLive({ brief }: { brief: OfficialBrief }) {
  return (
    <section id="official" className="scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
            Official data
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase",
              brief.live
                ? "border-accent/40 text-accent"
                : "border-border text-muted",
            )}
          >
            <Radio className="size-3" strokeWidth={2} />
            {brief.live ? "Live from government systems" : "Showing last official snapshot"}
          </span>
        </div>
        <h2 className="mt-3 max-w-3xl font-display text-3xl text-fg md:text-4xl">
          Authorized figures, and the portals that update them
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Casualty numbers start from the last Nepal Police bulletin and rise
          if NDRRMA, BIPAD, or IFRC publish a higher official count when you
          open this page. Flood warnings and road closures are pulled live from
          BIPAD (DHM and the Department of Roads).
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-border bg-surface p-5 md:p-6">
              <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
                BIPAD live warnings
              </p>
              {brief.alerts.length > 0 ? (
                <ol className="mt-4 divide-y divide-border">
                  {brief.alerts.map((alert) => (
                    <li key={`${alert.id}-${alert.startedOn}`} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-sm font-medium text-fg">{alert.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatNpt(alert.startedOn)} · {alert.sourceLabel}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  Live warnings could not be loaded just now. Open the BIPAD
                  portal for the current government feed.
                </p>
              )}
              <p className="mt-4 text-xs text-muted">
                Checked {formatNpt(brief.fetchedAt)}. Source:{" "}
                <a
                  href="https://bipadportal.gov.np/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:text-fg hover:underline"
                >
                  bipadportal.gov.np
                </a>
                {brief.ifrcUpdatedAt
                  ? ` · IFRC field report updated ${formatNpt(brief.ifrcUpdatedAt)}`
                  : null}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            {officialPortals.map((portal) => (
              <a
                key={portal.href}
                href={portal.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-fg/30"
              >
                <p className="text-xs font-medium tracking-[0.14em] text-muted uppercase">
                  {portal.owner}
                </p>
                <p className="mt-1 flex items-center gap-2 font-display text-lg text-fg">
                  {portal.name}
                  <ExternalLink className="size-3.5 shrink-0 text-muted" />
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {portal.body}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Situation() {
  return (
    <section id="situation" className="scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
            The situation
          </p>
          <h2 className="mt-3 font-display text-3xl text-fg md:text-4xl">
            A flood that arrived in minutes
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
            <p>
              On the morning of 26 August 2026, a glacier collapse on the
              Nepal–Tibet border sent ice, rock, and a sudden surge of water
              into the Bhotekoshi and Trishuli river systems. Within hours,
              riverside towns in Rasuwa district — including Timure,
              Rasuwagadhi, and Syabrubesi — were torn apart. Floods continued
              into Nuwakot, Dhading, Gorkha, and Chitwan.
            </p>
            <p>
              The Nepal Red Cross field report puts the surge at about 9:15
              a.m., with flood waves of 8–10 metres. Customs offices, police
              posts, markets, and hydropower plants were hit. The Department of
              Roads says the 42 km Betrawati–Rasuwagadhi road is destroyed at
              multiple points. The Nepal Electricity Authority reported damage
              to 14 hydropower projects.
            </p>
            <p>
              The Nepal Army, police, Nepal Red Cross, UN agencies, and local
              partners are running search, rescue, and relief. Immediate needs
              are emergency shelter, safe drinking water, first aid, and
              reaching people who have been cut off.
            </p>
          </div>
        </div>
        <aside className="lg:col-span-5">
          <blockquote className="rounded-xl border border-border bg-surface p-6 md:p-8">
            <p className="font-display text-xl leading-snug text-fg md:text-2xl">
              “The priority now is to reach affected communities and get
              assistance to people who have lost their homes, suffered injuries
              or have been cut off.”
            </p>
            <footer className="mt-5 text-sm text-muted">
              David Fisher, IFRC head of delegation for Nepal
            </footer>
          </blockquote>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>Hardest hit: Rasuwa, Nuwakot, Dhading, Chitwan, Gorkha</li>
            <li>42 km of the Betrawati–Rasuwagadhi road destroyed (DoR)</li>
            <li>14 hydropower projects damaged (Nepal Electricity Authority)</li>
            <li>UN released $2 million in emergency funds</li>
            <li>IFRC released nearly CHF 1 million for the Nepal Red Cross</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

function Needs() {
  return (
    <section className="border-t border-border bg-surface px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
          What is needed
        </p>
        <h2 className="mt-3 font-display text-3xl text-fg md:text-4xl">
          How a gift is used
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {needs.map((need, i) => {
            const Icon = needIcons[i] ?? House;
            return (
              <div key={need.title} className="rounded-lg border border-border bg-bg p-5">
                <Icon className="size-5 text-accent" strokeWidth={1.75} />
                <h3 className="mt-4 font-display text-lg text-fg">{need.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{need.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Donate() {
  return (
    <section id="donate" className="scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
          Donate
        </p>
        <h2 className="mt-3 font-display text-3xl text-fg md:text-4xl">
          Give through the official government fund
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          The Office of the Prime Minister has asked the public to donate to
          the {DONATE_NAME}. The official portal accepts domestic and
          international cards, and NEPALPAY QR. This page never collects a
          payment.
        </p>

        <article className="mt-10 rounded-xl border border-border bg-surface p-6 md:p-8">
          <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
            {DONATE_OPERATOR}
          </p>
          <h3 className="mt-2 font-display text-2xl text-fg md:text-3xl">
            {DONATE_NAME}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Rescue, relief, and rehabilitation for communities hit by the
            Himalayan flash floods. You will leave this page and donate on the
            government portal.
          </p>
          <div className="mt-6">
            <DonateButton size="lg" label="Donate on the official portal" />
          </div>
          <p className="mt-4 break-all text-xs text-muted">{DONATE_URL}</p>
        </article>
      </div>
    </section>
  );
}

function ShareBand() {
  return (
    <section
      id="share"
      className="border-t border-border bg-surface px-5 py-16 md:px-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <Share2 className="mx-auto size-6 text-accent" strokeWidth={1.75} />
        <h2 className="mt-4 font-display text-3xl text-fg">
          If you cannot give, share
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Share on X posts the official PM Relief Fund donate link. The preview
          inside this chat is not a public page — publish the app if you want
          people to open these photos from X.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <ShareOnXButton variant="primary" size="lg" />
          <CopyPostButton />
          <CopyLinkButton variant="outline" />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border px-5 py-12 pb-28 md:px-8 md:pb-12">
      <div className="mx-auto max-w-6xl">
        <p className="font-display text-lg text-fg">Stand With Nepal</p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          An independent awareness page. Donations are made on the official{" "}
          {DONATE_OPERATOR} portal for the {DONATE_NAME}. This page does not
          collect payments. Casualty figures start from Nepal Police and are
          rechecked against NDRRMA, BIPAD, and IFRC when this page loads.
        </p>
        <p className="mt-6 text-xs font-medium tracking-wide text-muted uppercase">
          Official sources
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {sources.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted underline-offset-4 hover:text-fg hover:underline"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

function MobileDock() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 p-3 backdrop-blur-md md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex gap-2">
        <Button asChild className="flex-1" size="lg">
          <a href={DONATE_URL} target="_blank" rel="noopener noreferrer">
            Donate
            <ExternalLink />
          </a>
        </Button>
        <ShareOnXButton variant="secondary" size="lg" label="Share" />
      </div>
    </div>
  );
}

function Home() {
  const brief = Route.useLoaderData();
  return (
    <div className="min-h-svh bg-bg text-fg">
      <a
        href={DONATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        Skip to donate
      </a>
      <Header />
      <main>
        <Hero />
        <StatsBar brief={brief} />
        <OfficialLive brief={brief} />
        <Situation />
        <PhotoGallery />
        <Needs />
        <Donate />
        <ShareBand />
      </main>
      <Footer />
      <MobileDock />
      <Toaster theme="dark" position="top-center" richColors={false} />
    </div>
  );
}
