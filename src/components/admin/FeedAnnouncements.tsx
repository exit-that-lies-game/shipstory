/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { createClient } from "@/server/supabase/server";
export async function FeedAnnouncements() {
  const sb = await createClient();
  const { data } = await sb.from("announcements").select("id,title,body,image_url,link_url").order("created_at", { ascending: false }).limit(3);
  if (!data?.length) return null;
  return <div className="mb-6 space-y-3">{data.map(a => {
    const inner = <>{a.image_url && <img src={a.image_url} alt="" className="mb-4 h-40 w-full rounded-xl object-cover sm:h-52" />}<h2 className="font-bold text-olive">{a.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm">{a.body}</p></>;
    const cls = "block rounded-2xl border border-sage bg-[#e9eed9] p-5";
    if (!a.link_url) return <aside key={a.id} className={cls}>{inner}</aside>;
    return a.link_url.startsWith("/") ? <Link key={a.id} href={a.link_url} className={cls}>{inner}</Link> : <a key={a.id} href={a.link_url} rel="noopener noreferrer" target="_blank" className={cls}>{inner}</a>;
  })}</div>;
}
