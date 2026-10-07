// frontend/src/app/chat/layout.js

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ChatLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}