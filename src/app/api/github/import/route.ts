import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/abuse/turnstile";
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request."},{status:403});
 const {data}=await getAuthUser();if(!data.user)return NextResponse.json({error:"Sign in first."},{status:401});
 try{const {url}=await request.json();const repo=new URL(url);const match=repo.pathname.match(/^\/([a-zA-Z0-9-]{1,39})\/([a-zA-Z0-9_.-]{1,100})\/?$/);if(repo.hostname!=="github.com"||repo.protocol!=="https:"||!match)return NextResponse.json({error:"Use a public GitHub repository URL."},{status:400});
 const res=await fetch(`https://api.github.com/repos/${match[1]}/${match[2]}`,{headers:{Accept:"application/vnd.github+json"},signal:AbortSignal.timeout(8000),cache:"no-store",redirect:"error"});if(!res.ok)return NextResponse.json({error:res.status===403||res.status===429?"GitHub is limiting requests. Try later.":"Public repository not found."},{status:422});const r=await res.json();
 return NextResponse.json({title:String(r.name??"").slice(0,60),pitch:String(r.description??"").slice(0,80),description:String(r.description??"").slice(0,600),repoUrl:r.html_url,demoUrl:typeof r.homepage==="string"&&/^https?:\/\//.test(r.homepage)?r.homepage:""});
 }catch{return NextResponse.json({error:"Could not read that repository. Check the URL and try again."},{status:400});}
}
