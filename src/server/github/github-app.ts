import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getAuthUser } from "@/server/supabase/server";
import { githubIdentity } from "@/server/github/github-import";
export const CONNECTION_COOKIE="shipstory_github_connection";
export const FLOW_COOKIE="shipstory_github_flow";
export const cookieOptions={httpOnly:true,secure:true,sameSite:"lax" as const,path:"/"};
export type Connection={uid:string;githubId:string;login:string;token:string;expires:number;returnTo?:string};
function key(){const s=process.env.GITHUB_APP_COOKIE_KEY;if(!s)throw new Error("GitHub connection is not configured.");return createHash("sha256").update(s).digest();}
export function seal(value:unknown){const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key(),iv);const encrypted=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString("base64url");}
export function unseal<T>(value:string):T{const b=Buffer.from(value,"base64url");const decipher=createDecipheriv("aes-256-gcm",key(),b.subarray(0,12));decipher.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([decipher.update(b.subarray(28)),decipher.final()]).toString());}
export async function connection(){const {data}=await getAuthUser();if(!data.user)return null;try{const raw=(await cookies()).get(CONNECTION_COOKIE)?.value;if(!raw)return null;const c=unseal<Connection>(raw);return c.uid===data.user.id&&c.expires>Date.now()?c:null;}catch{return null;}}
export async function github<T>(path:string,token:string):Promise<T>{const r=await fetch(`https://api.github.com${path}`,{headers:{Accept:"application/vnd.github+json",Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(10000),cache:"no-store",redirect:"error"});if(!r.ok)throw new Error(r.status===401?"Reconnect GitHub. Your permission expired or was revoked.":"GitHub could not load your repositories. Try again.");return r.json();}
type Installation={id:number;account:{id:number};repository_selection:string};
export type Repo={id:number;name:string;full_name:string;private:boolean;description:string|null;html_url:string;homepage:string|null;has_pages?:boolean;owner:{id:number;login:string}};
export async function installations(c:Connection){const all:Installation[]=[];for(let page=1;;page++){const d=await github<{installations:Installation[]}>(`/user/installations?per_page=100&page=${page}`,c.token);all.push(...d.installations.filter(i=>String(i.account.id)===c.githubId));if(d.installations.length<100)break;if(page>=100)throw new Error("Too many installations. Contact support.");}return all;}
export async function repositories(c:Connection){const list:Repo[]=[];const installs=await installations(c);for(const i of installs){for(let page=1;;page++){const d=await github<{repositories:Repo[]}>(`/user/installations/${i.id}/repositories?per_page=100&page=${page}`,c.token);list.push(...d.repositories.filter(r=>String(r.owner.id)===c.githubId));if(d.repositories.length<100)break;if(page>=100)throw new Error("Too many repositories to load. Narrow your GitHub installation.");}}return {repos:Array.from(new Map(list.map(r=>[r.id,r])).values()),all:installs.some(i=>i.repository_selection==="all"),installed:installs.length>0};}
export function expectedGitHub(user:{identities?:Parameters<typeof githubIdentity>[0]}){return githubIdentity(user.identities);}
