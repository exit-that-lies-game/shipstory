import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/abuse/turnstile";
export async function POST(request:Request){if(!sameOrigin(request))return NextResponse.json({error:"Invalid request."},{status:403});const r=NextResponse.json({ok:true});for(const name of ["shipstory_github_connection","shipstory_github_flow"])r.cookies.set(name,"",{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:0});return r;}
