import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTrendingUp,
  FiShield,
  FiImage,
  FiBarChart2,
  FiMessageCircle,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUpRight,
  FiCheckCircle,
  FiHome,
  FiMapPin,
  FiStar,
} from 'react-icons/fi';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import SectionHeading from '../../components/common/SectionHeading';
import Badge from '../../components/common/Badge';
import PropertyCard from '../../components/property/PropertyCard';
import AISearchBar from '../../components/property/AISearchBar';
import { useInView } from '../../hooks/useInView';

/* --------------------------------------------------
   FEATURED PROPERTIES
-------------------------------------------------- */

const FEATURED_PROPERTIES = [
  {
    id: 1,
    title: '3BHK Modern Apartment',
    location: 'Gomti Nagar, Lucknow',
    price: 5800000,
    aiPredictedPrice: 5700000,
    type: 'Apartment',
    bedrooms: 3,
    area: 1250,
    brokerTrustScore: 4.8,
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 2,
    title: 'Luxury Villa with Garden',
    location: 'Indira Nagar, Lucknow',
    price: 12500000,
    aiPredictedPrice: 11800000,
    type: 'Villa',
    bedrooms: 4,
    area: 2800,
    brokerTrustScore: 4.6,
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 3,
    title: 'Premium Family Residence',
    location: 'Hazratganj, Lucknow',
    price: 4200000,
    aiPredictedPrice: 4150000,
    type: 'Apartment',
    bedrooms: 2,
    area: 950,
    brokerTrustScore: 4.9,
    image:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 4,
    title: 'Contemporary Luxury Home',
    location: 'Vibhuti Khand, Lucknow',
    price: 8900000,
    aiPredictedPrice: 8200000,
    type: 'Commercial',
    bedrooms: 0,
    area: 1800,
    brokerTrustScore: 4.5,
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=85',
  },
];

/* --------------------------------------------------
   WHY CHOOSE LANDESTATEX
-------------------------------------------------- */

const WHY_CHOOSE_FEATURES = [
  {
    icon: FiTrendingUp,
    title: 'AI Price Prediction',
    description:
      'Understand property value with AI-powered price estimates and make more confident buying decisions.',
    label: 'Smart valuation',
  },
  {
    icon: FiShield,
    title: 'Broker Trust Score',
    description:
      'Evaluate broker credibility through trust scores, verified profiles and review information.',
    label: 'Verified professionals',
  },
  {
    icon: FiImage,
    title: 'Image-Based Valuation',
    description:
      'Explore AI-assisted property image analysis to understand visual condition and quality.',
    label: 'Visual intelligence',
  },
  {
    icon: FiBarChart2,
    title: 'Investment Analytics',
    description:
      'Explore rental yield, ROI and projected returns to compare potential property investments.',
    label: 'Investment insights',
  },
  {
    icon: FiSearch,
    title: 'Fraud Detection',
    description:
      'Identify suspicious property listings with automated checks and risk indicators.',
    label: 'Safer discovery',
  },
  {
    icon: FiMessageCircle,
    title: 'AI Property Assistant',
    description:
      'Get help with property searches, price questions, EMI calculations and recommendations.',
    label: 'Always available',
  },
];

/* --------------------------------------------------
   HOW IT WORKS
-------------------------------------------------- */

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Discover properties',
    description:
      'Explore properties based on your location, budget and preferences.',
  },
  {
    step: '02',
    title: 'Make informed decisions',
    description:
      'Compare property prices, broker profiles and investment insights.',
  },
  {
    step: '03',
    title: 'Move forward confidently',
    description:
      'Schedule property visits, connect with brokers and manage your journey.',
  },
];

/* --------------------------------------------------
   TESTIMONIALS
-------------------------------------------------- */

const TESTIMONIALS = [
  {
    quote:
      'The AI price prediction helped me understand the asking price better and gave me more confidence during negotiations.',
    name: 'Ravi Kumar',
    role: 'Buyer, Lucknow',
    stat: 'AI-assisted property research',
  },
  {
    quote:
      'The broker profile and trust information makes it easier to understand who I am dealing with before scheduling a visit.',
    name: 'Amit Sharma',
    role: 'Real Estate Broker',
    stat: 'Verified broker profile',
  },
  {
    quote:
      'The investment analytics made comparing rental yield and potential returns much easier.',
    name: 'Priya Singh',
    role: 'Property Investor',
    stat: 'Investment analysis tools',
  },
];

/* --------------------------------------------------
   PLATFORM STATS
-------------------------------------------------- */

const STATS = [
  { value: '12,500+', label: 'Properties Listed', icon: FiHome },
  { value: '500+', label: 'Verified Brokers', icon: FiShield },
  { value: '₹1,200 Cr+', label: 'Property Value Analyzed', icon: FiTrendingUp },
  { value: '25', label: 'Cities', icon: FiMapPin },
];

/* --------------------------------------------------
   HERO SECTION
-------------------------------------------------- */

const HeroSection = () => (
  <section className="relative isolate overflow-hidden bg-[#f7f9fc]">

    {/* Background decoration */}
    <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 -left-40 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-100/50 blur-3xl" />

    <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-20 pt-20 lg:grid-cols-2 lg:pb-28 lg:pt-24">

      {/* Hero content */}
      <div className="relative z-10">

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          AI-powered real estate intelligence
        </div>

        <h1 className="mt-7 max-w-2xl text-4xl font-bold leading-[1.13] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
          Find the right property.
          <span className="mt-2 block text-primary-700">
            Invest with confidence.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-8 text-neutral-600 sm:text-lg">
          Discover properties, understand fair prices and explore
          investment opportunities with intelligent real estate tools
          built to make your decisions easier.
        </p>

        {/* Hero search */}
        <div className="mt-9 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl shadow-slate-200/60">
          <AISearchBar />
        </div>

        {/* Trust points */}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
          {[
            'AI-assisted price insights',
            'Verified broker profiles',
            'Smarter property discovery',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs font-medium text-neutral-600">
              <FiCheckCircle className="text-emerald-600" size={15} />
              {item}
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Button as={Link} to="/properties" size="lg">
            Explore Properties
            <FiArrowUpRight className="ml-2" />
          </Button>

          <Link
            to="/ai-tools"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-white"
          >
            Explore AI Tools
            <FiArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* Hero image */}
      <div className="relative mx-auto w-full max-w-xl lg:ml-auto">

        <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-100 via-white to-indigo-100 blur-xl" />

        <div className="relative overflow-hidden rounded-3xl border border-white bg-white p-3 shadow-2xl shadow-slate-300/50">

          <div className="relative overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=90"
              alt="Contemporary luxury residential property"
              className="h-[340px] w-full object-cover sm:h-[440px]"
              fetchPriority="high"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Discover better possibilities
              </p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                Your next address starts here.
              </h2>
            </div>
          </div>

        </div>

        {/* Floating AI card */}
        <div className="absolute -bottom-8 -left-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-xl sm:-left-10 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FiTrendingUp size={20} />
            </div>

            <div>
              <p className="text-xs font-medium text-neutral-500">
                AI Property Insights
              </p>
              <p className="mt-1 text-sm font-bold text-neutral-900">
                Smarter price decisions
              </p>
            </div>
          </div>
        </div>

        {/* Floating verified card */}
        <div className="absolute -right-2 top-8 hidden rounded-xl border border-neutral-100 bg-white px-4 py-3 shadow-xl sm:block">
          <div className="flex items-center gap-2">
            <FiShield className="text-emerald-600" size={18} />
            <span className="text-xs font-semibold text-neutral-800">
              Trust-focused discovery
            </span>
          </div>
        </div>

      </div>
    </div>
  </section>
);

/* --------------------------------------------------
   STATS SECTION
-------------------------------------------------- */

const StatsBar = () => (
  <section className="border-y border-neutral-200 bg-white py-10">
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
      {STATS.map((stat) => {
        const Icon = stat.icon;

        return (
          <div key={stat.label} className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <Icon size={19} />
            </div>

            <p className="text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
              {stat.value}
            </p>

            <p className="mt-2 text-xs font-medium text-neutral-500">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  </section>
);

/* --------------------------------------------------
   FEATURED PROPERTIES
-------------------------------------------------- */

const FeaturedPropertiesSection = () => {
  const [ref, isInView] = useInView();

  return (
    <section ref={ref} className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">

          <div>
            <Badge tone="accent">Curated opportunities</Badge>

            <div className="mt-4">
              <SectionHeading
                title="Explore featured properties"
                subtitle="Discover selected properties and compare opportunities with AI-powered insights."
                align="left"
              />
            </div>
          </div>

          <Button as={Link} to="/properties" variant="secondary" size="sm">
            View All Properties
            <FiArrowUpRight className="ml-2" />
          </Button>
        </div>

        <div
          className={`grid grid-cols-1 gap-6 transition-all duration-700 sm:grid-cols-2 lg:grid-cols-4 ${
            isInView
              ? 'translate-y-0 opacity-100'
              : 'translate-y-6 opacity-0'
          }`}
        >
          {FEATURED_PROPERTIES.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-900"
          >
            Explore all available properties
            <FiArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

/* --------------------------------------------------
   FEATURE CARDS
-------------------------------------------------- */

const WhyChooseFeatureCard = ({ feature, index }) => {
  const [ref, isInView] = useInView();
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 70}ms` }}
      className={`group rounded-2xl border border-neutral-200 bg-white p-7 transition-all duration-500 hover:-translate-y-2 hover:border-primary-200 hover:shadow-xl hover:shadow-slate-200/60 ${
        isInView
          ? 'translate-y-0 opacity-100'
          : 'translate-y-6 opacity-0'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition group-hover:bg-primary-700 group-hover:text-white">
          <Icon size={22} />
        </div>

        <FiArrowUpRight
          className="text-neutral-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary-700"
          size={20}
        />
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-primary-700">
        {feature.label}
      </p>

      <h3 className="mt-2 text-lg font-bold text-neutral-900">
        {feature.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-neutral-500">
        {feature.description}
      </p>
    </div>
  );
};

const WhyChooseSection = () => (
  <section className="bg-[#f7f9fc] py-20 sm:py-24">
    <div className="mx-auto max-w-7xl px-6">

      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="accent">The LandEstateX advantage</Badge>

        <div className="mt-4">
          <SectionHeading
            title="Real estate decisions, made smarter"
            subtitle="More than property listings. A connected platform for discovering, evaluating and managing real estate opportunities."
          />
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {WHY_CHOOSE_FEATURES.map((feature, index) => (
          <WhyChooseFeatureCard
            key={feature.title}
            feature={feature}
            index={index}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button as={Link} to="/ai-tools" variant="secondary">
          Explore All AI Tools
          <FiArrowUpRight className="ml-2" />
        </Button>
      </div>
    </div>
  </section>
);

/* --------------------------------------------------
   HOW IT WORKS
-------------------------------------------------- */

const HowItWorksStep = ({ item, index }) => {
  const [ref, isInView] = useInView();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 120}ms` }}
      className={`relative rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm transition-all duration-700 hover:-translate-y-1 hover:shadow-lg ${
        isInView
          ? 'translate-y-0 opacity-100'
          : 'translate-y-6 opacity-0'
      }`}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-2xl font-bold text-primary-700">
        {item.step}
      </div>

      <h3 className="mt-6 text-lg font-bold text-neutral-900">
        {item.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-neutral-500">
        {item.description}
      </p>
    </div>
  );
};

const HowItWorksSection = () => (
  <section className="bg-white py-20 sm:py-24">
    <div className="mx-auto max-w-7xl px-6">

      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="accent">Your journey, simplified</Badge>

        <div className="mt-4">
          <SectionHeading
            title="From discovery to decision"
            subtitle="A straightforward property journey supported by intelligent tools at every step."
          />
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((item, index) => (
          <HowItWorksStep
            key={item.step}
            item={item}
            index={index}
          />
        ))}
      </div>
    </div>
  </section>
);

/* --------------------------------------------------
   TESTIMONIALS
-------------------------------------------------- */

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const goTo = (direction) => {
    setActiveIndex((prev) => {
      const next = prev + direction;

      if (next < 0) {
        return TESTIMONIALS.length - 1;
      }

      return next % TESTIMONIALS.length;
    });
  };

  const testimonial = TESTIMONIALS[activeIndex];

  return (
    <section className="relative overflow-hidden bg-[#101f3c] py-20 sm:py-24">

      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">

        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
          <FiStar size={14} />
          Customer experiences
        </div>

        <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
          Built around better property decisions
        </h2>

        <div
          key={activeIndex}
          className="mt-10 animate-[fadeInUp_0.5s_ease-out]"
        >
          <div className="flex justify-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar key={star} size={17} fill="currentColor" />
            ))}
          </div>

          <blockquote className="mt-7 text-xl font-medium leading-relaxed text-white sm:text-2xl">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>

          <p className="mt-8 text-base font-bold text-white">
            {testimonial.name}
          </p>

          <p className="mt-1 text-sm text-blue-200">
            {testimonial.role}
          </p>

          <p className="mt-3 text-xs font-semibold text-emerald-300">
            {testimonial.stat}
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-5">

          <button
            type="button"
            onClick={() => goTo(-1)}
            aria-label="Previous testimonial"
            className="rounded-full border border-white/20 p-3 text-white transition hover:bg-white/10"
          >
            <FiChevronLeft size={19} />
          </button>

          <div className="flex gap-2">
            {TESTIMONIALS.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === activeIndex
                    ? 'w-7 bg-white'
                    : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(1)}
            aria-label="Next testimonial"
            className="rounded-full border border-white/20 p-3 text-white transition hover:bg-white/10"
          >
            <FiChevronRight size={19} />
          </button>

        </div>
      </div>
    </section>
  );
};

/* --------------------------------------------------
   FINAL CTA
-------------------------------------------------- */

const FinalCTASection = () => (
  <section className="bg-white px-6 py-20 sm:py-24">
    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary-700 px-7 py-16 text-center shadow-xl sm:px-14">

      <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border-[40px] border-white/5" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full border-[40px] border-white/5" />

      <div className="relative mx-auto max-w-2xl">

        <Badge tone="accent">Start your property journey</Badge>

        <h2 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-4xl">
          Your next property decision deserves better intelligence.
        </h2>

        <p className="mt-5 text-sm leading-7 text-blue-100 sm:text-base">
          Explore properties, discover useful insights and make
          more informed real estate decisions with LandEstateX.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button as={Link} to="/register" variant="accent" size="lg">
            Get Started Free
            <FiArrowUpRight className="ml-2" />
          </Button>

          <Link
            to="/properties"
            className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Browse Properties
          </Link>
        </div>

      </div>
    </div>
  </section>
);

/* --------------------------------------------------
   MAIN LANDING PAGE
-------------------------------------------------- */

const LandingPage = () => {
  useEffect(() => {
    document.title = 'LandEstateX | Intelligent Real Estate Platform';

    const metaDescription = document.querySelector(
      'meta[name="description"]'
    );

    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Discover properties, explore AI-powered price insights, evaluate brokers and make smarter real estate decisions with LandEstateX.'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <HeroSection />
        <StatsBar />
        <FeaturedPropertiesSection />
        <WhyChooseSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;