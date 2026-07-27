import AdminDashboard from "./AdminDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Vastrarupa Atelier Control Panel",
  description: "Manage product catalogs, view logistics ledger and handle promotion codes.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
