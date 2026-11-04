
import { Link } from 'react-router-dom';
import {
  FiTrendingUp,
  FiImage,
  FiBarChart2,
  FiMessageCircle,
  FiArrowUpRight,
  FiCpu,
  FiShield,
  FiTarget,
  FiLock,
} from 'react-icons/fi';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const AI_TOOLS = [
  {
    icon: FiTrendingUp,
    number: '01',
    title: 'AI Price Prediction',
    category: 'PRICE INTELLIGENCE',
    description:
      'Discover estimated property values using location, area, property type, bedrooms and other important property details.',
    action: 'Predict Property Price',
    to: '/price-prediction',
    access: 'Login required',
    featured: true,
  },
  {
    icon: FiImage,
    number: '02',
    title: 'AI Image Valuation',
    category: 'VISUAL INTELLIGENCE',
    description:
      'Analyse property photographs with AI-assisted valuation to gain additional insights into your property.',
    action: 'Analyse Property Image',
    to: '/image-valuation',
    access: 'Login required',
  },
  {
    icon: FiTarget,
    number: '03',
    title: 'AI Property Recommendations',
    category: 'PERSONALISED DISCOVERY',
    description:
      'Discover property suggestions based on your preferences, saved searches and property requirements.',
    action: 'View My Recommendations',
    to: '/dashboard',
    access: 'Buyer dashboard',
  },
  {
    icon: FiBarChart2,
    number: '04',
    title: 'AI Investment Analytics',
    category: 'INVESTMENT INTELLIGENCE',
    description:
      'Evaluate rental yield, expenses, projected value, ROI and investment risk before making property decisions.',
    action: 'Explore Investment Properties',
    to: '/properties?purpose=invest',
    access: 'Property details',
  },
  {
    icon: FiShield,
    number: '05',
    title: 'AI Fraud Detection',
    category: 'TRUST & SECURITY',
    description:
      'Help administrators identify suspicious property listings, review risk indicators and manage fraud reports.',
    action: 'Open Fraud Detection',
    to: '/admin/fraud',
    access: 'Admin only',
    adminOnly: true,
  },
];

const AIToolsPage = () => {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F7F6F2] pt-28 pb-20">
        {/* HERO */}
        <section className="relative mx-auto max-w-7xl overflow-hidden px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#101F3C] via-[#172D50] to-[#263B5B] px-7 py-16 text-center shadow-2xl shadow-[#101F3C]/15 md:px-16 md:py-20">
            <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border border-[#D6B878]/20" />
            <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-[#D6B878]/20" />
            <div className="pointer-events-none absolute -bottom-36 -left-20 h-80 w-80 rounded-full bg-[#D6B878]/10 blur-3xl" />

            <div className="relative mx-auto max-w-3xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#D6B878]/40 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#E7D3A4] backdrop-blur-sm">
                <FiCpu size={16} />
                LandEstateX Intelligence Suite
              </div>

              <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                Real Estate Decisions,
                <span className="mt-2 block bg-gradient-to-r from-[#E7D3A4] via-[#D6B878] to-[#F4E8C9] bg-clip-text text-transparent">
                  Powered by Intelligence.
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
                Experience a smarter way to explore, evaluate and invest in
                real estate with intelligent tools designed for better
                property decisions.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/90">
                  06 Intelligent Features
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/90">
                  Smarter Property Insights
                </span>
                <span className="rounded-full border border-[#D6B878]/30 bg-[#D6B878]/10 px-4 py-2 text-xs font-medium text-[#E7D3A4]">
                  Built for Real Estate
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE INTRO */}
        <section className="mx-auto max-w-7xl px-6 pt-16">
          <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#A88745]">
                Explore Our Capabilities
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#101F3C] md:text-4xl">
                Intelligence for Every Decision
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                From property valuation to investment insights, explore the
                intelligence tools available across LandEstateX.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-[#A88745]">
              <FiCpu size={17} />
              <span>Discover smarter possibilities</span>
            </div>
          </div>

          {/* AI FEATURE GRID */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {AI_TOOLS.map((tool) => {
              const Icon = tool.icon;

              return (
                <article
                  key={tool.number}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                    tool.featured
                      ? 'border-[#D6B878]/60 shadow-[#D6B878]/10'
                      : 'border-[#E8E3D8] hover:border-[#D6B878]/60'
                  }`}
                >
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl from-[#D6B878]/10 to-transparent transition-all duration-300 group-hover:scale-125" />

                  <div className="relative mb-8 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D6B878]/30 bg-gradient-to-br from-[#F8F2E5] to-[#EFE3C8] text-[#9C7937] shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <Icon size={25} strokeWidth={1.7} />
                    </div>

                    <span className="font-serif text-3xl text-[#D6B878]/60">
                      {tool.number}
                    </span>
                  </div>

                  <div className="relative mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold tracking-[0.18em] text-[#A88745]">
                      {tool.category}
                    </span>

                    {tool.adminOnly && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#D6B878]/50 bg-[#F8F2E5] px-2.5 py-1 text-[10px] font-bold text-[#80632D]">
                        <FiLock size={10} />
                        ADMIN ONLY
                      </span>
                    )}
                  </div>

                  <h3 className="relative mb-3 text-xl font-semibold text-[#101F3C] transition-colors group-hover:text-[#A88745]">
                    {tool.title}
                  </h3>

                  <p className="relative mb-7 flex-1 text-sm leading-7 text-slate-500">
                    {tool.description}
                  </p>

                  <div className="relative mb-5 flex items-center gap-2 border-t border-[#EEEAE1] pt-4 text-xs font-medium text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C6A45D]" />
                    {tool.access}
                  </div>

                  <Link
                    to={tool.to}
                    className="relative inline-flex w-full items-center justify-between rounded-xl border border-[#101F3C] bg-[#101F3C] px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-[#A88745] hover:bg-[#A88745]"
                  >
                    {tool.action}
                    <FiArrowUpRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </Link>
                </article>
              );
            })}

            {/* CHATBOT FEATURE */}
            <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#D6B878]/50 bg-gradient-to-br from-[#142542] to-[#263B5B] p-7 shadow-lg shadow-[#101F3C]/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border border-[#D6B878]/20" />
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full border border-[#D6B878]/20" />

              <div className="relative mb-8 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D6B878]/40 bg-[#D6B878]/15 text-[#E7D3A4] transition-transform duration-300 group-hover:scale-110">
                  <FiMessageCircle size={25} strokeWidth={1.7} />
                </div>

                <span className="font-serif text-3xl text-[#D6B878]/60">
                  06
                </span>
              </div>

              <p className="relative mb-3 text-[10px] font-bold tracking-[0.18em] text-[#E7D3A4]">
                YOUR PERSONAL AI ASSISTANT
              </p>

              <h3 className="relative mb-3 text-xl font-semibold text-white">
                AI Real Estate Chatbot
              </h3>

              <p className="relative mb-7 flex-1 text-sm leading-7 text-slate-300">
                Have conversations about properties, valuations, real estate
                questions and property discovery with your AI assistant.
              </p>

              <div className="relative mb-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-medium text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D6B878]" />
                Available through the floating chat assistant
              </div>

              <div className="relative flex w-full items-center justify-between rounded-xl border border-[#D6B878]/50 bg-[#D6B878]/10 px-5 py-3.5 text-sm font-semibold text-[#F4E8C9]">
                Open the chat assistant
                <FiMessageCircle size={18} />
              </div>
            </article>
          </div>
        </section>

        {/* INFORMATION NOTE */}
        <section className="mx-auto mt-12 max-w-7xl px-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-[#E5D8BA] bg-[#F4EEDF] p-6 md:flex-row md:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8D9B7] text-[#80632D]">
              <FiShield size={21} />
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-[#101F3C]">
                Intelligent Insights. Informed Decisions.
              </h3>
              <p className="text-sm leading-7 text-[#71664F]">
                AI-generated estimates, valuations and investment analytics
                are intended for decision support only. They are not
                guaranteed property values, verified transaction prices or
                financial advice. Certain tools require login or specific
                account roles. Fraud Detection is restricted to administrators.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AIToolsPage;
