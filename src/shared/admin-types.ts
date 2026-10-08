export type AdminData = {
 counts: { builders: number; projects: number; reports: number; reserved_slots: number };
 projects: { id: string; slug: string; title: string; tagline: string; owner: string; status: string; moderated_hidden: boolean; created_at: string }[];
 builders: { id: string; handle: string; display_name: string; admin_verified: boolean; posting_blocked: boolean; projects: number; reserved_slots: number; created_at: string }[];
 reports: { id: string; reason: string; details: string | null; review_status: string; project_id: string | null; comment_id: string | null; reporter: string; project_title: string; slug: string; comment_body: string | null; created_at: string }[];
 announcements: {id: string; title: string; body: string; state: string}[];
 categories: {tag: string; projects: number}[];
 activity: {day: string; projects: number; builders: number}[];
 admins: {handle: string}[];
 actions: { target_kind: string; target_id: string; action: string; created_at: string }[];
};
