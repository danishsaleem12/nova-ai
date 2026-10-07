"use client";

/**
 * Footer section (single self-contained file).
 *
 * Usage in app/page.js:
 *   import Footer from "./components/Footer";
 *   <Footer />
 *
 * Needs: framer-motion, lucide-react, Tailwind.
 * All copy and links live in the DATA block below — edit them to match
 * your product. The logo, social marks, avatar stack and background wave
 * are all drawn from code, so no image files are needed.
 *
 * NOTE: Product / AI Tools / Agents / Resources links are the SAME routes
 * used in Navbar.js. Legal links point to /privacy-policy, /terms-of-service,
 * /cookies, /gdpr and /security — create these pages (or change the hrefs).
 */

import { useRef } from "react";
import { MotionConfig, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
// CHANGED: removed Building2 (Company column is gone), added Wand2 + Cpu for the new columns
// CHANGED (socials): added Mail + MessageCircle for the Email and WhatsApp icons
import { ArrowUpRight, BookOpen, Cpu, LayoutGrid, Mail, MessageCircle, ShieldCheck, Sparkles, Wand2 } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/* ====================================================================== */
/* DATA (edit me)                                                          */
/* ====================================================================== */

const BRAND = "NovaAI";
const DESCRIPTION =
    "The all-in-one AI platform that helps you create, automate, analyze and achieve more. Build the future with AI.";

// CHANGED (socials): your real contact details
const EMAIL = "mdanishsaleem52@gmail.com";
const WHATSAPP_NUMBER = "923186039286"; // country code + number, no "+" or spaces
const WHATSAPP_TEXT = "Hi Danish! I found your portfolio and I'd like to talk about a project.";
const LINKEDIN_URL = "https://www.linkedin.com/in/m-danish-489a8b259";
const GITHUB_URL = "https://github.com/danishsaleem12";

// CHANGED (socials): was ["x", "linkedin", "github", "youtube", "discord"]
const SOCIALS = [
    { platform: "linkedin", label: "LinkedIn", href: LINKEDIN_URL },
    { platform: "github", label: "GitHub", href: GITHUB_URL },
    {
        platform: "whatsapp",
        label: "WhatsApp",
        href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`,
    },
    {
        platform: "email",
        label: "Email",
        href: `mailto:${EMAIL}?subject=${encodeURIComponent("Project inquiry from your portfolio")}`,
    },
];

const TRUST_TEXT = "Trusted by 100,000+ creators, teams and businesses worldwide.";
const TRUST_HREF = "#signup";
const AVATAR_COUNT = 3;

// CHANGED: links are now { label, href } objects (they used to be plain strings)
// so every footer link goes to a real route, same as the Navbar menus.
const COLUMNS = [
    {
        title: "Product",
        icon: LayoutGrid,
        links: [
            { label: "AI Chat", href: "/product/ai-chat" },
            { label: "AI Image", href: "/product/ai-image" },
            { label: "AI Voice", href: "/product/ai-voice" },
            { label: "AI Documents", href: "/product/ai-documents" },
            { label: "AI Code", href: "/product/ai-code" },
        ],
    },
    {
        title: "AI Tools",
        icon: Wand2,
        links: [
            { label: "AI Writer", href: "/ai-tools/ai-writer" },
            { label: "Image Generator", href: "/ai-tools/image-generator" },
            { label: "Data Analyzer", href: "/ai-tools/data-analyzer" },
            { label: "Code Assistant", href: "/ai-tools/code-assistant" },
            { label: "AI Summarizer", href: "/ai-tools/ai-summarizer" },
        ],
    },
    {
        title: "Agents",
        icon: Cpu,
        links: [
            { label: "Research Agent", href: "/agents/research-agent" },
            { label: "Coding Agent", href: "/agents/coding-agent" },
            { label: "Marketing Agent", href: "/agents/marketing-agent" },
            { label: "Automation Agent", href: "/agents/automation-agent" },
            { label: "Custom Agents", href: "/agents/custom-agent" },
        ],
    },
    {
        title: "Resources",
        icon: BookOpen,
        links: [
            { label: "AI Blog", href: "/resources/ai-blog" },
            { label: "Documentation", href: "/resources/documentation" },
            { label: "API", href: "/resources/api" },
            { label: "Help Center", href: "/resources/help-center" },
            { label: "Community", href: "/resources/community" },
        ],
    },
    {
        title: "Legal",
        icon: ShieldCheck,
        links: [
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms of Service", href: "/terms-of-service" },
            { label: "Cookies", href: "/cookies" },
            { label: "GDPR", href: "/gdpr" },
            { label: "Security", href: "/security" },
        ],
    },
];

const COPYRIGHT = `© ${new Date().getFullYear()} ${BRAND}. All rights reserved.`;
const TAGLINE = "Smarter tools. A brighter tomorrow.";

/* ====================================================================== */
/* Motion helpers                                                          */
/* ====================================================================== */

const TILT_SPRING = { stiffness: 220, damping: 18 };

/** Small card that tilts toward the mouse and shows a moving glare. Used
 * for the social icons and the trust pill. */
function Tilt({ children, className = "", cardClassName = "", max = 10, lift = 4, scale = 1.06, glare = false, outerProps }) {
    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const hover = useMotionValue(0);
    const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), TILT_SPRING);
    const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), TILT_SPRING);
    const gx = useTransform(px, [-0.5, 0.5], [0, 100]);
    const gy = useTransform(py, [-0.5, 0.5], [0, 100]);
    const glareOpacity = useSpring(hover, { stiffness: 150, damping: 20 });
    const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.85), rgba(255,255,255,0) 55%)`;

    const onMove = (e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onEnter = (e) => {
        if (e.pointerType === "mouse") hover.set(1);
    };
    const onLeave = () => {
        px.set(0);
        py.set(0);
        hover.set(0);
    };

    return (
        <motion.div className={className} {...outerProps}>
            <motion.div
                onPointerMove={onMove}
                onPointerEnter={onEnter}
                onPointerLeave={onLeave}
                whileHover={{ y: -lift, scale }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                style={{ rotateX, rotateY, transformPerspective: 600, transformStyle: "preserve-3d" }}
                className={`relative ${cardClassName}`}
            >
                {children}
                {glare && (
                    <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-[inherit]"
                        style={{ background: glareBg, opacity: glareOpacity, mixBlendMode: "soft-light" }}
                    />
                )}
            </motion.div>
        </motion.div>
    );
}

/** Wrapper that shifts its content with the mouse, at a chosen depth. */
function ParallaxLayer({ mx, my, depth = 20, className = "", children }) {
    const x = useTransform(mx, [-1, 1], [-depth, depth]);
    const y = useTransform(my, [-1, 1], [-depth, depth]);
    return (
        <motion.div style={{ x, y }} className={className}>
            {children}
        </motion.div>
    );
}

/** Wrapper that gently pulls its content toward the cursor. */
function Magnetic({ children, strength = 0.3, className = "" }) {
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const x = useSpring(rawX, { stiffness: 240, damping: 14 });
    const y = useSpring(rawY, { stiffness: 240, damping: 14 });

    const onMove = (e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        rawX.set((e.clientX - (r.left + r.width / 2)) * strength);
        rawY.set((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
        rawX.set(0);
        rawY.set(0);
    };

    return (
        <motion.div onPointerMove={onMove} onPointerLeave={onLeave} style={{ x, y }} className={`inline-block ${className}`}>
            {children}
        </motion.div>
    );
}

const BUBBLE_TONES = {
    blue: "radial-gradient(circle at 30% 28%, #ffffff 0%, #d4e3ff 24%, #6ea8ff 60%, #4f46e5 100%)",
    pink: "radial-gradient(circle at 30% 28%, #ffffff 0%, #fbd3ec 26%, #c084fc 64%, #7c3aed 100%)",
    cyan: "radial-gradient(circle at 30% 28%, #ffffff 0%, #c9f4ff 26%, #38bdf8 62%, #2563eb 100%)",
};

/** Glossy glass sphere that bobs up and down, used as a corner accent. */
function Bubble({ size = 40, tone = "blue", delay = 0, bob = 7, className = "" }) {
    return (
        <motion.div
            className={`rounded-full ${className}`}
            style={{
                width: size,
                height: size,
                background: BUBBLE_TONES[tone],
                boxShadow: `inset -${size * 0.14}px -${size * 0.18}px ${size * 0.3}px rgba(60,40,200,0.35), 0 ${size * 0.3}px ${size * 0.6}px rgba(99,102,241,0.3)`,
            }}
            animate={{ y: [0, -14, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: bob, repeat: Infinity, ease: "easeInOut", delay }}
        />
    );
}

function Sparkle4({ className = "" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
            <path
                d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z"
                fill="currentColor"
            />
        </svg>
    );
}

/* ====================================================================== */
/* Background: soft blobs + a wave that sits along the bottom edge         */
/* ====================================================================== */

// Both wave states share the same path commands so Framer Motion can
// morph between them.
const WAVE = {
    from: "M0,120 C220,60 460,150 760,90 C1040,35 1260,110 1440,70 L1440,220 L0,220 Z",
    to: "M0,150 C240,100 480,140 760,80 C1020,26 1260,140 1440,100 L1440,220 L0,220 Z",
};

function FooterBackground({ mx, my }) {
    const sx = useTransform(mx, [-1, 1], [0, 100]);
    const sy = useTransform(my, [-1, 1], [0, 100]);
    const spotlight = useMotionTemplate`radial-gradient(480px circle at ${sx}% ${sy}%, rgba(129,140,248,0.12), transparent 62%)`;

    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div className="absolute inset-0" style={{ background: spotlight }} />

            <ParallaxLayer mx={mx} my={my} depth={16} className="absolute -left-20 -top-10">
                <div className="h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
            </ParallaxLayer>
            <ParallaxLayer mx={mx} my={my} depth={-22} className="absolute -right-24 top-0">
                <div className="h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
            </ParallaxLayer>

            {/* wave hugging the bottom edge */}
            <div className="absolute inset-x-0 bottom-0 h-40 opacity-90 sm:h-48">
                <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="h-full w-full">
                    <defs>
                        <linearGradient id="footer-wave" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#c7d2fe" stopOpacity="0.65" />
                            <stop offset="0.5" stopColor="#bae6fd" stopOpacity="0.55" />
                            <stop offset="1" stopColor="#e9d5ff" stopOpacity="0.65" />
                        </linearGradient>
                    </defs>
                    <motion.path
                        fill="url(#footer-wave)"
                        initial={{ d: WAVE.from }}
                        animate={{ d: [WAVE.from, WAVE.to, WAVE.from] }}
                        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
                    />
                </svg>
            </div>

            {/* corner sphere accent (bottom-left, like the reference image) */}
            <ParallaxLayer mx={mx} my={my} depth={14} className="absolute -bottom-4 left-4">
                <Bubble size={48} tone="blue" bob={8} />
            </ParallaxLayer>
            <ParallaxLayer mx={mx} my={my} depth={-10} className="absolute bottom-10 left-16">
                <Bubble size={16} tone="cyan" bob={6} delay={0.6} />
            </ParallaxLayer>
        </div>
    );
}

/* ====================================================================== */
/* Logo + brand line                                                       */
/* ====================================================================== */

function LogoMark({ className = "h-6 w-6" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
            <defs>
                <linearGradient id="footer-logo" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
            </defs>
            <path
                d="M12 1 C12.6 5.6 14.6 7.6 19 8 C14.6 8.4 12.6 10.4 12 15 C11.4 10.4 9.4 8.4 5 8 C9.4 7.6 11.4 5.6 12 1Z"
                fill="url(#footer-logo)"
            />
            <circle cx="19.5" cy="15.5" r="1.7" fill="url(#footer-logo)" />
        </svg>
    );
}

function BrandLockup() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2"
        >
            <motion.span whileHover={{ rotate: 12, scale: 1.1 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}>
                <LogoMark className="h-7 w-7" />
            </motion.span>
            <span className="text-lg font-extrabold tracking-tight text-[#0f1030]">
                Nova<span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">AI</span>
            </span>
        </motion.div>
    );
}

/* ====================================================================== */
/* Social icons                                                            */
/* ====================================================================== */

// CHANGED (socials): removed x / youtube / discord, added whatsapp + email
function SocialGlyph({ platform }) {
    switch (platform) {
        case "linkedin":
            return (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.45-2.16 2.96V21h-4V9Z" />
                </svg>
            );
        case "github":
            return (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                    <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.47c.52.1.72-.23.72-.5v-1.95c-2.94.64-3.56-1.27-3.56-1.27-.48-1.22-1.17-1.55-1.17-1.55-.96-.65.07-.64.07-.64 1.06.08 1.62 1.09 1.62 1.09.94 1.62 2.47 1.15 3.07.88.1-.68.37-1.15.67-1.42-2.35-.27-4.82-1.17-4.82-5.22 0-1.15.41-2.1 1.09-2.83-.11-.27-.47-1.35.1-2.81 0 0 .89-.28 2.91 1.08a10.1 10.1 0 0 1 5.3 0c2.02-1.36 2.91-1.08 2.91-1.08.57 1.46.21 2.54.1 2.81.68.73 1.09 1.68 1.09 2.83 0 4.06-2.48 4.95-4.84 5.21.38.33.72.97.72 1.96v2.9c0 .27.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z" />
                </svg>
            );
        case "whatsapp":
            return <MessageCircle className="h-3.5 w-3.5" aria-hidden />;
        case "email":
            return <Mail className="h-3.5 w-3.5" aria-hidden />;
        default:
            return null;
    }
}

// CHANGED (socials): takes a { platform, label, href } object and links to the real address
function SocialButton({ social, index }) {
    const isWeb = social.href.startsWith("http");
    return (
        <Tilt
            max={12}
            lift={3}
            scale={1.1}
            glare
            outerProps={{
                initial: { opacity: 0, y: 10, scale: 0.8 },
                whileInView: { opacity: 1, y: 0, scale: 1 },
                viewport: { once: true },
                transition: { duration: 0.4, delay: 0.15 + index * 0.06, ease: EASE },
            }}
            cardClassName="flex h-8 w-8 items-center justify-center rounded-xl border border-white/85 bg-white/75 text-gray-500 shadow-sm backdrop-blur-md transition-colors duration-300 hover:text-indigo-600 hover:border-indigo-100"
        >
            <a
                href={social.href}
                aria-label={social.label}
                target={isWeb ? "_blank" : undefined}
                rel={isWeb ? "noopener noreferrer" : undefined}
                className="flex h-full w-full items-center justify-center"
            >
                <SocialGlyph platform={social.platform} />
            </a>
        </Tilt>
    );
}

function SocialRow() {
    return (
        <div className="mt-4 flex items-center gap-2">
            {SOCIALS.map((s, i) => (
                <SocialButton key={s.platform} social={s} index={i} />
            ))}
        </div>
    );
}

/* ====================================================================== */
/* Trust pill (avatar stack + arrow)                                       */
/* ====================================================================== */

const AVATAR_TONES = [
    "from-amber-300 to-orange-400",
    "from-sky-300 to-blue-500",
    "from-fuchsia-300 to-purple-500",
];

function AvatarStack() {
    return (
        <div className="flex -space-x-2">
            {Array.from({ length: AVATAR_COUNT }).map((_, i) => (
                <span
                    key={i}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-[9px] font-bold text-white shadow-sm ${AVATAR_TONES[i % AVATAR_TONES.length]}`}
                >
                    {String.fromCharCode(65 + i)}
                </span>
            ))}
        </div>
    );
}

function TrustPill() {
    return (
        <Tilt
            max={4}
            lift={3}
            scale={1.015}
            outerProps={{
                initial: { opacity: 0, y: 12 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { duration: 0.55, delay: 0.35, ease: EASE },
            }}
            cardClassName="mt-5 flex max-w-xs items-center gap-2.5 rounded-2xl border border-white/85 bg-white/80 px-3 py-2.5 shadow-[0_14px_34px_-16px_rgba(79,70,229,0.4)] backdrop-blur-md"
        >
            <motion.span
                animate={{ rotate: [0, 12, -8, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white"
            >
                <Sparkles className="h-3 w-3" />
            </motion.span>
            <p className="flex-1 text-[10.5px] leading-snug text-gray-600">{TRUST_TEXT}</p>
            <AvatarStack />
            <Magnetic strength={0.2}>
                <motion.a
                    href={TRUST_HREF}
                    whileHover={{ scale: 1.12, rotate: -8 }}
                    whileTap={{ scale: 0.94 }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-md"
                >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </motion.a>
            </Magnetic>
        </Tilt>
    );
}

/* ====================================================================== */
/* Link columns                                                            */
/* ====================================================================== */

function ColumnHeading({ icon: Icon, title }) {
    return (
        <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-600 shadow-sm">
                <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="text-[13px] font-bold text-[#0f1030]">{title}</span>
        </div>
    );
}

// CHANGED: takes a { label, href } link object and uses the real href
// (it was a hard-coded "#" before).
function FooterLink({ link, index }) {
    return (
        <motion.li
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 + index * 0.05, ease: EASE }}
        >
            <motion.a
                href={link.href}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="inline-block text-[12.5px] text-gray-500 transition-colors duration-200 hover:text-indigo-600"
            >
                {link.label}
            </motion.a>
        </motion.li>
    );
}

function FooterColumn({ column, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, delay, ease: EASE }}
        >
            <ColumnHeading icon={column.icon} title={column.title} />
            <ul className="mt-4 space-y-2.5">
                {/* CHANGED: pass the whole link object, key by label */}
                {column.links.map((link, i) => (
                    <FooterLink key={link.label} link={link} index={i} />
                ))}
            </ul>
        </motion.div>
    );
}

/* ====================================================================== */
/* Bottom bar                                                              */
/* ====================================================================== */

function BottomBar() {
    return (
        <div className="mt-10 border-t border-indigo-100/70 pt-6">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-[12px] text-gray-500"
                >
                    {COPYRIGHT}
                </motion.p>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-indigo-500"
                >
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }}>
                        <Sparkle4 className="h-3 w-3" />
                    </motion.span>
                    {TAGLINE}
                </motion.p>
            </div>
        </div>
    );
}

/* ====================================================================== */
/* Section                                                                 */
/* ====================================================================== */

export default function Footer() {
    const sectionRef = useRef(null);
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
    const my = useSpring(rawY, { stiffness: 60, damping: 20 });

    const onMove = (e) => {
        if (e.pointerType !== "mouse" || !sectionRef.current) return;
        const r = sectionRef.current.getBoundingClientRect();
        rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
        rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    const onLeave = () => {
        rawX.set(0);
        rawY.set(0);
    };

    return (
        <MotionConfig reducedMotion="user">
            <footer
                ref={sectionRef}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                className="relative isolate overflow-hidden bg-gradient-to-b from-[#f7f6ff] to-[#eef2ff] pb-10 pt-16"
            >
                <FooterBackground mx={mx} my={my} />

                <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-14 lg:px-20">
                    {/* CHANGED: brand + 5 link columns (was brand + 4) */}
                    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1fr] lg:gap-6">
                        <div>
                            <BrandLockup />
                            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-gray-500">{DESCRIPTION}</p>
                            <SocialRow />
                            <TrustPill />
                        </div>

                        {COLUMNS.map((column, i) => (
                            <FooterColumn key={column.title} column={column} delay={0.1 + i * 0.08} />
                        ))}
                    </div>

                    <BottomBar />
                </div>
            </footer>
        </MotionConfig>
    );
}