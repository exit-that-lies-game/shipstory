"use client";
import { createClient,supabaseConfigured } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";
export function TryProject({id,url}:{id:string;url:string}){return <a href={url} target="_blank" rel="noopener noreferrer" onClick={()=>{if(supabaseConfigured)void createClient().rpc("record_project_try",{target:id});}} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-terracotta py-4 text-[17px] font-bold text-white shadow-[0_12px_24px_-10px_#c15a3acc] hover:bg-[#ad4d30]"><Icon name="play" size={17}/>Try it live</a>;}
