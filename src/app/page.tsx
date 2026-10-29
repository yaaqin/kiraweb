import { ToastProvider } from "@/components/admin/toast";
import { Landing } from "@/components/landing/landing";
import { getPublicCatalog } from "@/lib/catalog";

export default function Home() {
  // Not awaited: the catalog sections suspend on this promise and stream in.
  return (
    <ToastProvider>
      <Landing catalog={getPublicCatalog()} />
    </ToastProvider>
  );
}
