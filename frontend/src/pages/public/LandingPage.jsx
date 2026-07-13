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
} from 'react-icons/fi';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import SectionHeading from '../../components/common/SectionHeading';
import Badge from '../../components/common/Badge';
import PropertyCard from '../../components/property/PropertyCard';
import AISearchBar from '../../components/property/AISearchBar';
import { useInView } from '../../hooks/useInView';

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
    image: 'https://picsum.photos/seed/property1/500/400',
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
    image: 'https://picsum.photos/seed/property2/500/400',
  },
  {
    id: 3,
    title: 'Cozy 2BHK Near Metro',
    location: 'Hazratganj, Lucknow',
    price: 4200000,
    aiPredictedPrice: 4150000,
    type: 'Apartment',
    bedrooms: 2,
    area: 950,
    brokerTrustScore: 4.9,
    image: 'https://picsum.photos/seed/property3/500/400',
  },
  {
    id: 4,
    title: 'Commercial Space, Prime Road',
    location: 'Vibhuti Khand, Lucknow',
    price: 8900000,
    aiPredictedPrice: 8200000,
    type: 'Commercial',
    bedrooms: 0,
    area: 1800,
    brokerTrustScore: 4.5,
    image: 'https://picsum.photos/seed/property4/500/400',
  },
];

const WHY_CHOOSE_FEATURES = [
  {
    icon: FiTrendingUp,
    title: 'AI Price Prediction',
    description: 'Know the fair market value before you buy — never overpay again.',
  },
  {
    icon: FiShield,
    title: 'Broker Trust Score',
    description: 'Every broker rated on real deals, response time, and verified reviews.',
  },
  {
    icon: FiImage,
    title: 'Image-Based Valuation',
    description: 'Our AI analyzes property photos to assess real condition and quality.',
  },
  {
    icon: FiBarChart2,
    title: 'Investment Analytics',
    description: 'Rental yield, ROI, and 5-year forecasts — for smarter investment calls.',
  },
  {
    icon: FiSearch,
    title: 'Verified Listings Only',
    description: 'Every listing is checked for fraud, duplicates, and fake documents.',
  },
  {
    icon: FiMessageCircle,
    title: 'AI Assistant',
    description: 'Ask anything — from EMI calculations to investment advice, instantly.',
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Search & Discover',
    description: 'Tell us your budget and preferences — our AI finds properties that actually match.',
  },
  {
    step: '02',
    title: 'Verify & Compare',
    description: 'Check AI price predictions, broker trust scores, and investment potential side by side.',
  },
  {
    step: '03',
    title: 'Book & Close',
    description: 'Schedule a visit, check loan eligibility, and close the deal — all in one place.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The AI price prediction showed me the seller was asking 8% over fair value. I used that to negotiate down and saved real money.',
    name: 'Ravi Kumar',
    role: 'Buyer, Lucknow',
    stat: 'Saved ₹3.2L using AI price prediction',
  },
  {
    quote:
      'As a broker, the trust score system actually helped me close more deals — buyers trust verified profiles more.',
    name: 'Amit Sharma',
    role: 'Broker, Lucknow',
    stat: '127 verified deals closed',
  },
  {
    quote:
      'The investment analytics made it easy to compare rental yield across three properties before deciding. Genuinely useful.',
    name: 'Priya Singh',
    role: 'Investor, Lucknow',
    stat: '5.9% rental yield achieved',
  },
];

const STATS = [
  { value: '12,500+', label: 'Properties Listed' },
  { value: '500+', label: 'Verified Brokers' },
  { value: '₹1,200 Cr+', label: 'Property Value Analyzed' },
  { value: '25', label: 'Cities' },
];

const HeroSection = () => (
  <section className="relative overflow-hidden bg-neutral-0 pb-20 pt-32 sm:pt-40">
    <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
      <div className="animate-[fadeInUp_0.8s_ease-out]">
        <Badge tone="accent">✨ AI-Powered Real Estate</Badge>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-neutral-900 sm:text-5xl">
          Know the real value <br className="hidden sm:block" />
          before you buy.
        </h1>
        <p className="mt-4 max-w-lg text-base text-neutral-500">
          LandEstateX uses AI to predict fair prices, verify brokers, and find your ideal
          property — so you never overpay again.
        </p>

        <div className="mt-8">
          <AISearchBar />
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Trusted by 10,000+ buyers · 500+ verified brokers · 25 cities
        </p>
      </div>

      <div className="relative hidden lg:block">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
          <img
            src="https://picsum.photos/seed/heromock/600/420"
            alt="Sample property"
            className="rounded-lg"
          />
          <div className="absolute -bottom-6 -left-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-md">
            <p className="text-xs text-neutral-500">AI Predicted Price</p>
            <p className="text-xl font-semibold text-success-600">₹52,00,000</p>
            <p className="text-xs text-success-600">5% below asking price</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FeaturedPropertiesSection = () => {
  const [ref, isInView] = useInView();

  return (
    <section ref={ref} className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Handpicked for you"
            title="Featured Properties"
            subtitle="AI-ranked listings with the best combination of price fairness and quality."
            align="left"
          />
          <Button as={Link} to="/properties" variant="secondary" size="sm">
            View All Properties
          </Button>
        </div>

        <div
          className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {FEATURED_PROPERTIES.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyChooseFeatureCard = ({ feature, index }) => {
  const [ref, isInView] = useInView();
  const Icon = feature.icon;
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`rounded-lg border border-neutral-200 bg-white p-6 transition-all duration-700 hover:-translate-y-1 hover:shadow-md ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-100 text-primary-700">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-neutral-900">{feature.title}</h3>
      <p className="mt-2 text-sm text-neutral-500">{feature.description}</p>
    </div>
  );
};

const WhyChooseSection = () => (
  <section className="bg-neutral-0 py-20">
    <div className="mx-auto max-w-7xl px-6">
      <SectionHeading
        eyebrow="Why LandEstateX"
        title="Real intelligence, not just listings"
        subtitle="Every feature is built to remove guesswork from your property decisions."
      />

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {WHY_CHOOSE_FEATURES.map((feature, index) => (
          <WhyChooseFeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </div>
  </section>
);

const HowItWorksStep = ({ item, index }) => {
  const [ref, isInView] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 120}ms` }}
      className={`relative text-center transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <span className="text-5xl font-semibold text-primary-100">{item.step}</span>
      <h3 className="mt-2 text-lg font-semibold text-neutral-900">{item.title}</h3>
      <p className="mt-2 text-sm text-neutral-500">{item.description}</p>
    </div>
  );
};

const HowItWorksSection = () => (
  <section className="bg-white py-20">
    <div className="mx-auto max-w-7xl px-6">
      <SectionHeading
        eyebrow="Simple process"
        title="How It Works"
        subtitle="From search to keys in hand — in three straightforward steps."
      />

      <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((item, index) => (
          <HowItWorksStep key={item.step} item={item} index={index} />
        ))}
      </div>
    </div>
  </section>
);

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
      if (next < 0) return TESTIMONIALS.length - 1;
      return next % TESTIMONIALS.length;
    });
  };

  const testimonial = TESTIMONIALS[activeIndex];

  return (
    <section className="bg-primary-900 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-accent-600">
          What our users say
        </span>

        <blockquote
          key={activeIndex}
          className="mt-6 animate-[fadeInUp_0.5s_ease-out] text-xl font-medium leading-relaxed text-white sm:text-2xl"
        >
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        <p className="mt-6 text-sm font-semibold text-white">{testimonial.name}</p>
        <p className="text-sm text-neutral-200/70">{testimonial.role}</p>
        <p className="mt-2 text-xs text-accent-600">{testimonial.stat}</p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goTo(-1)}
            aria-label="Previous testimonial"
            className="rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10"
          >
            <FiChevronLeft size={18} />
          </button>

          <div className="flex gap-2">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex ? 'w-6 bg-accent-600' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(1)}
            aria-label="Next testimonial"
            className="rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

const StatsBar = () => (
  <section className="border-y border-neutral-200 bg-white py-10">
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
      {STATS.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className="text-2xl font-semibold text-primary-700 sm:text-3xl">{stat.value}</p>
          <p className="mt-1 text-xs text-neutral-500">{stat.label}</p>
        </div>
      ))}
    </div>
  </section>
);

const FinalCTASection = () => (
  <section className="bg-primary-700 py-16">
    <div className="mx-auto max-w-3xl px-6 text-center">
      <h2 className="text-2xl font-semibold text-white sm:text-3xl">
        Make your next property move an intelligent one.
      </h2>
      <div className="mt-6">
        <Button as={Link} to="/register" variant="accent" size="lg">
          Sign Up Free
        </Button>
      </div>
    </div>
  </section>
);

const LandingPage = () => {
  useEffect(() => {
    document.title = 'LandEstateX — AI-Powered Real Estate Platform';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'LandEstateX uses AI to predict fair property prices, verify brokers, and help you make transparent, intelligent real estate decisions.'
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