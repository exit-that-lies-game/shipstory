import type { Comment, Profile, Project } from "./types";

export const profiles: Profile[] = [
  { id: "u1", handle: "balu", name: "Balamanikanta", headline: "AI-assisted builder", location: "Hyderabad", bio: "Building useful web apps for everyday people.", github: "https://github.com/balamanikantatirunagaram-lgtm", projectCount: 6, followers: 312, reactions: 1400 },
  { id: "u2", handle: "ravi", name: "Ravi", headline: "Frontend developer", location: "Bengaluru", bio: "Tinkering with small tools and games.", projectCount: 8, followers: 140, reactions: 620 },
  { id: "u3", handle: "sri", name: "Sri", headline: "Artist and web hobbyist", location: "Hyderabad", bio: "Art first, code second.", projectCount: 6, followers: 98, reactions: 310 },
];

const owner = (h: string) => {
  const p = profiles.find((x) => x.handle === h)!;
  return { id: p.id, handle: p.handle, name: p.name };
};

export const projects: Project[] = [
  { id: "p1", slug: "sravana", title: "Sravana", pitch: "Free local music player. No ads, no premium wall.", description: "Sravana is a free local music player for people who do not want to pay for a premium wall. It works offline, installs as a PWA and has no ads. Built with Next.js and Supabase.", demoUrl: "https://sravana.app", repoUrl: "https://github.com/example/sravana", cover: "/covers/music.jpg", screenshots: ["/covers/music.jpg", "/covers/game.jpg", "/covers/python.jpg", "/covers/tutor.jpg"], tags: ["Web", "Music"], stack: ["Next.js", "Supabase", "PWA", "TypeScript"], owner: owner("balu"), likes: 128, saves: 61, comments: 24, createdAt: "2026-10-04T10:00:00Z", score: 96 },
  { id: "p2", slug: "pythonpath", title: "PythonPath", pitch: "Learn Python from basics, one page, no scroll.", description: "A one-page Python course with 75 practice problems that are checked automatically. Each problem only uses what the chapter has taught so far.", demoUrl: "https://python-path-six.vercel.app", cover: "/covers/python.jpg", screenshots: ["/covers/python.jpg"], tags: ["Web", "Learning"], stack: ["Next.js", "Python"], owner: owner("balu"), likes: 94, saves: 40, comments: 17, createdAt: "2026-10-03T10:00:00Z", score: 80 },
  { id: "p3", slug: "invgen", title: "InvGen", pitch: "GST invoices and quotations in seconds.", description: "A GST invoicing and quotation web app for small Indian businesses.", demoUrl: "https://invgen.in", cover: "/covers/invoice.jpg", screenshots: ["/covers/invoice.jpg"], tags: ["Web", "Tools"], stack: ["React", "Node"], owner: owner("balu"), likes: 71, saves: 22, comments: 9, createdAt: "2026-09-28T10:00:00Z", score: 60 },
  { id: "p4", slug: "exit-that-lies", title: "Exit That Lies", pitch: "Browser puzzle game, escape the lie.", description: "A small browser puzzle game where the exit sign is never telling the truth.", demoUrl: "https://exit-that-lies.vercel.app", cover: "/covers/game.jpg", screenshots: ["/covers/game.jpg"], tags: ["Games", "Web"], stack: ["Canvas", "JavaScript"], owner: owner("balu"), likes: 60, saves: 18, comments: 12, createdAt: "2026-09-26T10:00:00Z", score: 55 },
  { id: "p5", slug: "tuitionly", title: "Tuitionly", pitch: "Hyderabad tutor and student matching.", description: "Matches students with local tutors in Hyderabad by subject, area and budget.", demoUrl: "https://tuitionly.in", cover: "/covers/tutor.jpg", screenshots: ["/covers/tutor.jpg"], tags: ["Web", "Education"], stack: ["Next.js", "Supabase"], owner: owner("ravi"), likes: 52, saves: 15, comments: 8, createdAt: "2026-10-05T10:00:00Z", score: 48 },
  { id: "p6", slug: "arts-of-sri", title: "Arts of Sri", pitch: "Portfolio site for an artist.", description: "A calm portfolio site that lets an artist show and sell her paintings.", demoUrl: "https://arts-of-sri-v2.vercel.app", cover: "/covers/art.jpg", screenshots: ["/covers/art.jpg"], tags: ["Web", "Design"], stack: ["Next.js"], owner: owner("sri"), likes: 41, saves: 9, comments: 5, createdAt: "2026-10-05T18:00:00Z", score: 40 },
];

export const comments: Comment[] = [
  { id: "c1", projectId: "p1", author: { handle: "ravi", name: "Ravi" }, body: "Clean UI! Been using it for a week, super smooth.", likes: 12, createdAt: "2026-10-05T09:00:00Z" },
  { id: "c2", projectId: "p1", author: { handle: "sri", name: "Sri" }, body: "Works great on my Redmi. A sleep timer would be lovely.", likes: 4, createdAt: "2026-10-05T12:30:00Z" },
];

export const topics = ["Web", "Mobile", "AI", "Games", "Dev tools"];
