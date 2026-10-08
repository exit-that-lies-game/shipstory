import { NextRequest,NextResponse } from "next/server";
import { getAuthUser } from "@/server/supabase/server";
import { safeReturnPath } from "@/shared/safe-url";
import { CONNECTION_COOKIE,FLOW_COOKIE,cookieOptions,seal,unseal,github,installations,expectedGitHub } from "@/server/github/github-app";
export async function GET(request:NextRequest){
 const {origin,searchParams}=request.nextUrl;const fail=()=>{const r=NextResponse.redirect(`${origin}/new?github=failed`);r.cookies.set(FLOW_COOKIE,"",{...cookieOptions,maxAge:0});r.headers.set("Cache-Control","private, no-store");return r;};
 try{
  const {data}=await getAuthUser();const flow=unseal<{uid:string;state:string;verifier:string;next?:string;expires:number}>(request.cookies.get(FLOW_COOKIE)?.value??"");
  if(!data.user||flow.uid!==data.user.id||flow.expires<Date.now()||flow.state!==searchParams.get("state")||!searchParams.get("code"))return fail();
  const r=await fetch("https://github.com/login/oauth/access_token",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({client_id:process.env.GITHUB_APP_CLIENT_ID,client_secret:process.env.GITHUB_APP_CLIENT_SECRET,code:searchParams.get("code"),redirect_uri:`${origin}/api/github/callback`,code_verifier:flow.verifier}),cache:"no-store",signal:AbortSignal.timeout(10000)});const token=await r.json();if(!r.ok||typeof token.access_token!=="string")return fail();
  const profile=await github<{id:number;login:string}>("/user",token.access_token);const expected=expectedGitHub(data.user);if(expected&&expected.id!==String(profile.id))return fail();
  const next=safeReturnPath(flow.next||"/new",origin);const seconds=Math.min(Number(token.expires_in)||28800,28800);const c={uid:data.user.id,githubId:String(profile.id),login:profile.login,token:token.access_token,expires:Date.now()+seconds*1000,returnTo:next};
  const installed=(await installations(c)).length>0;const dest=installed?`${origin}${next}`:`${process.env.GITHUB_APP_INSTALL_URL}?state=${encodeURIComponent(flow.state)}`;
  const response=NextResponse.redirect(dest);response.cookies.set(CONNECTION_COOKIE,seal(c),{...cookieOptions,maxAge:seconds});response.cookies.set(FLOW_COOKIE,"",{...cookieOptions,maxAge:0});response.headers.set("Cache-Control","private, no-store");return response;
 }catch{return fail();}
}
