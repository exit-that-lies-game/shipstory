"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
export function MarkRead(){const router=useRouter(),[note,setNote]=useState("");return <><button onClick={async()=>{const sb=createClient();const {data}=await sb.auth.getUser();if(!data.user)return;const {error}=await sb.from("notifications").update({read_at:new Date().toISOString()}).eq("recipient_id",data.user.id).is("read_at",null);if(error)setNote("Could not mark read. Try again.");else router.refresh();}} className="text-sm font-semibold text-olive">Mark all read</button>{note&&<p role="alert">{note}</p>}</>;}
