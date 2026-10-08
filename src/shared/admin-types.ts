export type AdminData = {
 counts: { builders: number; projects: number; reports: number; reserved_slots: number };
 projects: { id: string; slug: string; title: string; tagline: string; owner: string; status: string; moderated_hidden: boolean; created_at: string }[];
 builders: { id: string; handle: string; display_name: string; admin_verified: boolean; posting_blocked: boolean; projects: number; reserved_slots: number; created_at: string }[];
 reports: { id: string; reason: string; details: string | null; review_status: string; project_id: string | null; comment_id: string | null; reporter: string; project_title: string; slug: string; comment_body: string | null; created_at: string }[];
 announcements: {id: string; title: string; body: string; state: string; image_url: string | null; link_url: string | null}[];
 categories: {tag: string; projects: number}[];
 activity: {day: string; projects: number; builders: number}[];
 admins: {handle: string}[];
 actions: { target_kind: string; target_id: string; action: string; created_at: string }[];
};

export type AdminProjectDetail = {
 project: { id: string; slug: string; title: string; tagline: string; description: string; live_url: string | null; repo_url: string | null; tags: string[]; cover_url: string | null; screenshots: string[]; status: string; moderated_hidden: boolean; like_count: number; save_count: number; comment_count: number; created_at: string; updated_at: string; owner_id: string; owner: string };
 updates: { title: string; body: string; created_at: string }[];
 reports: { id: string; reason: string; details: string | null; review_status: string; created_at: string; reporter: string }[];
 history: { action: string; reason: string | null; created_at: string }[];
};
export type AdminUserDetail = {
 user: { id: string; handle: string; display_name: string | null; bio: string | null; avatar_url: string | null; created_at: string; admin_verified: boolean; posting_blocked: boolean; suspended: boolean; provider: string; last_sign_in_at: string | null; comments: number; reserved_slots: number; is_owner: boolean };
 projects: { id: string; slug: string; title: string; status: string; moderated_hidden: boolean; like_count: number; created_at: string }[];
 reports_against: { id: string; reason: string; details: string | null; review_status: string; created_at: string; reporter: string; target: string }[];
 reports_filed: number;
 activity: { what: string; created_at: string }[];
 history: { action: string; reason: string | null; created_at: string }[];
};
export type AdminLogEntry = { target_kind: string; target_id: string; action: string; reason: string | null; created_at: string; admin: string | null; label: string | null };
export type AdminAccessList = { members: { user_id: string; role: string; created_at: string; handle: string; email: string }[]; invites: { email: string; role: string; created_at: string }[] };
