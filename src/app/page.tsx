import { SiteFooter } from "@/components/layout/LegalPage";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/server/supabase/server";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { projects as landingSamples } from "@/server/data/mock-data";

const facts: { title: string; sub: string }[] = [
  { title: "1 click", sub: "to try any project" },
  { title: "Always live", sub: "updates, not a launch day" },
  { title: "Free", sub: "for every builder" },
];

const steps: { n: string; icon: IconName; title: string; sub: string }[] = [
  { n: "01", icon: "github", title: "Sign in", sub: "Use GitHub or Google. No password to make up." },
  { n: "02", icon: "upload", title: "Add your project", sub: "A demo link, a cover, screenshots and one line. Or start from one of your own GitHub repos." },
  { n: "03", icon: "play", title: "Get tried", sub: "Anyone can open it in one click. No install, no signup just to look." },
  { n: "04", icon: "clock", title: "Keep it alive", sub: "Post updates as it grows. Followers see them in their feed." },
];

const features: { icon: IconName; title: string; sub: string }[] = [
  { icon: "github", title: "Start from GitHub", sub: "Pick one of your own repos to fill in the basics. Repo details only, never your code." },
  { icon: "play", title: "Try it live", sub: "Every project leads with a working demo link, not a description of one." },
  { icon: "clock", title: "Build notes", sub: "Share what changed. The page tells the story over time." },
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
  const rows = [b, c].filter(Boolean);
  return (
    <div className="bg-cream">
      <MarketingNav />
      <main id="main">
        <section className="mx-auto grid max-w-[1440px] border-x-0 lg:grid-cols-[55fr_45fr]">
          <div className="bg-glow px-5 py-14 sm:px-8 lg:border-r lg:border-ink lg:px-12 lg:py-24">
            <p className="label-mono text-terracotta">The live build journal</p>
            <h1 className="mt-5 text-[clamp(3rem,8.2vw,6.8rem)] font-extrabold leading-[0.9] tracking-[-0.075em]">Don&apos;t just<br />ship it.<br /><span className="story-serif text-terracotta">Tell the story.</span></h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted">Publish your projects. Anyone can try them, react, comment and follow your journey. A portfolio that keeps living.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/login?provider=github" size="lg"><Icon name="github" size={18} />Continue with GitHub</Button>
              <Button href="/login?provider=google" variant="ghost" size="lg"><Icon name="google" size={17} />Continue with Google</Button>
            </div>
            <p className="mt-4 text-sm text-muted">Free. Publish your first project in under 5 minutes.</p>
            <ul className="mt-12 grid max-w-xl grid-cols-3 border border-ink bg-paper">
              {facts.map((f) => (
                <li key={f.title} className="border-r border-ink p-4 last:border-r-0"><b className="block text-lg leading-tight tracking-tight">{f.title}</b><span className="mt-1 block text-xs leading-snug text-muted">{f.sub}</span></li>
              ))}
            </ul>
          </div>
          <div className="bg-ink px-5 py-10 text-paper sm:px-8 lg:px-10 lg:py-14">
            <div className="flex items-center justify-between"><span className="label-mono flex items-center gap-2"><span className="h-2 w-2 bg-sage" aria-hidden />Now shipping</span><span className="label-mono text-paper/60">Sample projects</span></div>
            {a && (
              <div inert aria-label={`Sample project: ${a.title}`} className="mt-6 border border-paper/30">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={a.cover} alt="" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
                  <span className="label-mono absolute left-0 top-0 bg-sage px-2.5 py-1.5 text-ink">Dispatch 01</span>
                  <span className="label-mono absolute inset-x-0 bottom-0 bg-ink px-3 py-1.5">Live · {a.demoUrl.replace(/^https?:\/\//, "")}</span>
                </div>
                <div className="p-5"><h2 className="text-3xl font-extrabold tracking-[-0.04em]">{a.title}</h2><p className="mt-1 text-paper/75">{a.pitch}</p></div>
              </div>
            )}
            <ol className="mt-4 divide-y divide-paper/20 border border-paper/30">
              {rows.map((p, i) => (
                <li key={p.id} inert className="flex items-center gap-4 p-4"><span className="label-mono text-paper/60">{String(i + 2).padStart(2, "0")}</span><span className="min-w-0 flex-1"><b className="block truncate">{p.title}</b><span className="block truncate text-sm text-paper/65">{p.pitch}</span></span><span className="label-mono text-sage">Live</span></li>
              ))}
            </ol>
          </div>
        </section>

        <section id="what" className="border-t border-ink">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-28">
            <div>
              <p className="label-mono text-terracotta">What it is</p>
              <h2 className="mt-3 text-4xl font-extrabold leading-[0.95] tracking-[-0.05em] sm:text-6xl">A home for things that are still <span className="story-serif text-terracotta">becoming.</span></h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">ShipStory is where builders publish a project once and keep telling its story. Visitors try it in one click, then react, comment and follow along as it grows.</p>
            </div>
            <ol id="how" className="border-t border-ink">
              {steps.map((st) => (
                <li key={st.n} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-ink py-5">
                  <span className="label-mono pt-1 text-muted">{st.n}</span>
                  <div className="flex items-start gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center bg-sage text-ink"><Icon name={st.icon} size={18} /></span><div><h3 className="text-xl font-extrabold tracking-tight">{st.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted">{st.sub}</p></div></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {landingSamples.length >= 3 && (
          <section className="border-t border-ink bg-paper">
            <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="label-mono text-terracotta">Featured dispatches</p><h2 className="mt-3 text-4xl font-extrabold leading-[0.95] tracking-[-0.05em] sm:text-5xl">Real projects, open in a click.</h2></div><span className="label-mono text-muted">Sample projects · for illustration</span></div>
              <div inert className="mt-10 grid border-l border-t border-ink md:grid-cols-3">
                {landingSamples.slice(0, 3).map((p, i) => <ProjectCard key={p.id} project={p} index={i + 1} />)}
              </div>
            </div>
          </section>
        )}

        <section id="features" className="border-t border-ink">
          <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <p className="label-mono text-terracotta">What you get</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-[0.95] tracking-[-0.05em] sm:text-5xl">Everything a project page needs.</h2>
            <div className="mt-10 grid border-l border-t border-ink sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="border-b border-r border-ink bg-paper p-6">
                  <span className="grid h-10 w-10 place-items-center bg-ink text-sage"><Icon name={f.icon} size={18} /></span>
                  <h3 className="mt-5 text-xl font-extrabold tracking-tight">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="why" className="border-t border-ink bg-terracotta text-ink">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:px-12 lg:py-24">
            <div>
              <p className="label-mono">Why it is useful</p>
              <h2 className="mt-3 text-4xl font-extrabold leading-[0.95] tracking-[-0.06em] sm:text-6xl">Good for the people who build, and the people who <span className="story-serif">look.</span></h2>
            </div>
            <div className="grid gap-px border border-ink bg-ink md:grid-cols-2">
              {audiences.map((a) => (
                <div key={a.who} className="bg-paper p-6">
                  <h3 className="text-xl font-extrabold tracking-tight">{a.who}</h3>
                  <ul className="mt-4 space-y-3">
                    {a.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-3 text-[15px] leading-relaxed"><span className="mt-1 grid h-5 w-5 shrink-0 place-items-center bg-sage"><Icon name="check" size={12} /></span>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-ink bg-ink text-paper">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <h2 className="max-w-4xl text-4xl font-extrabold leading-[0.92] tracking-[-0.06em] sm:text-7xl">The next update deserves someone <span className="story-serif text-terracotta">waiting for it.</span></h2>
            <p className="mt-5 max-w-md text-paper/75">Sign in with GitHub or Google. It takes under 5 minutes.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login?provider=github" className="label-mono inline-flex items-center gap-2 border border-paper bg-paper px-6 py-3.5 text-ink transition-colors hover:border-terracotta hover:bg-terracotta hover:text-paper"><Icon name="github" size={18} />Continue with GitHub</Link>
              <Link href="/feed" className="label-mono inline-flex items-center gap-2 border border-paper px-6 py-3.5 transition-colors hover:bg-sage hover:text-ink">Read the latest ships <Icon name="arrow" size={14} /></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
