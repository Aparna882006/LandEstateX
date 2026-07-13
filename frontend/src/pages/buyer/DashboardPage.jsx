import { Link } from 'react-router-dom';
import { FiSearch, FiHeart, FiCalendar, FiTrendingUp, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

const QUICK_ACTIONS = [
  {
    icon: FiSearch,
    label: 'Search Properties',
    description: 'Find your next home or investment',
    to: '/properties',
  },
  {
    icon: FiHeart,
    label: 'Wishlist',
    description: 'View properties you have saved',
    to: '/wishlist',
  },
  {
    icon: FiCalendar,
    label: 'Appointments',
    description: 'Manage your site visits',
    to: '/appointments',
  },
  {
    icon: FiTrendingUp,
    label: 'Loan & EMI',
    description: 'Check eligibility and calculate EMI',
    to: '/loan-calculator',
  },
];

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-0">
      {/* Simple top bar for the dashboard shell */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-700 text-lg font-bold text-white">
              X
            </span>
            <span className="text-lg font-semibold text-neutral-900">LandEstateX</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">
              Hi, <span className="font-medium text-neutral-900">{user?.full_name}</span>
            </span>
            <Button variant="secondary" size="sm" onClick={logout}>
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Here&apos;s what&apos;s happening with your property journey.
          </p>
        </div>

        {/* Quick stats row */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Saved Properties', value: '0' },
            { label: 'Upcoming Visits', value: '0' },
            { label: 'Active Searches', value: '0' },
            { label: 'Account Status', value: user?.is_verified ? 'Verified' : 'Pending' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-neutral-200 bg-white p-4 text-center"
            >
              <p className="text-xl font-semibold text-primary-700">{stat.value}</p>
              <p className="mt-1 text-xs text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className="group rounded-lg border border-neutral-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-100 text-primary-700 transition group-hover:bg-primary-700 group-hover:text-white">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-neutral-900">{action.label}</h3>
                  <p className="mt-1 text-xs text-neutral-500">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Empty state — recommended properties (placeholder until Property module is built) */}
        <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <FiSearch size={20} />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-neutral-900">
            No recommendations yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-500">
            Start searching for properties to get personalized AI recommendations here.
          </p>
          <div className="mt-4">
            <Button as={Link} to="/properties" variant="primary" size="sm">
              Start Exploring Properties
            </Button>
          </div>
        </div>

        {/* AI Chat hint */}
        <div className="mt-10 flex items-center gap-3 rounded-lg border border-primary-100 bg-primary-100/40 p-4">
          <FiMessageCircle className="text-primary-700" size={20} />
          <p className="text-sm text-neutral-900">
            Have a question? Ask our AI assistant — it can help with price checks, EMI
            calculations, and property recommendations.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;