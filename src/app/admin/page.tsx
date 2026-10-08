import { InventoryManager } from "@/components/admin/inventory-manager";
import { LoginForm } from "@/components/admin/login-form";
import { isAdminAuthenticated } from "@/lib/auth";
import { listVehicles } from "@/lib/vehicles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administração", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    return (
      <section className="grid min-h-[65vh] place-items-center bg-[#f4f4f2] p-6">
        <LoginForm />
      </section>
    );
  }
  return <InventoryManager initialVehicles={await listVehicles()} />;
}
