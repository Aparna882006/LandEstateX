/**
 * BrokerManagementPage.jsx
 * /admin/brokers — placeholder until the Broker module (Prompt 8E) exists.
 * Once Broker.model.js + broker.controller.js land, replace this with a
 * table mirroring PropertyManagementPage.jsx: list, verify, suspend, delete.
 */

import DashboardLayout from "../../components/layout/DashboardLayout";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

export default function BrokerManagementPage() {
  return (
    <DashboardLayout title="Broker Management" links={ADMIN_NAV_LINKS}>
      <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-0 px-6 py-10 text-center">
        <p className="text-sm font-medium text-primary-900">
          Broker module not built yet
        </p>
        <p className="text-sm text-neutral-500 mt-1 max-w-md mx-auto">
          This page is wired into the sidebar and routing so it's ready to
          go — once Prompt 8E (Broker Dashboard, Trust Score, etc.) ships a
          Broker.model.js, mirror admin.property.controller.js here for
          list/verify/suspend/delete on brokers.
        </p>
      </div>
    </DashboardLayout>
  );
}
