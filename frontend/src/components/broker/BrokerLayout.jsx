import { useState } from "react";
import { Outlet } from "react-router-dom";
import BrokerSidebar from "./BrokerSidebar";
import BrokerTopbar from "./BrokerTopbar";

export default function BrokerLayout({ title = "Broker Portal" }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <BrokerSidebar />

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-neutral-900/40" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-neutral-0">
            <BrokerSidebar />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <BrokerTopbar title={title} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
