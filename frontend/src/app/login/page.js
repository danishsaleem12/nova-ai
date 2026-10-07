// frontend/src/app/login/page.js

import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Log in — NovaAI",
  description: "Log in to your NovaAI account.",
};

const HEADING = [
  { text: "Welcome" },
  { text: "back" },
  { br: true },
  { text: "to" },
  { text: "NovaAI.", gradient: "from-blue-500 via-indigo-500 to-violet-500" },
];

export default function LoginPage() {
  return (
    <AuthShell
      badge="Welcome back"
      heading={HEADING}
      subtext="Pick up right where you left off. Your chats, creations and agents are waiting for you."
      cardTitle="Log in"
      cardText="Enter your details to continue."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}