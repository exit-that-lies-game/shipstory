import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/abuse/turnstile";
import { githubIdentity, ownedPublicRepo } from "@/lib/github-import";
const headers={Accept:"application/vnd.github+json"};
async function identity(){const {data}=await getAuthUser();return data.user?githubIdentity(data.user.identities):null;}
export async function GET(){
 const user=await identity();if(!user)return NextResponse.json({error:"Sign in with GitHub to import your own public repositories."},{status:403});
 try{
  const res=await fetch(`https://api.github.com/users/${user.login}/repos?type=owner&sort=updated&per_page=100`,{headers,signal:AbortSignal.timeout(8000),cache:"no-store",redirect:"error"});
  if(!res.ok)return NextResponse.json({error:"Could not load your GitHub repositories. Try later."},{status:502});
  const repos=await res.json();if(!Array.isArray(repos))throw new Error();
  return NextResponse.json({login:user.login,repos:repos.filter(r=>ownedPublicRepo(r,user.id)).map(r=>({name:r.name,description:r.description})),more:!!res.headers.get("link")?.includes('rel="next"')});
 }catch{return NextResponse.json({error:"Could not connect to GitHub. Try again."},{status:502});}
}
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request."},{status:403});
 const user=await identity();if(!user)return NextResponse.json({error:"Sign in with GitHub first."},{status:403});
 try{
  const {name}=await request.json();if(typeof name!=="string"||!/^[a-zA-Z0-9_.-]{1,100}$/.test(name))return NextResponse.json({error:"Choose one of your repositories."},{status:400});
  const res=await fetch(`https://api.github.com/repos/${user.login}/${name}`,{headers,signal:AbortSignal.timeout(8000),cache:"no-store",redirect:"error"});
  if(!res.ok)return NextResponse.json({error:"Your public repository was not found."},{status:422});const r=await res.json();
  if(!ownedPublicRepo(r,user.id))return NextResponse.json({error:"Only public repositories owned by your GitHub account can be imported."},{status:403});
  return NextResponse.json({title:String(r.name).slice(0,60),pitch:String(r.description??"").slice(0,80),description:String(r.description??"").slice(0,600),repoUrl:r.html_url,demoUrl:typeof r.homepage==="string"&&/^https?:\/\//.test(r.homepage)?r.homepage:""});
 }catch{return NextResponse.json({error:"Could not read your repository. Try again."},{status:400});}
}
