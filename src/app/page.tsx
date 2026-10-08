import { SiteFooter } from "@/components/layout/LegalPage";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/server/supabase/server";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { projects as landingSamples } from "@/server/data/mock-data";
import { DoodleStrip } from "@/components/doodle/DoodleStrip";

const perks: { icon: IconName; title: string; sub: string }[] = [
  { icon: "bolt", title: "1 click", sub: "to try any project" },
  { icon: "users", title: "Always live", sub: "updates, not a launch day" },
  { icon: "gift", title: "Free", sub: "for every builder" },
];

const steps: { n: string; icon: IconName; title: string; sub: string }[] = [
  { n: "1", icon: "github", title: "Sign in", sub: "Use GitHub or Google. No password to make up." },
  { n: "2", icon: "upload", title: "Add your project", sub: "A demo link, a cover, screenshots and one line. Or start from one of your own GitHub repos." },
  { n: "3", icon: "play", title: "Get tried", sub: "Anyone can open it in one click. No install, no signup just to look." },
  { n: "4", icon: "clock", title: "Keep it alive", sub: "Post updates as it grows. Followers see them in their feed." },
];

const features: { icon: IconName; title: string; sub: string }[] = [
  { icon: "github", title: "Start from GitHub", sub: "Pick one of your own repos to fill in the basics. Repo details only, never your code." },
  { icon: "play", title: "Try it live", sub: "Every project leads with a working demo link, not a description of one." },
  { icon: "clock", title: "Updates", sub: "Share what changed. The page tells the story over time." },
  { icon: "heart", title: "Reactions and saves", sub: "Show some love, or save a project to find it again." },
  { icon: "comment", title: "Comments", sub: "Real feedback right on the project page." },
  { icon: "users", title: "Follow builders", sub: "A Following feed with the people whose work you like." },
];

const audiences: { who: string; points: string[] }[] = [
  { who: "For builders", points: ["One page for each project, with the demo, screenshots and story together.", "People try your work in a click, instead of reading about it.", "Updates keep the page fresh, so it never turns into an old launch post.", "Feedback and followers gather in one place."] },
  { who: "For people who look", points: ["Find real projects you can open and use right now.", "Follow builders and see what they ship next.", "Save what you like and come back to it.", "Tell a builder what worked, in a comment."] },
];

export default async function Landing() {
  // Signed-in people never see the sign-up page again: the logo and "/" lead to the feed.
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { data } = await getAuthUser();
    if (data.user) redirect("/feed");
  }
  const [a, b, c] = landingSamples;
  return (
    <div className="bg-glow relative overflow-hidden">
      <Image src="/art/leaves.jpg" alt="" width={520} height={690} priority className="pointer-events-none absolute -right-16 top-0 hidden h-[760px] w-auto mix-blend-multiply opacity-90 [mask-image:radial-gradient(closest-side,#000_55%,transparent_100%)] lg:block" />
      <MarketingNav />
      <main id="main">
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
        <section id="what" className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">What it is</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">A home for the things you build. Not a launch day.</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">ShipStory is where builders publish a project once and keep telling its story. Visitors try it in one click, then react, comment and follow along as it grows.</p>
        </section>
        <section id="how" className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">From idea to a page people can try.</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((st) => (
              <li key={st.n} className="rounded-2xl border border-line bg-paper p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9eed9] font-bold text-olive">{st.n}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f3e1d8] text-terracotta"><Icon name={st.icon} size={18} /></span>
                </div>
                <h3 className="mt-4 text-lg font-bold">{st.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{st.sub}</p>
              </li>
            ))}
          </ol>
        </section>
        <section id="features" className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">What you get</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Everything a project page needs.</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-paper p-6 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e9eed9] text-olive"><Icon name={f.icon} size={20} /></span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.sub}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="why" className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Why it is useful</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Good for the people who build, and the people who look.</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {audiences.map((a) => (
              <div key={a.who} className="rounded-3xl border border-line bg-paper p-7 shadow-soft">
                <h3 className="text-xl font-extrabold">{a.who}</h3>
                <ul className="mt-4 space-y-3">
                  {a.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#e9eed9] text-olive"><Icon name="check" size={14} /></span>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <section className="relative mx-auto max-w-7xl px-6 pb-24 lg:px-10">
          <div className="rounded-3xl bg-olive px-8 py-12 text-center text-white sm:px-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Publish your first project.</h2>
            <p className="mx-auto mt-3 max-w-md text-white/80">Sign in with GitHub or Google. It takes under 5 minutes.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button href="/login?provider=github" size="lg"><Icon name="github" size={19} />Continue with GitHub</Button>
              <Button href="/feed" variant="ghost" size="lg">Explore projects <Icon name="arrow" size={16} /></Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
