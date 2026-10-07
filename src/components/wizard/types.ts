export type Draft = {
  privateSource?: boolean;
  privateReviewed?: boolean;
  title: string;
  pitch: string;
  description: string;
  tags: string[];
  demoUrl: string;
  repoUrl: string;
  coverPreview: string | null;
  shotPreviews: string[];
  coverFile?: File;
  shotFiles: File[];
};

export const emptyDraft: Draft = { title: "", pitch: "", description: "", tags: [], demoUrl: "", repoUrl: "", coverPreview: null, shotPreviews: [], shotFiles: [] };

export const TAG_SUGGESTIONS = ["Web", "Mobile", "AI", "Games", "Dev tools", "Music", "Education", "Design"];

export function validUrl(v: string) {
  try { const u = new URL(v); return u.protocol === "https:" || u.protocol === "http:"; } catch { return false; }
}

export function stepErrors(step: number, d: Draft): string[] {
  const e: string[] = [];
  if (step === 0) {
    if (d.title.trim().length < 2) e.push("Add a project name.");
    if (d.pitch.trim().length < 5) e.push("Add a short pitch.");
    if (d.tags.length === 0) e.push("Pick at least one tag.");
  }
  if (step === 1) {
    if (!validUrl(d.demoUrl)) e.push("Add a valid live demo URL starting with https://");
    if (d.repoUrl && !validUrl(d.repoUrl)) e.push("Repo URL must be a valid link.");
    if (!d.coverPreview) e.push("Upload a cover image.");
  }
  return e;
}
