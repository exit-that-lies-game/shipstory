import { DoodlePill } from "./DoodlePill";

/** Row of hand-drawn pills. Hover to wobble, click the hammer pill a few times. */
export function DoodleStrip() {
  return (
    <section aria-label="What you can do on ShipStory" className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-10">
      <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-[#9a9b86]">Poke around</p>
      <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none]">
        <DoodlePill icon="hammer" label="Ship" hint="publish your project" />
        <DoodlePill icon="eyes" label="Try" hint="open any project in one click" />
        <DoodlePill icon="heart" label="Like" hint="react to projects" />
        <DoodlePill icon="spark" label="Follow" hint="follow builders" />
      </div>
    </section>
  );
}
