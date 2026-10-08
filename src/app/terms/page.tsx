import type { Metadata } from "next";
import { LegalPage, CONTACT_EMAIL } from "@/components/layout/LegalPage";
export const metadata: Metadata = { title: "Terms of Service - ShipStory", description: "The rules for using ShipStory." };
export default function Terms() {
  return <LegalPage title="Terms of Service">
    <p>By using ShipStory you agree to these terms. If you do not agree, please do not use the service.</p>
    <h2>Your account</h2>
    <p>You sign in with Google or GitHub. You are responsible for activity on your account. Give us accurate information and keep your sign-in secure.</p>
    <h2>Your content</h2>
    <p>You own what you publish. You give ShipStory permission to host and display it so the service can work, including showing your projects publicly. Only publish what you have the right to share. Do not publish anyone else&apos;s private information, secrets or credentials.</p>
    <h2>What is not allowed</h2>
    <ul>
      <li>Spam, scams, malware, or links designed to harm or deceive.</li>
      <li>Harassment, hate, or content that is illegal or infringes someone else&apos;s rights.</li>
      <li>Attempts to break, overload or bypass the security or limits of the service.</li>
      <li>Using automated tools to create accounts or post in bulk.</li>
    </ul>
    <h2>Moderation</h2>
    <p>Anyone can report a project or comment. We may hide or remove content and limit or close accounts that break these terms, with or without notice.</p>
    <h2>Third-party projects</h2>
    <p>Projects link to sites and apps made by other people. We do not control them and are not responsible for them. Try them at your own risk.</p>
    <h2>No warranty</h2>
    <p>ShipStory is provided as is. We try to keep it running, but we do not promise it will always be available or error free. To the extent the law allows, we are not liable for indirect or lost-data damages.</p>
    <h2>Changes and contact</h2>
    <p>We may update these terms and will change the date above when we do. Continued use means you accept the update. Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
  </LegalPage>;
}
