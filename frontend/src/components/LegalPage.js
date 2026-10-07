"use client";

/**
 * LegalPage (single self-contained file).
 *
 * Renders ALL legal pages from the LEGAL data block below:
 *   privacy-policy | terms-of-service | cookies | gdpr | security
 *
 * Usage (in each route file):
 *   import LegalPage from "../components/LegalPage";
 *   export default function Page() { return <LegalPage slug="privacy-policy" />; }
 *
 * Needs: framer-motion, lucide-react, Tailwind, and ./Footer (your Footer.js).
 *
 * Layout: floating-navbar-safe hero, sticky "On this page" table of contents
 * with active-section highlight, glass section cards, related-pages cards,
 * contact card, then your Footer.
 *
 * All copy lives in the DATA block. Edit COMPANY / CONTACT first.
 * NOTE: this is a solid starting template, NOT legal advice. Have a lawyer
 * review it and make sure it matches what your product really does.
 */

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronRight,
  Clock,
  Cookie,
  FileText,
  Globe,
  List,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Footer from "./Footer"; // adjust the path if your Footer lives elsewhere

const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* Page chrome switches                                                    */
/* ====================================================================== */

// Navbar is fixed and (in your app) most likely mounted in app/layout.js.
// Set to true ONLY if the Navbar is not already rendered by your layout.
const SHOW_NAVBAR = false;
// Footer is rendered at the bottom of each legal page (it was used in
// app/page.js before). Set to false if your layout already renders it.
const SHOW_FOOTER = true;

/* ====================================================================== */
/* DATA (edit me)                                                          */
/* ====================================================================== */

const COMPANY = "NovaAI";
const LAST_UPDATED = "October 7, 2026";
const EFFECTIVE = "October 7, 2026";

// Replace with your real addresses / legal entity details.
const C = {
  privacy: "privacy@novaai.com",
  legal: "legal@novaai.com",
  security: "security@novaai.com",
  dpo: "dpo@novaai.com",
  support: "support@novaai.com",
  entity: "NovaAI, Inc.",
  address: "[Your registered business address]",
  jurisdiction: "[Your governing jurisdiction]",
};

// Tiny helpers so the content below stays readable.
const P = (text) => ({ type: "p", text });
const UL = (items) => ({ type: "ul", items }); // item = "text" or ["Bold title", "text"]
const TABLE = (head, rows) => ({ type: "table", head, rows });
const NOTE = (text) => ({ type: "note", text });

const LEGAL = {
  /* ------------------------------------------------------------------ */
  "privacy-policy": {
    icon: ShieldCheck,
    title: "Privacy Policy",
    tagline: `How ${COMPANY} collects, uses, shares and protects your information, and the choices you have.`,
    contact: C.privacy,
    sections: [
      {
        id: "introduction",
        title: "Introduction and scope",
        body: [
          P(`This Privacy Policy explains how ${C.entity} ("${COMPANY}", "we", "us") handles personal information when you use our website, AI products, AI tools, agents, APIs, documentation and community spaces (together, the "Services").`),
          P("By using the Services you acknowledge this Policy. If you do not agree with it, please do not use the Services. If you use the Services on behalf of an organization, you confirm you are authorized to do so."),
        ],
      },
      {
        id: "information-we-collect",
        title: "Information we collect",
        body: [
          P("We collect information in three ways: what you give us, what we collect automatically, and what we receive from others."),
          UL([
            ["Account information", "your name, email address, password (stored only as a salted hash), avatar and sign-in method (for example, Google)."],
            ["Content you provide", "prompts, messages, files, images, audio, documents, code and any other inputs you submit, together with the outputs generated for you."],
            ["Billing information", "plan, billing contact and transaction history. Card details are handled by our payment processor and are never stored on our servers."],
            ["Usage and device data", "pages viewed, features used, timestamps, IP address, approximate location, browser, operating system, device identifiers and crash or performance logs."],
            ["Communications", "messages you send to support, survey answers, community posts and newsletter preferences."],
            ["Information from partners", "limited profile data from identity providers you choose to sign in with, and fraud-prevention or analytics signals from our service providers."],
          ]),
        ],
      },
      {
        id: "how-we-use",
        title: "How we use information",
        body: [
          P("We use personal information to:"),
          UL([
            "provide, operate, maintain and personalize the Services, including generating AI responses for you;",
            "create and manage your account, authenticate you and process payments;",
            "monitor performance, debug problems and improve reliability, quality and safety;",
            "detect, investigate and prevent fraud, abuse, security incidents and violations of our Terms;",
            "send service messages, security alerts and, where permitted, product updates and marketing;",
            "comply with legal obligations and enforce our rights.",
          ]),
        ],
      },
      {
        id: "ai-content",
        title: "AI inputs, outputs and model training",
        body: [
          P("Your prompts, files and generated outputs are processed to deliver the Services to you. They may be passed to the AI model providers that power a feature, under contracts that restrict them from using your content for their own purposes."),
          UL([
            ["No training without permission", `we do not use your private content to train general-purpose models unless you opt in (for example, through a feedback or improvement setting).`],
            ["Human review", "limited, access-controlled review may occur to investigate abuse, resolve a support request you made, or meet legal requirements."],
            ["Your control", "you can delete conversations and files from your account; deletion follows the retention schedule below."],
          ]),
          NOTE("AI outputs can be inaccurate or incomplete. Please do not enter highly sensitive data (such as government ID numbers or health records) unless a feature is explicitly designed for it."),
        ],
      },
      {
        id: "legal-bases",
        title: "Legal bases for processing (EEA, UK)",
        body: [
          P("Where data protection law such as the GDPR applies, we rely on the following legal bases:"),
          UL([
            ["Contract", "to deliver the Services you requested and manage your account."],
            ["Legitimate interests", "to secure, analyze and improve the Services and prevent abuse, balanced against your rights."],
            ["Consent", "for optional cookies, marketing emails and opt-in model improvement. You can withdraw consent at any time."],
            ["Legal obligation", "to meet tax, accounting, sanctions and other legal requirements."],
          ]),
        ],
      },
      {
        id: "sharing",
        title: "How we share information",
        body: [
          P("We do not sell your personal information. We share it only in these situations:"),
          UL([
            ["Service providers", "cloud hosting, AI model providers, analytics, payment processing, customer support and email delivery, each bound by confidentiality and data-protection terms."],
            ["Legal and safety", "when required by law, or to protect the rights, property and safety of users, the public or us."],
            ["Business transfers", "in connection with a merger, acquisition, financing or sale of assets, with notice where required."],
            ["With your direction", "when you connect a third-party integration or share content with teammates or publicly."],
            ["Aggregated data", "de-identified or aggregated statistics that cannot reasonably identify you."],
          ]),
        ],
      },
      {
        id: "transfers",
        title: "International data transfers",
        body: [
          P("We and our providers may process information in countries other than your own. When we transfer personal data out of the EEA, UK or Switzerland, we use approved safeguards such as Standard Contractual Clauses and supplementary measures where needed."),
        ],
      },
      {
        id: "retention",
        title: "Data retention",
        body: [
          P("We keep personal information only as long as needed for the purposes described here, including legal, accounting and security requirements."),
          TABLE(
            ["Data", "Typical retention"],
            [
              ["Account details", "While your account is active, then up to 30 days after deletion"],
              ["Conversations, files and outputs", "Until you delete them; removed from active systems within 30 days"],
              ["Backups", "Overwritten on a rolling cycle, generally within 90 days"],
              ["Billing and tax records", "As required by law (commonly 7 years)"],
              ["Security and access logs", "Up to 12 months"],
            ]
          ),
        ],
      },
      {
        id: "your-rights",
        title: "Your rights and choices",
        body: [
          P("Depending on where you live, you may have the right to access, correct, delete, export or restrict the use of your personal information, to object to certain processing, to withdraw consent, and to not be discriminated against for exercising these rights."),
          UL([
            "Manage most of your data directly in your account settings.",
            `Email ${C.privacy} for any request. We respond within 30 days (or sooner where the law requires).`,
            "Unsubscribe from marketing at any time using the link in our emails.",
            "Residents of California and certain other US states may also opt out of the sale or sharing of personal data. We do not sell personal data.",
            "You may lodge a complaint with your local data protection authority.",
          ]),
          P("See our GDPR page for more detail on rights under European and UK law."),
        ],
      },
      {
        id: "children",
        title: "Children's privacy",
        body: [
          P(`The Services are not directed to children under 16 (or the minimum age in your country). We do not knowingly collect their data. If you believe a child has given us personal information, contact ${C.privacy} and we will delete it.`),
        ],
      },
      {
        id: "security",
        title: "How we protect information",
        body: [
          P("We use encryption in transit and at rest, strict access controls, monitoring and regular security testing. No system is perfectly secure, so we also encourage you to use a strong, unique password. Read more on our Security page."),
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        body: [
          P("We may update this Policy as our Services or the law change. When changes are material, we will notify you by email or in the product before they take effect. The date at the top of this page shows the latest revision."),
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  "terms-of-service": {
    icon: FileText,
    title: "Terms of Service",
    tagline: `The rules for using ${COMPANY}: your rights, your responsibilities and ours.`,
    contact: C.legal,
    sections: [
      {
        id: "acceptance",
        title: "Acceptance of terms",
        body: [
          P(`These Terms of Service ("Terms") are a binding agreement between you and ${C.entity} ("${COMPANY}", "we", "us"). By creating an account or using our Services you agree to them, along with our Privacy Policy and Cookie Policy.`),
          P("If you accept on behalf of a company or other entity, you confirm that you have authority to bind it, and \"you\" refers to that entity."),
        ],
      },
      {
        id: "eligibility",
        title: "Eligibility and accounts",
        body: [
          UL([
            "You must be at least 16 years old (or the age of digital consent in your country) and able to form a binding contract.",
            "Provide accurate registration details and keep them up to date.",
            "You are responsible for all activity under your account and for keeping your credentials secure. Tell us immediately about any unauthorized use.",
            "One person per account unless your plan explicitly allows team seats.",
          ]),
        ],
      },
      {
        id: "services",
        title: "Use of the Services",
        body: [
          P(`${COMPANY} provides AI chat, image, voice, document and code products, AI tools, agents and APIs. Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable right to use the Services for your personal or internal business purposes.`),
          P("Features may change, be limited or be discontinued. Beta and preview features are provided as-is and may be changed or withdrawn at any time."),
        ],
      },
      {
        id: "acceptable-use",
        title: "Acceptable use",
        body: [
          P("You agree not to, and not to help others to:"),
          UL([
            "break the law or infringe the rights of others, including intellectual property and privacy rights;",
            "generate or distribute malware, phishing, spam, fraud or deceptive impersonation;",
            "create content that sexualizes minors, promotes violence, harassment, hate or self-harm;",
            "attempt to extract model weights, reverse engineer or probe the Services beyond permitted testing;",
            "bypass rate limits, safety systems, authentication or access controls;",
            "use outputs to build a competing AI model without our written consent;",
            "use the Services for automated decisions with legal or similarly significant effects without appropriate human review;",
            "resell or sublicense the Services unless authorized in writing.",
          ]),
          P("We may investigate and take action, including removing content or suspending accounts, if we believe these rules are violated."),
        ],
      },
      {
        id: "your-content",
        title: "Your content and AI outputs",
        body: [
          P("You retain ownership of the content you submit (\"Input\"). As between you and us, you also own the output generated for you (\"Output\"), to the extent permitted by law and subject to these Terms."),
          P(`You grant ${COMPANY} a worldwide, limited license to host, process and display Input and Output solely to operate, secure and provide the Services to you. You are responsible for your Input and for having the rights needed to submit it.`),
          NOTE("Outputs may not be unique: similar prompts can produce similar results for different users. AI can be wrong, so verify important information before relying on it."),
        ],
      },
      {
        id: "intellectual-property",
        title: "Our intellectual property",
        body: [
          P(`The Services, including software, models, design, trademarks, logos and documentation, are owned by ${COMPANY} or its licensors and protected by law. These Terms give you no rights to them except the limited use right above. If you send feedback, you allow us to use it freely without obligation to you.`),
        ],
      },
      {
        id: "billing",
        title: "Plans, billing and refunds",
        body: [
          UL([
            ["Subscriptions", "paid plans renew automatically each billing period until cancelled. You can cancel any time in account settings; access continues until the end of the paid period."],
            ["Fees and taxes", "prices are shown at checkout and exclude applicable taxes unless stated."],
            ["Usage limits", "plans include limits on usage, credits or API calls. Overages may be billed or throttled as described in your plan."],
            ["Refunds", "except where required by law, fees are non-refundable. If you believe you were charged in error, contact support within 30 days."],
            ["Price changes", "we will give advance notice of price changes before your next renewal."],
          ]),
        ],
      },
      {
        id: "api-agents",
        title: "API, agents and integrations",
        body: [
          P("If you use our API or deploy agents that act on your behalf, you are responsible for the actions they take, the permissions you grant them, and compliance with the terms of any third-party services they connect to."),
          UL([
            "Keep API keys secret; you are liable for usage under your keys.",
            "Respect documented rate limits and usage policies.",
            "Review agent actions that send messages, change data or spend money, and enable human approval where appropriate.",
          ]),
        ],
      },
      {
        id: "third-party",
        title: "Third-party services",
        body: [
          P("The Services may link to or work with third-party products. We do not control them and are not responsible for their content, security or practices. Your use of them is governed by their own terms."),
        ],
      },
      {
        id: "disclaimers",
        title: "Disclaimers",
        body: [
          P("THE SERVICES ARE PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES OR OUTPUTS WILL BE UNINTERRUPTED, ERROR-FREE OR SECURE."),
          P("Outputs are not professional legal, medical, financial or other expert advice."),
        ],
      },
      {
        id: "liability",
        title: "Limitation of liability",
        body: [
          P(`TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${COMPANY.toUpperCase()} WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, DATA OR GOODWILL. OUR TOTAL LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICES WILL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM OR USD 100.`),
          P("Some jurisdictions do not allow certain limitations, so parts of this section may not apply to you."),
        ],
      },
      {
        id: "indemnification",
        title: "Indemnification",
        body: [
          P(`You will defend and indemnify ${COMPANY} and its team against claims, losses and expenses (including reasonable legal fees) arising from your Input, your misuse of the Services, or your violation of these Terms or applicable law.`),
        ],
      },
      {
        id: "termination",
        title: "Suspension and termination",
        body: [
          P("You may stop using the Services and delete your account at any time. We may suspend or terminate access if you breach these Terms, create risk or legal exposure, or if we discontinue the Services. Sections that by their nature should survive (ownership, disclaimers, liability, indemnity and disputes) will survive termination."),
        ],
      },
      {
        id: "governing-law",
        title: "Governing law and disputes",
        body: [
          P(`These Terms are governed by the laws of ${C.jurisdiction}, without regard to conflict-of-law rules. Courts in that jurisdiction have exclusive venue, except where mandatory consumer law gives you the right to bring claims in your home country. We encourage you to contact us first at ${C.legal} so we can try to resolve the issue informally.`),
        ],
      },
      {
        id: "changes",
        title: "Changes to these Terms",
        body: [
          P("We may update these Terms from time to time. If changes are material we will give reasonable notice. Continued use after the effective date means you accept the updated Terms."),
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  cookies: {
    icon: Cookie,
    title: "Cookie Policy",
    tagline: "What cookies and similar technologies we use, why we use them, and how to control them.",
    contact: C.privacy,
    sections: [
      {
        id: "what-are-cookies",
        title: "What are cookies?",
        body: [
          P("Cookies are small text files stored on your device when you visit a website. They help sites remember you, keep you signed in, and understand how the site is used. Similar technologies include local storage, session storage, pixels and SDKs, and we refer to all of them as \"cookies\" in this policy."),
        ],
      },
      {
        id: "how-we-use",
        title: "How we use cookies",
        body: [
          UL([
            "Keep you signed in and protect your account and forms from attacks.",
            "Remember your settings and choices, such as consent preferences.",
            "Measure traffic and feature usage so we can improve the product.",
            "Deliver and measure our own marketing, where you have allowed it.",
          ]),
        ],
      },
      {
        id: "categories",
        title: "Categories of cookies",
        body: [
          TABLE(
            ["Category", "Purpose", "Can you turn it off?"],
            [
              ["Strictly necessary", "Sign-in, security, load balancing and remembering your cookie choice. The Services cannot work without them.", "No"],
              ["Preferences", "Remember settings such as language and interface options.", "Yes"],
              ["Analytics", "Understand how visitors use the Services so we can improve them (aggregated and pseudonymous where possible).", "Yes"],
              ["Marketing", "Measure campaigns and show relevant content about " + COMPANY + ".", "Yes"],
            ]
          ),
        ],
      },
      {
        id: "cookie-list",
        title: "Cookies we set",
        body: [
          P("The table below shows typical cookies and storage keys. Exact names may change as the product evolves."),
          TABLE(
            ["Name", "Category", "Purpose", "Duration"],
            [
              ["nova_session", "Necessary", "Keeps you signed in", "Session / up to 30 days"],
              ["nova_csrf", "Necessary", "Protects forms against cross-site request forgery", "Session"],
              ["nova_consent", "Necessary", "Stores your cookie choices", "12 months"],
              ["nova_prefs", "Preferences", "Remembers interface settings", "12 months"],
              ["nova_analytics_id", "Analytics", "Pseudonymous visitor ID for usage statistics", "13 months"],
              ["nova_campaign", "Marketing", "Records the campaign that brought you to us", "90 days"],
            ]
          ),
        ],
      },
      {
        id: "third-party",
        title: "Third-party cookies",
        body: [
          P("Some cookies are set by providers that help us run the Services, such as analytics, payments, embedded media and sign-in providers. They process data under their own privacy policies. We only load non-essential third-party cookies after you consent where the law requires it."),
        ],
      },
      {
        id: "managing",
        title: "Managing your preferences",
        body: [
          UL([
            ["Cookie banner", "choose which categories to allow the first time you visit, and change your mind later through \"Cookie Settings\"."],
            ["Browser controls", "most browsers let you block or delete cookies. Blocking necessary cookies may stop sign-in and other features from working."],
            ["Opt-out tools", "you can use industry opt-out tools for interest-based advertising, where available in your region."],
          ]),
        ],
      },
      {
        id: "signals",
        title: "Do Not Track and Global Privacy Control",
        body: [
          P("Where required by law we honor opt-out preference signals such as Global Privacy Control. Because there is no common standard for the browser \"Do Not Track\" setting, we do not respond to it in other cases."),
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        body: [
          P("We may update this Cookie Policy when we change the cookies we use or the law changes. The date at the top of the page shows the latest version. For significant changes we will ask for your consent again where required."),
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  gdpr: {
    icon: Globe,
    title: "GDPR Compliance",
    tagline: `How ${COMPANY} meets its obligations under the EU and UK General Data Protection Regulation.`,
    contact: C.dpo,
    sections: [
      {
        id: "commitment",
        title: "Our commitment",
        body: [
          P(`${COMPANY} is committed to protecting the personal data of people in the European Economic Area (EEA), the United Kingdom and Switzerland. This page describes how we apply the GDPR, the UK GDPR and the Swiss FADP, and complements our Privacy Policy.`),
        ],
      },
      {
        id: "roles",
        title: "Our role: controller and processor",
        body: [
          UL([
            ["Controller", `for account, billing, website and usage data, ${C.entity} decides why and how personal data is processed.`],
            ["Processor", "when a business customer submits personal data of its own users or employees to the Services, we process it on that customer's behalf and under its instructions, as set out in our Data Processing Addendum (DPA)."],
          ]),
        ],
      },
      {
        id: "legal-bases",
        title: "Lawful bases",
        body: [
          P("We process personal data only where a lawful basis applies: performance of a contract, our legitimate interests (such as security and product improvement), your consent (for example, optional cookies and marketing), or a legal obligation. Where we rely on legitimate interests, we weigh them against your rights and freedoms."),
        ],
      },
      {
        id: "rights",
        title: "Your data subject rights",
        body: [
          UL([
            ["Access", "get a copy of the personal data we hold about you."],
            ["Rectification", "have inaccurate or incomplete data corrected."],
            ["Erasure", "ask us to delete your data (the \"right to be forgotten\") where grounds apply."],
            ["Restriction", "ask us to pause processing in certain circumstances."],
            ["Portability", "receive your data in a structured, machine-readable format and move it to another provider."],
            ["Objection", "object to processing based on legitimate interests or for direct marketing."],
            ["Withdraw consent", "at any time, without affecting earlier lawful processing."],
            ["Automated decisions", "not be subject to decisions based solely on automated processing that significantly affect you."],
          ]),
        ],
      },
      {
        id: "exercise",
        title: "How to exercise your rights",
        body: [
          P(`Email ${C.dpo} or use the privacy controls in your account. We may need to verify your identity first. We respond within one month, extendable by up to two further months for complex or numerous requests, and we will tell you if we do so. Requests are free unless they are manifestly unfounded or excessive.`),
        ],
      },
      {
        id: "transfers",
        title: "International transfers",
        body: [
          P("When personal data leaves the EEA, UK or Switzerland, we rely on adequacy decisions where available or on Standard Contractual Clauses (and the UK Addendum), together with transfer impact assessments and supplementary technical measures such as encryption."),
        ],
      },
      {
        id: "subprocessors",
        title: "Sub-processors",
        body: [
          P("We use carefully selected sub-processors for hosting, AI model inference, analytics, payments and support. Each is bound by written data-protection terms that are no less protective than ours. We keep a current list available on request and give business customers advance notice of new sub-processors so they can object."),
        ],
      },
      {
        id: "dpa",
        title: "Data Processing Addendum",
        body: [
          P(`Business customers can request a signed DPA by emailing ${C.legal}. It covers the subject matter and duration of processing, instructions, confidentiality, security measures, sub-processor controls, assistance with data subject requests, audits, and deletion or return of data at the end of the contract.`),
        ],
      },
      {
        id: "breach",
        title: "Personal data breaches",
        body: [
          P("We maintain an incident response process. If a breach is likely to put people's rights at risk, we notify the relevant supervisory authority within 72 hours of becoming aware, and affected individuals or customers without undue delay where required."),
        ],
      },
      {
        id: "protection-by-design",
        title: "Privacy by design and by default",
        body: [
          UL([
            "Data minimization: we collect only what each feature needs.",
            "Data protection impact assessments for higher-risk processing.",
            "Role-based access, encryption and logging around personal data.",
            "Defined retention periods with deletion processes.",
            "Regular staff privacy and security training.",
          ]),
        ],
      },
      {
        id: "dpo",
        title: "Data Protection Officer and complaints",
        body: [
          P(`Our privacy team can be reached at ${C.dpo}. You also have the right to lodge a complaint with your local supervisory authority, for example the authority in the EU country where you live or work, or the Information Commissioner's Office (ICO) in the UK. We would appreciate the chance to address your concern first.`),
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  security: {
    icon: Lock,
    title: "Security",
    tagline: `How we protect your data, your content and your agents across the ${COMPANY} platform.`,
    contact: C.security,
    sections: [
      {
        id: "overview",
        title: "Security overview",
        body: [
          P(`Security is built into every layer of ${COMPANY}. We apply defense in depth: strong infrastructure, encrypted data, least-privilege access, secure development, continuous monitoring and a tested incident response plan.`),
        ],
      },
      {
        id: "infrastructure",
        title: "Infrastructure security",
        body: [
          UL([
            "Hosted with leading cloud providers in certified, physically secured data centers.",
            "Network segmentation, firewalls and private networking between services.",
            "Separate production, staging and development environments.",
            "Hardened, regularly patched systems with infrastructure defined as code.",
            "DDoS protection and rate limiting at the edge.",
          ]),
        ],
      },
      {
        id: "encryption",
        title: "Encryption",
        body: [
          UL([
            ["In transit", "all traffic uses TLS 1.2 or higher, with HSTS enabled."],
            ["At rest", "databases, file storage and backups are encrypted with AES-256."],
            ["Secrets", "API keys, tokens and credentials are kept in a managed secrets vault and never in source code."],
            ["Passwords", "stored only as salted, slow-hash values; never in plain text."],
          ]),
        ],
      },
      {
        id: "access-control",
        title: "Access control and authentication",
        body: [
          UL([
            "Least-privilege, role-based access to production systems, reviewed regularly.",
            "Multi-factor authentication and single sign-on required for staff.",
            "Just-in-time access for sensitive operations, with full audit logging.",
            "Session protection, secure cookies and optional sign-in with trusted identity providers for customers.",
          ]),
        ],
      },
      {
        id: "application-security",
        title: "Application security",
        body: [
          UL([
            "Secure development lifecycle with peer code review for every change.",
            "Automated dependency, container and static-analysis scanning in CI.",
            "Protections against common web threats such as XSS, CSRF, injection and SSRF.",
            "Independent penetration tests and vulnerability assessments at least annually.",
            "Timely patching based on severity.",
          ]),
        ],
      },
      {
        id: "ai-safeguards",
        title: "AI-specific safeguards",
        body: [
          UL([
            ["Tenant isolation", "your prompts, files and outputs are logically separated from other customers'."],
            ["Provider controls", "model providers are bound by contracts that prohibit using your content for their own training."],
            ["Prompt injection defenses", "input and output filtering, content isolation and tool-use restrictions to reduce the risk of malicious instructions."],
            ["Agent permissions", "agents run with scoped, revocable permissions, and sensitive actions can require human approval."],
            ["Abuse monitoring", "automated systems detect misuse, with human review limited to what is necessary."],
          ]),
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring and incident response",
        body: [
          P("We centrally log and monitor systems around the clock, with alerts for suspicious activity. Our documented incident response plan covers detection, containment, investigation, remediation, customer communication and post-incident review. We notify affected customers without undue delay, and regulators within legally required time frames."),
        ],
      },
      {
        id: "continuity",
        title: "Backups and business continuity",
        body: [
          P("Data is backed up automatically across multiple availability zones, and restores are tested regularly. We design for high availability and maintain disaster recovery procedures with defined recovery time and recovery point objectives."),
        ],
      },
      {
        id: "people",
        title: "People and vendors",
        body: [
          UL([
            "Background checks where permitted by law and confidentiality agreements for all staff.",
            "Security and privacy training at onboarding and annually.",
            "Vendor risk assessments and contractual security requirements for all sub-processors.",
          ]),
        ],
      },
      {
        id: "compliance",
        title: "Compliance",
        body: [
          P(`Our program is aligned with widely recognized frameworks, including SOC 2, ISO/IEC 27001 and the GDPR. Contact ${C.security} to request our latest security documentation, a completed security questionnaire or a DPA.`),
          NOTE("Only claim certifications you currently hold. Edit this section to reflect your actual audit status."),
        ],
      },
      {
        id: "disclosure",
        title: "Responsible disclosure",
        body: [
          P(`If you believe you have found a vulnerability, please email ${C.security} with clear reproduction steps. We ask that you:`),
          UL([
            "give us reasonable time to investigate and fix the issue before disclosing it publicly;",
            "avoid accessing, changing or destroying data that is not yours, and avoid degrading the service;",
            "do not run social engineering, physical or denial-of-service attacks.",
          ]),
          P("We will acknowledge reports within 3 business days, keep you updated, and credit researchers who report in good faith when they wish."),
        ],
      },
      {
        id: "your-part",
        title: "Your part in keeping data safe",
        body: [
          UL([
            "Use a strong, unique password and enable multi-factor authentication where offered.",
            "Keep API keys private, rotate them regularly and never commit them to public repositories.",
            "Grant agents and integrations only the permissions they need.",
            "Report suspicious activity to us right away.",
          ]),
        ],
      },
    ],
  },
};

const ORDER = ["privacy-policy", "terms-of-service", "cookies", "gdpr", "security"];

/* ====================================================================== */
/* Motion helpers                                                          */
/* ====================================================================== */

const SPRING = { type: "spring", stiffness: 380, damping: 30 };

const BUBBLE_TONES = {
  blue: "radial-gradient(circle at 30% 28%, #ffffff 0%, #d4e3ff 24%, #6ea8ff 60%, #4f46e5 100%)",
  pink: "radial-gradient(circle at 30% 28%, #ffffff 0%, #fbd3ec 26%, #c084fc 64%, #7c3aed 100%)",
  cyan: "radial-gradient(circle at 30% 28%, #ffffff 0%, #c9f4ff 26%, #38bdf8 62%, #2563eb 100%)",
};

/** Glossy glass sphere that bobs up and down (same as Navbar/Footer). */
function Bubble({ size = 40, tone = "blue", delay = 0, bob = 7, className = "" }) {
  return (
    <motion.div
      aria-hidden
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: BUBBLE_TONES[tone],
        boxShadow: `inset -${size * 0.14}px -${size * 0.18}px ${size * 0.3}px rgba(60,40,200,0.35), 0 ${size * 0.3}px ${size * 0.6}px rgba(99,102,241,0.3)`,
      }}
      animate={{ y: [0, -12, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: bob, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ====================================================================== */
/* Content blocks                                                          */
/* ====================================================================== */

function Block({ block }) {
  if (block.type === "p") {
    return <p className="text-[14.5px] leading-relaxed text-gray-600">{block.text}</p>;
  }

  if (block.type === "ul") {
    return (
      <ul className="space-y-2.5">
        {block.items.map((item, i) => {
          const [title, text] = Array.isArray(item) ? item : [null, item];
          return (
            <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-gray-600">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-violet-500" />
              <span>
                {title && <strong className="font-semibold text-[#0f1030]">{title}: </strong>}
                {text}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  if (block.type === "table") {
    return (
      // wide tables scroll inside their own box so the page never scrolls sideways
      <div className="overflow-x-auto rounded-2xl border border-indigo-100 bg-white/70">
        <table className="w-full min-w-[34rem] text-left text-[13px]">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-50 to-violet-50">
              {block.head.map((h) => (
                <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri} className="border-t border-indigo-100/70 transition-colors hover:bg-indigo-50/40">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-3 leading-relaxed ${ci === 0 ? "font-semibold text-[#0f1030]" : "text-gray-600"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === "note") {
    return (
      <div className="flex gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 px-4 py-3.5">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-[11px] font-bold text-white">
          i
        </span>
        <p className="text-[13.5px] leading-relaxed text-[#2b2e4a]">{block.text}</p>
      </div>
    );
  }

  return null;
}

/* ====================================================================== */
/* Section card                                                            */
/* ====================================================================== */

function SectionCard({ section, index }) {
  return (
    <motion.section
      id={section.id}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, ease: EASE }}
      // scroll-mt keeps the heading clear of the fixed navbar when jumping
      className="relative scroll-mt-28 overflow-hidden rounded-3xl border border-white/90 bg-white/80 p-6 shadow-[0_24px_60px_-28px_rgba(79,70,229,0.4)] backdrop-blur-xl sm:p-8"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/90 to-transparent" />
        <span className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-violet-300/20 blur-2xl" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 px-2 text-[12px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,0.7)]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-[#0f1030] sm:text-[22px]">{section.title}</h2>
        </div>

        <div className="mt-5 space-y-4">
          {section.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ====================================================================== */
/* Table of contents (sticky on desktop)                                   */
/* ====================================================================== */

function Toc({ sections, activeId, onJump }) {
  return (
    <nav
      aria-label="On this page"
      className="rounded-3xl border border-white/90 bg-white/80 p-3 shadow-[0_24px_60px_-28px_rgba(79,70,229,0.4)] backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 px-2.5 pb-2 pt-1.5">
        <List className="h-3.5 w-3.5 text-indigo-500" />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">On this page</span>
      </div>

      <ul className="max-h-[calc(100vh-14rem)] space-y-0.5 overflow-y-auto pr-1">
        {sections.map((s, i) => {
          const isActive = activeId === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => onJump(e, s.id)}
                aria-current={isActive ? "true" : undefined}
                className={`relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  isActive ? "text-blue-600" : "text-[#2b2e4a] hover:text-indigo-600"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="toc-active"
                    transition={SPRING}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 ring-1 ring-indigo-100"
                  />
                )}
                <span className="relative w-5 shrink-0 text-[10.5px] font-bold text-indigo-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative leading-snug">{s.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ====================================================================== */
/* Hero                                                                    */
/* ====================================================================== */

function Hero({ page }) {
  const Icon = page.icon;
  return (
    <div className="relative mx-auto max-w-6xl px-4 sm:px-10 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/75 px-6 py-10 text-center shadow-[0_30px_80px_-30px_rgba(79,70,229,0.45)] backdrop-blur-xl sm:px-12 sm:py-14"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/90 to-transparent" />
          <span className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl" />
          <span className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-violet-300/30 blur-3xl" />
          <div className="absolute right-8 top-8 hidden sm:block">
            <Bubble size={34} tone="pink" bob={7} />
          </div>
          <div className="absolute bottom-8 left-10 hidden sm:block">
            <Bubble size={22} tone="cyan" bob={6} delay={0.5} />
          </div>
        </div>

        <div className="relative">
          <motion.span
            initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-[0_16px_34px_-10px_rgba(79,70,229,0.75)]"
          >
            <Icon className="h-7 w-7" />
          </motion.span>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">Legal</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0f1030] sm:text-5xl">
            {page.title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
              {page.title.split(" ").slice(-1)}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-500">{page.tagline}</p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border border-indigo-100 bg-white/90 px-4 py-2 text-[12px] font-medium text-[#2b2e4a] shadow-sm">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              Last updated: {LAST_UPDATED}
            </span>
            <span className="hidden h-3 w-px bg-indigo-100 sm:block" />
            <span>Effective: {EFFECTIVE}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ====================================================================== */
/* Contact + related pages                                                 */
/* ====================================================================== */

function ContactCard({ page }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-600 p-6 text-white shadow-[0_24px_60px_-20px_rgba(79,70,229,0.7)] sm:p-8"
    >
      <span aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-1/2 rounded-b-full bg-gradient-to-b from-white/25 to-transparent" />
      <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Questions about this page?</h2>
          <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-white/85">
            Our team is happy to help. Reach out and we will get back to you as soon as possible.
          </p>
          <p className="mt-3 text-[12px] text-white/70">
            {C.entity} &middot; {C.address}
          </p>
        </div>
        <motion.a
          href={`mailto:${page.contact}`}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-[#1b1b3a] shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-500"
        >
          <Mail className="h-4 w-4 text-indigo-500" />
          {page.contact}
        </motion.a>
      </div>
    </motion.div>
  );
}

function RelatedPages({ currentSlug }) {
  const others = ORDER.filter((s) => s !== currentSlug);
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-sky-400 to-violet-500" />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">More legal pages</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {others.map((slug, i) => {
          const p = LEGAL[slug];
          const Icon = p.icon;
          return (
            <motion.a
              key={slug}
              href={`/${slug}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group/item flex items-center gap-3 rounded-2xl border border-white/90 bg-white/80 px-4 py-3.5 shadow-[0_14px_34px_-18px_rgba(79,70,229,0.4)] outline-none backdrop-blur-md transition-shadow hover:shadow-[0_22px_44px_-16px_rgba(79,70,229,0.5)] focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-sm transition-transform duration-700 group-hover/item:[transform:perspective(300px)_rotateY(360deg)]">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold leading-tight text-[#0f1030]">{p.title}</span>
                <span className="mt-0.5 block truncate text-[11.5px] text-gray-500">{p.tagline}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 -translate-x-1 text-indigo-500 opacity-0 transition-all duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100" />
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Page                                                                    */
/* ====================================================================== */

export default function LegalPage({ slug }) {
  const page = LEGAL[slug];
  const [activeId, setActiveId] = useState(page?.sections[0]?.id ?? null);

  // highlight the section currently in view
  useEffect(() => {
    if (!page) return;
    setActiveId(page.sections[0].id);
    const els = page.sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActiveId(en.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [page]);

  // smooth jump that also updates the URL hash
  const jump = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  if (!page) return notFound();

  return (
    <MotionConfig reducedMotion="user">
      {SHOW_NAVBAR && <NavbarSlot />}

      <main className="relative isolate overflow-hidden bg-gradient-to-b from-[#f7f6ff] to-[#eef2ff] pb-20 pt-28 sm:pt-32">
        {/* soft background blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute -right-28 top-64 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
        </div>

        <Hero page={page} />

        <div className="mx-auto mt-10 grid max-w-6xl gap-8 px-4 sm:px-10 lg:grid-cols-[17rem_1fr] lg:gap-10 lg:px-16">
          {/* sticky table of contents */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Toc sections={page.sections} activeId={activeId} onJump={jump} />
          </aside>

          {/* content */}
          <div className="min-w-0 space-y-5">
            {page.sections.map((s, i) => (
              <SectionCard key={s.id} section={s} index={i} />
            ))}

            <ContactCard page={page} />
            <RelatedPages currentSlug={slug} />

            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-indigo-600 transition-colors hover:text-blue-600"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back to home
            </a>
          </div>
        </div>
      </main>

      {SHOW_FOOTER && <Footer />}
    </MotionConfig>
  );
}

/**
 * Optional: only used when SHOW_NAVBAR is true. Imported lazily so the file
 * works even if you never turn it on.
 */
function NavbarSlot() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Navbar = require("./Navbar").default;
  return <Navbar />;
}