// File: src/features/Dashboard/layouts/DashboardLayout.tsx

import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardTopbar from "../components/DashboardTopbar";
import { SidebarProvider } from "../context/SidebarContext";
import "../styles/dashboard-theme.css";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="seba-mesh-bg flex min-h-screen">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:px-10">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
