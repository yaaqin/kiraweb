import { AuthProvider } from "@/components/admin/auth-provider";
import { ToastProvider } from "@/components/admin/toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
