import { randomBytes,createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { seal,FLOW_COOKIE,cookieOptions,expectedGitHub } from "@/lib/github-app";
export async function GET(request:Request){
 const origin=new URL(request.url).origin,{data}=await getAuthUser();if(!data.user)return NextResponse.redirect(`${origin}/login?next=%2Fnew`);
 if(!process.env.GITHUB_APP_CLIENT_ID||!process.env.GITHUB_APP_CLIENT_SECRET||!process.env.GITHUB_APP_COOKIE_KEY)return NextResponse.redirect(`${origin}/new?github=unavailable`);
 const state=randomBytes(24).toString("base64url"),verifier=randomBytes(32).toString("base64url");
 const url=new URL("https://github.com/login/oauth/authorize");url.searchParams.set("client_id",process.env.GITHUB_APP_CLIENT_ID);url.searchParams.set("redirect_uri",`${origin}/api/github/callback`);url.searchParams.set("state",state);url.searchParams.set("code_challenge",createHash("sha256").update(verifier).digest("base64url"));url.searchParams.set("code_challenge_method","S256");const identity=expectedGitHub(data.user);if(identity)url.searchParams.set("login",identity.login);
 const response=NextResponse.redirect(url);response.cookies.set(FLOW_COOKIE,seal({uid:data.user.id,state,verifier,expires:Date.now()+600000}),{...cookieOptions,maxAge:600});response.headers.set("Cache-Control","private, no-store");return response;
}
