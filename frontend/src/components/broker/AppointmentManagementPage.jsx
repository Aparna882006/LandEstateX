import DashboardLayout from "../layout/DashboardLayout";
import AppointmentCalendar from "./AppointmentCalendar";

const BROKER_LINKS = [
  {
    to: "/broker/dashboard",
    label: "Dashboard",
  },
  {
    to: "/broker/properties",
    label: "My Properties",
  },
  {
    to: "/broker/appointments",
    label: "Appointments",
  },
];

const AppointmentManagementPage = () => {
  return (
    <DashboardLayout
      title="Broker"
      links={BROKER_LINKS}
    >
      <div className="mx-auto max-w-7xl">
        <AppointmentCalendar />
      </div>
    </DashboardLayout>
  );
};

export default AppointmentManagementPage;