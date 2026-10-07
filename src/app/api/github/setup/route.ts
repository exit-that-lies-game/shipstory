import { NextResponse } from "next/server";
import { connection,installations } from "@/lib/github-app";
export async function GET(request:Request){const origin=new URL(request.url).origin;try{const c=await connection();if(!c)return NextResponse.redirect(`${origin}/api/github/connect`);const installed=(await installations(c)).length>0;return NextResponse.redirect(`${origin}/new?github=${installed?"connected":"installation-required"}`);}catch{return NextResponse.redirect(`${origin}/new?github=failed`);}}
