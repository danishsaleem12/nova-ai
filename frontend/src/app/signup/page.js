// frontend/src/app/signup/page.js

import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export const metadata = {
  title: "Sign up — NovaAI",
  description: "Create your NovaAI account.",
};

const HEADING = [
  { text: "Start" },
  { text: "building" },
  { text: "with" },
  { br: true },
  { text: "AI", gradient: "from-blue-500 to-violet-600" },
  { text: "today.", gradient: "from-blue-500 via-indigo-500 to-fuchsia-500" },
];

export default function SignupPage() {
  return (
    <AuthShell
      badge="Create your account"
      heading={HEADING}
      subtext="Join NovaAI and get chat, image generation, writing, analysis and agents in one platform."
      cardTitle="Create account"
      cardText="It only takes a minute to get started."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}