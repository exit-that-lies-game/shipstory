// Data access layer. Pages only import from here. Uses Supabase when configured and falls back to demo data
// only when a query returns nothing in an unconfigured environment.
import { comments, profiles, projects, topics } from "./mock-data";
import { supabaseConfigured } from "../supabase/client";
import { sbGetViewer, sbGetProfile, sbGetProject, sbListComments, sbListProjects, sbListRisingBuilders, sbListSaved, sbSearchBuilders } from "./supabase-source";
import type { Comment, FeedQuery, Profile, Project, Viewer } from "./types";

export type { Comment, FeedQuery, Profile, Project, Viewer };

const live = supabaseConfigured;

export async function listProjects(query: FeedQuery = {}): Promise<Project[]> {
  if (live) return sbListProjects(query);
  const { sort = "trending", tag, q, ownerHandle } = query;
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
  return live ? sbGetProject(slug) : (projects.find((p) => p.slug === slug) ?? null);
}

export async function getProfile(handle: string): Promise<Profile | null> {
  return live ? sbGetProfile(handle) : (profiles.find((p) => p.handle === handle) ?? null);
}

export async function listComments(projectId: string): Promise<Comment[]> {
  return live ? sbListComments(projectId) : comments.filter((c) => c.projectId === projectId);
}

export async function listRisingBuilders(): Promise<Profile[]> {
  return live ? sbListRisingBuilders() : profiles;
}

export async function listSaved(): Promise<Project[]> {
  return live ? sbListSaved() : projects.slice(0, 3);
}

export async function listTopics(): Promise<string[]> {
  return topics;
}

export async function getViewer(): Promise<Viewer | null> {
  if (live) return sbGetViewer();
  return { id: "u1", handle: "balu", name: "Balamanikanta" };
}

export async function searchBuilders(q: string): Promise<Profile[]> {
  if (live) return sbSearchBuilders(q);
  const s = q.toLowerCase();
  return profiles.filter((p) => `${p.handle} ${p.name}`.toLowerCase().includes(s)).slice(0, 6);
}
