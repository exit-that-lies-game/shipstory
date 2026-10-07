import { cache } from "react";
import { safeHttpUrl } from "../safe-url";
import { createClient, getAuthUser } from "../supabase/server";
import type { Comment, FeedQuery, Profile, Project, Viewer } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

const toProfile = (r: Row): Profile => ({
  id: r.id,
  handle: r.handle,
  name: r.display_name ?? r.handle,
  bio: r.bio ?? "",
  headline: "",
  location: "",
  github: safeHttpUrl((r.links ?? []).find?.((l: Row) => l.type === "github")?.url) || undefined,
  website: safeHttpUrl((r.links ?? []).find?.((l: Row) => l.type === "website")?.url) || undefined,
  projectCount: 0,
  followers: 0,
  reactions: 0,
});

const toProject = (r: Row): Project => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  pitch: r.tagline,
  description: r.description ?? "",
  demoUrl: safeHttpUrl(r.live_url),
  repoUrl: safeHttpUrl(r.repo_url) || undefined,
  cover: r.cover_url ?? "/covers/art.jpg",
  screenshots: r.screenshots ?? [],
  tags: r.tags ?? [],
  stack: [],
  owner: { id: r.owner?.id ?? r.owner_id, handle: r.owner?.handle ?? "", name: r.owner?.display_name ?? r.owner?.handle ?? "" },
  likes: r.like_count,
  saves: r.save_count,
  comments: r.comment_count,
  createdAt: r.created_at,
  score: r.score ?? 0,
});

const SELECT = "*, owner:profiles!projects_owner_id_fkey(id, handle, display_name)";

export const sbGetViewer = cache(async function sbGetViewer(): Promise<Viewer | null> {
  const sb = await createClient();
  const { data } = await getAuthUser();
  if (!data.user) return null;
  const { data: p } = await sb.from("profiles").select("id, handle, display_name").eq("id", data.user.id).maybeSingle();
  return p ? { id: p.id, handle: p.handle, name: p.display_name ?? p.handle } : null;
});

export async function sbListProjects({ sort = "trending", tag, q, ownerHandle, followingOf }: FeedQuery = {}): Promise<Project[]> {
  const sb = await createClient();
  let query = sb.from(sort === "trending" ? "trending_projects" : "projects").select(SELECT).eq("status", "published");
  if (tag) query = query.contains("tags", [tag.toLowerCase()]);
  if (q) query = query.textSearch("title", q, { type: "websearch" });
  if (ownerHandle) {
    const { data: p } = await sb.from("profiles").select("id").eq("handle", ownerHandle).maybeSingle();
    if (!p) return [];
    query = query.eq("owner_id", p.id);
  }
  if (followingOf) {
    const { data: f } = await sb.from("follows").select("followee_id").eq("follower_id", followingOf);
    const ids = (f ?? []).map((r: Row) => r.followee_id);
    if (!ids.length) return [];
    query = query.in("owner_id", ids);
  }
  query = sort === "trending" ? query.order("score", { ascending: false }) : query.order("created_at", { ascending: false });
  const { data } = await query.limit(60);
  return (data ?? []).map(toProject);
}

export async function sbGetProject(slug: string): Promise<Project | null> {
  const sb = await createClient();
  const { data } = await sb.from("projects").select(SELECT).eq("slug", slug).maybeSingle();
  return data ? toProject(data) : null;
}

export async function sbGetProfile(handle: string): Promise<Profile | null> {
  const sb = await createClient();
  const { data } = await sb.from("profiles").select("*").eq("handle", handle).maybeSingle();
  if (!data) return null;
  const [{ count: projectCount }, { count: followers }] = await Promise.all([
    sb.from("projects").select("id", { count: "exact", head: true }).eq("owner_id", data.id).eq("status", "published"),
    sb.from("follows").select("follower_id", { count: "exact", head: true }).eq("followee_id", data.id),
  ]);
  return { ...toProfile(data), projectCount: projectCount ?? 0, followers: followers ?? 0 };
}

export async function sbListComments(projectId: string): Promise<Comment[]> {
  const sb = await createClient();
  const { data } = await sb.from("comments").select("*, author:profiles!comments_author_id_fkey(handle, display_name)").eq("project_id", projectId).order("created_at");
  return (data ?? []).map((r: Row) => ({
    id: r.id,
    projectId: r.project_id,
    author: { handle: r.author?.handle ?? "", name: r.author?.display_name ?? r.author?.handle ?? "" },
    body: r.body,
    likes: r.like_count,
    createdAt: r.created_at,
  }));
}

export async function sbListSaved(): Promise<Project[]> {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];
  const { data } = await sb.from("saves").select(`project:projects(${SELECT})`).eq("user_id", auth.user.id).order("created_at", { ascending: false });
  return (data ?? []).map((r: Row) => toProject(r.project)).filter(Boolean);
}

export async function sbListRisingBuilders(): Promise<Profile[]> {
  const sb = await createClient();
  const { data } = await sb.from("profiles").select("*").order("created_at", { ascending: false }).limit(8);
  return (data ?? []).map(toProfile);
}
