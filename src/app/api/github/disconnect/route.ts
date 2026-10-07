import { NextResponse } from "next/server";
import { CONNECTION_COOKIE,FLOW_COOKIE,cookieOptions } from "@/lib/github-app";
import { sameOrigin } from "@/lib/abuse/turnstile";
export async function POST(request:Request){if(!sameOrigin(request))return NextResponse.json({error:"Invalid request."},{status:403});const r=NextResponse.json({ok:true});r.cookies.set(CONNECTION_COOKIE,"",{...cookieOptions,maxAge:0});r.cookies.set(FLOW_COOKIE,"",{...cookieOptions,maxAge:0});return r;}
