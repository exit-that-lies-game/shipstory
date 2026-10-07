import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/abuse/turnstile";
import { connection,repositories,github,type Repo } from "@/lib/github-app";
const response=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
export async function GET(){try{const c=await connection();if(!c)return response({error:"Connect GitHub to load your own public and private repositories.",connect:true},403);const d=await repositories(c);return response({login:c.login,repos:d.repos.map(r=>({id:r.id,name:r.name,private:r.private})),all:d.all,installed:d.installed,installUrl:process.env.GITHUB_APP_INSTALL_URL});}catch(e){return response({error:e instanceof Error?e.message:"Could not load GitHub.",connect:true},502);}}
export async function POST(request:Request){
 if(!sameOrigin(request))return response({error:"Invalid request."},403);
 try{const c=await connection();if(!c)return response({error:"Connect GitHub first."},403);const {id}=await request.json();if(!Number.isSafeInteger(id)||id<=0)return response({error:"Choose your repository."},400);
 const allowed=await repositories(c);if(!allowed.repos.some(r=>r.id===id))return response({error:"Choose a repository from your granted GitHub installation."},403);const r=await github<Repo>(`/repositories/${id}`,c.token);if(String(r.owner.id)!==c.githubId)return response({error:"Only repositories owned by your GitHub account can be imported."},403);
 return response({title:r.name.slice(0,60),pitch:String(r.description??"").slice(0,80),description:String(r.description??"").slice(0,600),repoUrl:r.private?"":r.html_url,demoUrl:r.private?"":typeof r.homepage==="string"&&/^https?:\/\//.test(r.homepage)?r.homepage:r.has_pages&&/^[\w.-]+$/.test(r.name)?`https://${r.owner.login.toLowerCase()}.github.io/${r.name.toLowerCase()==`${r.owner.login.toLowerCase()}.github.io`?"":r.name}`:"",privateSource:r.private});
 }catch(e){return response({error:e instanceof Error?e.message:"Could not import your repository."},422);}
}
