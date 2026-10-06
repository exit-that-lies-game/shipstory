export type Profile = {
  id: string;
  handle: string;
  name: string;
  bio: string;
  headline: string;
  location: string;
  github?: string;
  website?: string;
  projectCount: number;
  followers: number;
  reactions: number;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  pitch: string;
  description: string;
  demoUrl: string;
  repoUrl?: string;
  cover: string;
  screenshots: string[];
  tags: string[];
  stack: string[];
  owner: Pick<Profile, "id" | "handle" | "name">;
  likes: number;
  saves: number;
  comments: number;
  createdAt: string;
  score: number;
};

export type Comment = {
  id: string;
  projectId: string;
  author: Pick<Profile, "handle" | "name">;
  body: string;
  likes: number;
  createdAt: string;
};

export type FeedQuery = {
  sort?: "trending" | "latest";
  tag?: string;
  q?: string;
  ownerHandle?: string;
  followingOf?: string;
};

export type Viewer = { id: string; handle: string; name: string };
