"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";
export function AccountMenu({name,avatarUrl}:{name:string;avatarUrl?:string}){
 const router=useRouter();
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function logout(){setBusy(true);setError("");try{const disconnected=await fetch("/api/github/disconnect",{method:"POST"});if(!disconnected.ok)throw new Error();const {error}=await createClient().auth.signOut({scope:"local"});if(error)throw error;router.replace("/login");router.refresh();}catch{setError("Could not log out. Try again.");setBusy(false);}}
 return <details className="relative"><summary aria-label="Account menu" className="list-none cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-olive"><Avatar name={name} src={avatarUrl} size={34}/></summary><div className="absolute right-0 top-12 w-48 rounded-2xl border border-line bg-paper p-2 shadow-lift"><p className="truncate px-3 py-2 text-xs text-muted">{name}</p><Link href="/me" className="block rounded-xl px-3 py-2 text-sm hover:bg-[#e9eed9]">Your profile</Link><Link href="/analytics" className="block rounded-xl px-3 py-2 text-sm hover:bg-[#e9eed9]">Analytics</Link><button type="button" onClick={logout} disabled={busy} className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-terracotta hover:bg-[#f3e1d8] disabled:opacity-50">{busy?"Logging out...":"Log out"}</button>{error&&<p role="alert" className="px-3 py-2 text-xs text-terracotta">{error}</p>}</div></details>;
}
