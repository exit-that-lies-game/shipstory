import type { Metadata } from "next";
import { LegalPage, CONTACT_EMAIL } from "@/components/layout/LegalPage";
export const metadata: Metadata = { title: "Privacy Policy - ShipStory", description: "What ShipStory collects, why, and the choices you have." };
export default function Privacy() {
  return <LegalPage title="Privacy Policy">
    <p>ShipStory is a place for builders to publish projects, and for others to try them, react, comment and follow along. This page explains what we collect and how we use it.</p>
    <h2>What we collect</h2>
    <ul>
      <li><b>Account details.</b> When you sign in with Google or GitHub we receive your name, email address and profile picture from that provider. We do not receive your provider password.</li>
      <li><b>What you publish.</b> Project titles, descriptions, links, tags, screenshots and cover images, updates, comments, reactions, saves and follows. Published content is public.</li>
      <li><b>Reports and safety signals.</b> Reports you submit, and basic abuse-prevention checks (a Cloudflare Turnstile challenge and rate limits) when you sign in or post.</li>
      <li><b>Usage counts.</b> Aggregate view and engagement counts so project owners can see how their projects are doing.</li>
    </ul>
    <h2>GitHub repository import</h2>
    <p>If you choose to connect GitHub, ShipStory asks for read-only access to repository metadata only: names, descriptions, homepage links and whether a repository is private. It cannot read your code or make changes. You choose which repositories to grant on GitHub, and you can change or remove that access in your GitHub settings at any time. Private repository links are never published, and private metadata stays in your draft until you review and publish it.</p>
    <h2>How we use it</h2>
    <p>To run the service: sign you in, show your profile and projects, send in-app notifications, prevent abuse, and keep the service secure. We do not sell your data and we do not show ads.</p>
    <h2>Who handles it</h2>
    <p>We use Supabase (database, authentication and file storage), Vercel (hosting), Cloudflare (abuse protection), and Google and GitHub (sign-in). They process data for us only to provide those services.</p>
    <h2>Cookies</h2>
    <p>We use cookies to keep you signed in and to protect the service. We do not use advertising cookies.</p>
    <h2>Your choices</h2>
    <ul>
      <li>Edit or delete your projects and comments at any time.</li>
      <li>Disconnect GitHub from ShipStory, or remove the app in your GitHub settings.</li>
      <li>Ask us to delete your account and the content tied to it by emailing <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</li>
    </ul>
    <h2>Children</h2>
    <p>ShipStory is not meant for children under 13, and we do not knowingly collect their data.</p>
    <h2>Changes and contact</h2>
    <p>If we change this policy we will update the date above. Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
  </LegalPage>;
}
