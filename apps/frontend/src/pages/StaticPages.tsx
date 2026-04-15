import React from "react";

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-black min-h-screen font-sans">
    <main>{children}</main>
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full px-4 py-1.5 mb-6">
    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
    <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">{children}</span>
  </div>
);

const PageHero = ({
  label,
  title,
  accent,
  subtitle,
}: {
  label: string;
  title: string;
  accent?: string;
  subtitle: string;
}) => (
  <section className="max-w-4xl mx-auto px-8 py-24 text-center">
    <SectionLabel>{label}</SectionLabel>
    <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
      {title}{" "}
      {accent && <span className="text-amber-400">{accent}</span>}
    </h1>
    <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">{subtitle}</p>
  </section>
);

// ─── /features ────────────────────────────────────────────────────────────────

const featuresList = [
  {
    title: "Local-First Recording",
    desc: "Every participant records directly to their own device at full resolution. No compression, no dropped frames — the network never touches your source audio or video.",
  },
  {
    title: "Automatic Track Merging",
    desc: "Weave syncs and merges all participant tracks in the cloud automatically after a session. No manual editing required — just download the finished multitrack.",
  },
  {
    title: "Up to 4K Export",
    desc: "Export your finished recordings at up to 4K resolution. Whether you're publishing to YouTube or delivering to a broadcast client, quality is never a question.",
  },
  {
    title: "AES-128 Encryption",
    desc: "All uploads are encrypted in transit and at rest. Your recordings are private by default — only you and invited collaborators can access them.",
  },
  {
    title: "Zero Network Delay",
    desc: "Because recording happens locally, latency never affects your source quality. Bad WiFi on the other side? Doesn't matter. The recording is pristine regardless.",
  },
  {
    title: "Browser-Based",
    desc: "No downloads, no plugins. Guests join from a link in any modern browser. You get studio-quality tracks without asking your guests to install anything.",
  },
  {
    title: "Multitrack Download",
    desc: "Download every participant's track as a separate file for full control in post-production. Perfect for podcasters, journalists, and audio engineers.",
  },
  {
    title: "Live Chat & Reactions",
    desc: "Communicate with guests during recording without interrupting the audio. Built-in chat and emoji reactions keep sessions smooth and collaborative.",
  },
  {
    title: "Session Analytics",
    desc: "See recording quality metrics, participant connection status, and upload progress in real time — all from a single dashboard.",
  },
];

export const FeaturesPage = () => (
  <PageWrapper>
    <PageHero
      label="Features"
      title="Everything you need to record"
      accent="without compromise."
      subtitle="Weave is built around one idea: your recording quality should never depend on anyone's internet connection."
    />
    <section className="max-w-6xl mx-auto px-8 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuresList.map((f) => (
        <div
          key={f.title}
          className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 hover:border-amber-400/30 hover:bg-zinc-900 transition-all group"
        >
          <h3 className="text-white font-bold text-lg mb-2 group-hover:text-amber-400 transition-colors">
            {f.title}
          </h3>
          <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </section>
  </PageWrapper>
);

// ─── /security ────────────────────────────────────────────────────────────────

const securityPillars = [
  {
    title: "Encryption in Transit",
    body: "All data transferred between your browser and Weave's servers is protected by TLS 1.3. No plaintext ever leaves your device.",
  },
  {
    title: "Encryption at Rest",
    body: "Recordings stored on Weave infrastructure are encrypted with AES-128. Your files are unreadable to anyone without your credentials.",
  },
  {
    title: "Zero-Knowledge Architecture",
    body: "Weave employees cannot access your recording content. Decryption keys are derived from your account and never stored on our servers.",
  },
  {
    title: "SOC 2 Compliant Infrastructure",
    body: "Our cloud infrastructure is hosted on SOC 2 Type II certified providers. Regular third-party audits verify our controls.",
  },
  {
    title: "Secure Guest Links",
    body: "Session invite links are single-use and expire automatically. No account needed for guests — and no persistent access once a session ends.",
  },
  {
    title: "Data Deletion",
    body: "You can delete your recordings and account data at any time. Deletion is permanent and propagates to all backup systems within 30 days.",
  },
];

export const SecurityPage = () => (
  <PageWrapper>
    <PageHero
      label="Security"
      title="Your recordings are"
      accent="yours alone."
      subtitle="We built Weave with a security-first mindset. Here's exactly how we protect your content."
    />
    <section className="max-w-5xl mx-auto px-8 pb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
      {securityPillars.map((p) => (
        <div key={p.title} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-7">
          <div className="flex items-start gap-4">
            <div className="mt-1 w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <div>
              <h3 className="text-white font-bold text-base mb-2">{p.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{p.body}</p>
            </div>
          </div>
        </div>
      ))}
    </section>

    <section className="max-w-5xl mx-auto px-8 pb-32">
      <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-white font-bold text-xl mb-1">Found a vulnerability?</h3>
          <p className="text-zinc-400 text-sm">We have a responsible disclosure program. Report issues and we'll respond within 48 hours.</p>
        </div>
        <a
          href="mailto:security@weave.app"
          className="shrink-0 bg-amber-400 text-black font-bold text-sm px-6 py-3 rounded-full hover:bg-amber-300 transition-colors"
        >
          security@weave.app
        </a>
      </div>
    </section>
  </PageWrapper>
);

// ─── /changelog ───────────────────────────────────────────────────────────────

const changelogEntries = [
  {
    version: "2.4.0",
    date: "April 10, 2026",
    tag: "Major",
    changes: [
      "4K export is now available on all paid plans",
      "Redesigned session dashboard with real-time upload progress",
      "New multitrack download experience with per-track quality indicators",
    ],
  },
  {
    version: "2.3.2",
    date: "March 28, 2026",
    tag: "Fix",
    changes: [
      "Fixed audio sync drift on sessions longer than 90 minutes",
      "Resolved guest join failure on Firefox 124",
      "Improved error messaging when local disk space is insufficient",
    ],
  },
  {
    version: "2.3.0",
    date: "March 14, 2026",
    tag: "Feature",
    changes: [
      "Live chat and emoji reactions during sessions",
      "Session scheduling with calendar invite generation",
      "Guest name customisation before joining",
    ],
  },
  {
    version: "2.2.1",
    date: "February 25, 2026",
    tag: "Fix",
    changes: [
      "Hotfix for upload failure on Safari 17.4",
      "Fixed incorrect recording duration shown in dashboard",
    ],
  },
  {
    version: "2.2.0",
    date: "February 10, 2026",
    tag: "Feature",
    changes: [
      "AES-128 encryption now applied to all recordings at rest",
      "New analytics panel: per-participant connection quality",
      "Webhook support for session events (started, ended, uploaded)",
    ],
  },
];

const tagColors: Record<string, string> = {
  Major: "bg-amber-400 text-black",
  Feature: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Fix: "bg-zinc-800 text-zinc-400 border border-white/5",
};

export const ChangelogPage = () => (
  <PageWrapper>
    <PageHero
      label="Changelog"
      title="What's new in"
      accent="Weave."
      subtitle="Every improvement, fix, and new feature — shipped in the open."
    />
    <section className="max-w-3xl mx-auto px-8 pb-32 space-y-10">
      {changelogEntries.map((entry) => (
        <div key={entry.version} className="relative pl-6 border-l border-white/10">
          <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-zinc-800 border-2 border-amber-400" />
          <div className="flex items-center gap-3 mb-3">
            <span className="text-white font-black text-lg">v{entry.version}</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tagColors[entry.tag]}`}>
              {entry.tag}
            </span>
            <span className="text-zinc-600 text-sm">{entry.date}</span>
          </div>
          <ul className="space-y-2">
            {entry.changes.map((c) => (
              <li key={c} className="flex items-start gap-2 text-zinc-400 text-sm">
                <span className="text-amber-400 mt-1 shrink-0">→</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  </PageWrapper>
);

// ─── /privacy ─────────────────────────────────────────────────────────────────

const privacySections = [
  {
    title: "What we collect",
    body: `We collect information you provide directly: your name, email, and payment details when you sign up. During sessions, we collect recording data (audio and video) and technical metadata such as device type, browser, and IP address. We do not sell this data to third parties.`,
  },
  {
    title: "How we use it",
    body: `Your data is used to operate the service — processing recordings, syncing tracks, and delivering exports. We use email to send account notifications and (with your consent) product updates. Technical metadata helps us diagnose issues and improve performance.`,
  },
  {
    title: "Data storage & retention",
    body: `Recordings are stored encrypted on our servers for 30 days after creation, then automatically deleted unless you choose to keep them. Account data is retained for the lifetime of your account. You may request deletion at any time.`,
  },
  {
    title: "Third-party services",
    body: `We use Stripe for payment processing, AWS for cloud storage, and Postmark for transactional email. Each of these providers processes only the minimum data required. We do not use advertising networks or sell data to data brokers.`,
  },
  {
    title: "Your rights",
    body: `Depending on your region, you may have the right to access, correct, export, or delete your personal data. To exercise any of these rights, contact us at privacy@weave.app. We will respond within 30 days.`,
  },
  {
    title: "Cookies",
    body: `We use only essential cookies required for authentication and session management. We do not use tracking cookies, third-party analytics cookies, or advertising cookies.`,
  },
  {
    title: "Changes to this policy",
    body: `We will notify you by email at least 14 days before making material changes to this policy. Continued use of Weave after that period constitutes acceptance of the updated policy.`,
  },
];

export const PrivacyPage = () => (
  <PageWrapper>
    <PageHero
      label="Privacy Policy"
      title="We respect your"
      accent="privacy."
      subtitle="Plain language. No legalese. Last updated April 10, 2026."
    />
    <section className="max-w-3xl mx-auto px-8 pb-32 space-y-8">
      {privacySections.map((s, i) => (
        <div key={s.title} className="border-b border-white/5 pb-8">
          <div className="flex items-start gap-5">
            <span className="text-amber-400 font-black text-sm w-6 shrink-0 mt-1">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="text-white font-bold text-lg mb-3">{s.title}</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{s.body}</p>
            </div>
          </div>
        </div>
      ))}
      <p className="text-zinc-600 text-xs text-center pt-4">
        Questions? Email us at{" "}
        <a href="mailto:privacy@weave.app" className="text-amber-400 hover:underline">
          privacy@weave.app
        </a>
      </p>
    </section>
  </PageWrapper>
);

// ─── /terms ───────────────────────────────────────────────────────────────────

const termsSections = [
  {
    title: "Acceptance of Terms",
    body: `By creating a Weave account or using our services, you agree to these Terms of Service. If you do not agree, please do not use Weave. These terms apply to all users, including guests who join sessions without an account.`,
  },
  {
    title: "Your Content",
    body: `You retain full ownership of all recordings and content created using Weave. By using the service, you grant Weave a limited license to store, process, and deliver your content solely for the purpose of providing the service. We do not claim ownership of your recordings.`,
  },
  {
    title: "Acceptable Use",
    body: `You agree not to use Weave to record individuals without their consent, distribute illegal content, violate any applicable laws, or attempt to reverse-engineer, disrupt, or abuse the service. Violations may result in immediate account termination.`,
  },
  {
    title: "Subscriptions & Billing",
    body: `Paid plans are billed monthly or annually in advance. Cancellations take effect at the end of the current billing period — we do not offer prorated refunds for partial periods. You may downgrade to the free plan at any time.`,
  },
  {
    title: "Service Availability",
    body: `We aim for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be announced in advance. We are not liable for losses resulting from service interruptions beyond our control.`,
  },
  {
    title: "Limitation of Liability",
    body: `To the maximum extent permitted by law, Weave's liability for any claim arising from use of the service is limited to the amount you paid in the three months preceding the claim. We are not liable for indirect, incidental, or consequential damages.`,
  },
  {
    title: "Termination",
    body: `Either party may terminate the agreement at any time. Upon termination, your access to recordings will continue for 30 days, after which all data will be deleted. We reserve the right to terminate accounts that violate these terms without prior notice.`,
  },
  {
    title: "Governing Law",
    body: `These terms are governed by the laws of the State of Delaware, United States. Any disputes will be resolved through binding arbitration, except where prohibited by applicable law.`,
  },
];

export const TermsPage = () => (
  <PageWrapper>
    <PageHero
      label="Terms of Service"
      title="The rules of"
      accent="engagement."
      subtitle="Straightforward terms. Last updated April 10, 2026."
    />
    <section className="max-w-3xl mx-auto px-8 pb-32 space-y-8">
      {termsSections.map((s, i) => (
        <div key={s.title} className="border-b border-white/5 pb-8">
          <div className="flex items-start gap-5">
            <span className="text-amber-400 font-black text-sm w-6 shrink-0 mt-1">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="text-white font-bold text-lg mb-3">{s.title}</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{s.body}</p>
            </div>
          </div>
        </div>
      ))}
      <p className="text-zinc-600 text-xs text-center pt-4">
        Questions about these terms?{" "}
        <a href="mailto:legal@weave.app" className="text-amber-400 hover:underline">
          legal@weave.app
        </a>
      </p>
    </section>
  </PageWrapper>
);

// ─── /blog ────────────────────────────────────────────────────────────────────

const blogPosts = [
  {
    date: "April 12, 2026",
    tag: "Product",
    title: "Introducing 4K export — maximum quality, zero compromise",
    excerpt:
      "From today, every Weave recording can be exported at up to 4K resolution. Here's why it took us two years to get here, and why it was worth the wait.",
    readTime: "5 min read",
  },
  {
    date: "March 20, 2026",
    tag: "Deep Dive",
    title: "Why local recording beats cloud recording — always",
    excerpt:
      "The dirty secret of cloud-based recording platforms: when your guest's WiFi drops, so does your audio quality. We explain the engineering behind Weave's local-first approach.",
    readTime: "8 min read",
  },
  {
    date: "March 5, 2026",
    tag: "Creator Stories",
    title: "How The Dispatch records 12 shows per week with a 3-person team",
    excerpt:
      "The independent media company switched to Weave in January. We sat down with their head of production to find out what changed.",
    readTime: "6 min read",
  },
  {
    date: "February 18, 2026",
    tag: "Security",
    title: "AES-128 encryption is now on by default for all recordings",
    excerpt:
      "Starting today, every recording stored on Weave is encrypted at rest. No opt-in required. Here's what that means for your content.",
    readTime: "3 min read",
  },
  {
    date: "February 1, 2026",
    tag: "Tutorial",
    title: "The complete guide to remote podcast production in 2026",
    excerpt:
      "From recording setup to final export — a step-by-step walkthrough for podcasters who want studio-quality audio without a studio.",
    readTime: "12 min read",
  },
  {
    date: "January 15, 2026",
    tag: "Company",
    title: "Weave raises $8M to build the future of remote recording",
    excerpt:
      "We're excited to announce our Series A. Here's what we're building and why we think remote recording is still deeply broken.",
    readTime: "4 min read",
  },
];

const blogTagColors: Record<string, string> = {
  Product: "text-amber-400 bg-amber-400/10 border border-amber-400/20",
  "Deep Dive": "text-blue-400 bg-blue-400/10 border border-blue-400/20",
  "Creator Stories": "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
  Security: "text-red-400 bg-red-400/10 border border-red-400/20",
  Tutorial: "text-purple-400 bg-purple-400/10 border border-purple-400/20",
  Company: "text-zinc-300 bg-white/5 border border-white/10",
};

export const BlogPage = () => (
  <PageWrapper>
    <PageHero
      label="Blog"
      title="Stories, guides, and"
      accent="deep dives."
      subtitle="Thoughts on remote recording, product updates, and the future of audio."
    />
    <section className="max-w-5xl mx-auto px-8 pb-32 grid grid-cols-1 md:grid-cols-2 gap-6">
      {blogPosts.map((post) => (
        <article
          key={post.title}
          className="group bg-zinc-900/60 border border-white/5 rounded-2xl p-7 hover:border-amber-400/30 hover:bg-zinc-900 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${blogTagColors[post.tag] ?? ""}`}>
              {post.tag}
            </span>
            <span className="text-zinc-600 text-xs">{post.date}</span>
          </div>
          <h2 className="text-white font-bold text-lg leading-snug mb-3 group-hover:text-amber-400 transition-colors">
            {post.title}
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed mb-5">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 text-xs">{post.readTime}</span>
            <span className="text-amber-400 text-sm font-semibold group-hover:translate-x-1 transition-transform inline-block">
              Read →
            </span>
          </div>
        </article>
      ))}
    </section>
  </PageWrapper>
);

// ─── /support ─────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "Do my guests need to create an account?",
    a: "No. Guests join via a link and can record directly in their browser with no account or download required.",
  },
  {
    q: "What happens if someone loses their internet connection during a session?",
    a: "Because recording is local, their audio and video track continues unaffected. The upload to Weave simply resumes when their connection is restored.",
  },
  {
    q: "How long are recordings stored?",
    a: "Recordings are stored for 30 days by default. Pro and Team plan users can enable permanent storage in their dashboard settings.",
  },
  {
    q: "What file formats are available for export?",
    a: "You can export individual tracks as WAV or AAC, and video tracks as MP4. Multitrack sessions can also be exported as a ZIP of separate files.",
  },
  {
    q: "Can I record video and audio separately?",
    a: "Yes. Each track — audio and video — is a separate file in your session. You can mix and match in post-production.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The free plan supports up to 2 participants, 720p video, and up to 2 hours of recording per month. Paid plans start at $19/month.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to Settings → Billing → Cancel plan. Your access continues until the end of the current billing period, then reverts to the free plan.",
  },
];

const supportChannels = [
  {
    title: "Email support",
    desc: "For billing, account, and technical issues.",
    cta: "support@weave.app",
    href: "mailto:support@weave.app",
  },
  {
    title: "Live chat",
    desc: "Available Monday–Friday, 9am–6pm ET.",
    cta: "Open chat",
    href: "#",
  },
  {
    title: "Documentation",
    desc: "Step-by-step guides for every feature.",
    cta: "Browse docs",
    href: "#",
  },
];

export const SupportPage = () => (
  <PageWrapper>
    <PageHero
      label="Support"
      title="We're here to"
      accent="help."
      subtitle="Find answers fast or reach our team directly. We respond within one business day."
    />

    {/* Contact channels */}
    <section className="max-w-5xl mx-auto px-8 pb-16 grid grid-cols-1 md:grid-cols-3 gap-5">
      {supportChannels.map((ch) => (
        <div
          key={ch.title}
          className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 flex flex-col gap-3"
        >
          <h3 className="text-white font-bold text-base">{ch.title}</h3>
          <p className="text-zinc-500 text-sm flex-1">{ch.desc}</p>
          <a
            href={ch.href}
            className="text-amber-400 text-sm font-semibold hover:underline"
          >
            {ch.cta} →
          </a>
        </div>
      ))}
    </section>

    {/* FAQ */}
    <section className="max-w-3xl mx-auto px-8 pb-32">
      <h2 className="text-white font-black text-3xl mb-10 text-center">
        Frequently asked questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group bg-zinc-900/60 border border-white/5 rounded-2xl px-6 py-5 open:border-amber-400/30 transition-all"
          >
            <summary className="text-white font-semibold text-sm cursor-pointer list-none flex items-center justify-between gap-4">
              {faq.q}
              <span className="text-amber-400 shrink-0 group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-zinc-400 text-sm leading-relaxed mt-4 border-t border-white/5 pt-4">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  </PageWrapper>
);