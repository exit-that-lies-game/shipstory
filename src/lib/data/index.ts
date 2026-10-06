// Data access layer. Pages only import from here, so swapping mock data for Supabase touches this folder only.
import { comments, profiles, projects, topics } from "./mock-data";
import type { Comment, FeedQuery, Profile, Project } from "./types";

export type { Comment, FeedQuery, Profile, Project };

export async function listProjects({ sort = "trending", tag, q, ownerHandle }: FeedQuery = {}): Promise<Project[]> {
  let list = [...projects];
  if (tag) list = list.filter((p) => p.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
  if (ownerHandle) list = list.filter((p) => p.owner.handle === ownerHandle);
  if (q) {
    const s = q.toLowerCase();
    list = list.filter((p) => [p.title, p.pitch, p.owner.handle, ...p.tags].join(" ").toLowerCase().includes(s));
  }
  return sort === "latest" ? list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : list.sort((a, b) => b.score - a.score);
}

export async function getProject(slug: string): Promise<Project | null> {
  return projects.find((p) => p.slug === slug) ?? null;
}

export async function getProfile(handle: string): Promise<Profile | null> {
  return profiles.find((p) => p.handle === handle) ?? null;
}

export async function listComments(projectId: string): Promise<Comment[]> {
  return comments.filter((c) => c.projectId === projectId);
}

export async function listRisingBuilders(): Promise<Profile[]> {
  return profiles;
}

export async function listSaved(): Promise<Project[]> {
  return projects.slice(0, 3);
}

export async function listTopics(): Promise<string[]> {
  return topics;
}
