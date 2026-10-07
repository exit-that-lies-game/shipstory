import Image from "next/image";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { projects as landingSamples } from "@/lib/data/mock-data";
import { DoodleStrip } from "@/components/doodle/DoodleStrip";

const perks: { icon: IconName; title: string; sub: string }[] = [
  { icon: "bolt", title: "1 click", sub: "to try any project" },
  { icon: "users", title: "Always live", sub: "updates, not a launch day" },
  { icon: "gift", title: "Free", sub: "for every builder" },
];

const steps = [
  { n: "1", title: "Publish", sub: "Add your demo link, screenshots and a one-line pitch. Under 5 minutes." },
  { n: "2", title: "Get tried", sub: "Anyone can open your project in one click. No install, no signup to look." },
  { n: "3", title: "Keep the story going", sub: "Likes, comments and followers build up on a page that stays alive." },
];

export default async function Landing() {
  const [a, b, c] = landingSamples;
  return (
    <div className="bg-glow relative overflow-hidden">
      <Image src="/art/leaves.jpg" alt="" width={520} height={690} priority className="pointer-events-none absolute -right-16 top-0 hidden h-[760px] w-auto mix-blend-multiply opacity-90 [mask-image:radial-gradient(closest-side,#000_55%,transparent_100%)] lg:block" />
      <MarketingNav />
      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr_1fr] lg:px-10 lg:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs font-semibold text-olive"><span className="h-1.5 w-1.5 rounded-full bg-terracotta" />Early access</span>
            <h1 className="mt-6 text-[clamp(3rem,7vw,5.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">Show what<br />you <span className="text-terracotta">build.</span></h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">Publish your projects. Anyone can try them, react, comment and follow your journey. A portfolio that keeps living.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/login?provider=github" size="lg"><Icon name="github" size={19} />Continue with GitHub</Button>
              <Button href="/login?provider=google" variant="ghost" size="lg"><Icon name="google" size={18} />Continue with Google</Button>
            </div>
            <p className="mt-4 text-sm text-muted">Free. Publish your first project in under 5 minutes.</p>
            <ul className="mt-12 flex flex-wrap gap-x-10 gap-y-6">
              {perks.map((p) => (
                <li key={p.title} className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f3e1d8] text-terracotta"><Icon name={p.icon} size={20} /></span>
                  <span><b className="block text-lg leading-tight">{p.title}</b><span className="text-sm text-muted">{p.sub}</span></span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto hidden h-[640px] w-full max-w-[560px] sm:block">

            <p className="absolute -top-7 left-0 text-xs font-semibold uppercase tracking-widest text-muted">Sample projects · for illustration</p>
            {[{ p: a, cls: "left-0 top-0 w-[360px]", r: -3 }, { p: b, cls: "right-0 top-[215px] w-[340px]", r: 2.5 }, { p: c, cls: "left-6 top-[430px] w-[330px]", r: -1.5 }].filter(item => Boolean(item.p)).map(({ p, cls, r }, i) => (
              <div key={p.id} inert aria-label={`Sample project: ${p.title}`} className={`floaty absolute ${cls}`} style={{ ["--r" as string]: `${r}deg`, animationDelay: `${i * 0.8}s` }}>
                <ProjectCard project={p} tilt={r} />
              </div>
            ))}
          </div>
        </section>
        <DoodleStrip />
        <section id="how" className="relative mx-auto max-w-7xl px-6 pb-24 lg:px-10">
          <h2 className="text-3xl font-extrabold tracking-tight">Not a launch day. A living page.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-line bg-paper p-6 shadow-soft">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9eed9] font-bold text-olive">{s.n}</span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center"><Button href="/feed" variant="soft" size="lg">Explore projects <Icon name="arrow" size={16} /></Button></div>
        </section>
      </main>
      <footer className="border-t border-line py-8 text-center text-sm text-muted">ShipStory &middot; Show what you build</footer>
    </div>
  );
}
