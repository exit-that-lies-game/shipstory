type Identity = {provider:string;id?:string;identity_data?:Record<string,unknown>};
export function githubIdentity(identities:Identity[] = []) {
 const identity=identities.find(i=>i.provider==="github");
 const data=identity?.identity_data;
 const login=data?.user_name ?? data?.preferred_username;
 const id=String(data?.provider_id ?? data?.sub ?? identity?.id ?? "");
 return typeof login==="string" && /^[a-zA-Z0-9-]{1,39}$/.test(login) && /^\d+$/.test(id) ? {login,id}:null;
}
export function ownedPublicRepo(repo:{private?:boolean;owner?:{id?:number|string};name?:string},id:string) {
 return repo.private===false && String(repo.owner?.id)===id && typeof repo.name==="string";
}
