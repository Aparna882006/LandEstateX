import { Link } from 'react-router-dom';
import {
  FiTrendingUp,
  FiImage,
  FiBarChart2,
  FiMessageCircle,
  FiArrowRight,
  FiCpu,
} from 'react-icons/fi';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const AI_TOOLS = [
  {
    icon: FiTrendingUp,
    title: 'AI Price Prediction',
    description:
      'Estimate property value using location, area, property type, bedrooms and other details.',
    action: 'Predict Property Price',
    to: '/price-prediction',
    tag: 'Price Intelligence',
  },
  {
    icon: FiImage,
    title: 'AI Image Valuation',
    description:
      'Submit property photos and details to get an AI-assisted image-based valuation.',
    action: 'Analyse Property Image',
    to: '/image-valuation',
    tag: 'Image Analysis',
  },
  {
    icon: FiBarChart2,
    title: 'Investment Analytics',
    description:
      'Explore rental yield, expenses, projected value, ROI and investment risk for sale properties.',
    action: 'Explore Properties',
    to: '/properties?purpose=invest',
    tag: 'Investment Insights',
  },
];

const AIToolsPage = () => {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 pt-28 pb-16">
        <section className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              <FiCpu />
              LandEstateX AI Suite
            </div>

            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Smarter Real Estate Decisions with AI
            </h1>

            <p className="text-base leading-7 text-slate-600 md:text-lg">
              Explore intelligent tools designed to help you evaluate
              properties, understand valuations and make informed
              investment decisions.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {AI_TOOLS.map((tool) => {
              const Icon = tool.icon;

              return (
                <article
                  key={tool.title}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon size={27} />
                  </div>

                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                    {tool.tag}
                  </p>

                  <h2 className="mb-3 text-xl font-bold text-slate-900">
                    {tool.title}
                  </h2>

                  <p className="mb-7 flex-1 text-sm leading-7 text-slate-600">
                    {tool.description}
                  </p>

                  <Link
                    to={tool.to}
                    className="inline-flex items-center justify-between rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    {tool.action}
                    <FiArrowRight />
                  </Link>
                </article>
              );
            })}

            <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <FiMessageCircle size={27} />
              </div>

              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-700">
                AI Assistant
              </p>

              <h2 className="mb-3 text-xl font-bold text-slate-900">
                AI Real Estate Chatbot
              </h2>

              <p className="flex-1 text-sm leading-7 text-slate-600">
                Ask questions about properties and real estate. Use the
                floating chat assistant available on the website.
              </p>

              <div className="mt-7 rounded-lg bg-violet-50 px-5 py-3 text-center text-sm font-semibold text-violet-800">
                Available through the chat icon
              </div>
            </article>
          </div>

          <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-900">
            <strong>Note:</strong> AI estimates and analytics are
            decision-support tools, not guaranteed property values or
            financial advice. Price prediction and image valuation require
            login. Investment Analytics is available on eligible property
            detail pages.
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AIToolsPage;
