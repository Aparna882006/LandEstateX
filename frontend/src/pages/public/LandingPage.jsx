
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  FiSearch,
  FiMapPin,
  FiChevronDown,
  FiArrowUpRight,
  FiHeart,
  FiShield,
  FiTrendingUp,
  FiMessageCircle,
  FiBarChart2,
  FiImage,
  FiCheckCircle,
  FiHome,
  FiBriefcase,
  FiKey,
  FiMap,
  FiStar,
  FiChevronRight,
} from 'react-icons/fi';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

// --------------------------------------------------
// PROPERTY URL HELPER
// PropertyListingPage reads: purpose, type, location
// --------------------------------------------------

const getListingUrl = ({
  purpose = '',
  type = '',
  location = '',
  minPrice = '',
  maxPrice = '',
} = {}) => {
  const params = new URLSearchParams();

  if (purpose) params.set('purpose', purpose);
  if (type) params.set('type', type);
  if (location) params.set('location', location);
  if (minPrice) params.set('min_price', String(minPrice));
  if (maxPrice) params.set('max_price', String(maxPrice));

  return `/properties?${params.toString()}`;
};

// --------------------------------------------------
// PROPERTY CATEGORIES
// --------------------------------------------------

const CATEGORIES = [
  { label: 'Buy', icon: FiHome },
  { label: 'Rent', icon: FiKey },
  { label: 'PG', icon: FiHome },
  { label: 'Commercial', icon: FiBriefcase },
  { label: 'Plots', icon: FiMap },
  { label: 'Projects', icon: FiTrendingUp },
];

const CATEGORY_LINKS = {
  Buy: getListingUrl({ purpose: 'buy' }),

  Rent: getListingUrl({ purpose: 'rent' }),

  PG: getListingUrl({
    purpose: 'rent',
    location: 'PG',
  }),

  Commercial: getListingUrl({
    purpose: 'buy',
    type: 'commercial',
  }),

  Plots: getListingUrl({
    purpose: 'buy',
    type: 'plot',
  }),

  Projects: getListingUrl({
    purpose: 'buy',
    location: 'project',
  }),
};

// --------------------------------------------------
// CITIES
// --------------------------------------------------

const CITIES = [
  {
    name: 'Lucknow',
    subtitle: 'The City of Nawabs',
    count: 'Explore properties',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Kanpur',
    subtitle: 'A city of opportunities',
    count: 'Explore properties',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Noida',
    subtitle: 'Modern urban living',
    count: 'Explore properties',
    image:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Delhi NCR',
    subtitle: 'Live without limits',
    count: 'Explore properties',
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=700&q=85',
  },
];

// --------------------------------------------------
// FEATURED DEMO PROPERTIES
// --------------------------------------------------

const PROPERTIES = [
  {
    id: 1,
    title: 'Contemporary 3 BHK Residence',
    location: 'Gomti Nagar, Lucknow',
    price: '₹58 Lac',
    area: '1,250 sq.ft.',
    beds: '3 BHK',
    type: 'Apartment',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
    tag: 'FEATURED',
  },
  {
    id: 2,
    title: 'Private Luxury Villa',
    location: 'Indira Nagar, Lucknow',
    price: '₹1.25 Cr',
    area: '2,800 sq.ft.',
    beds: '4 BHK',
    type: 'Villa',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
    tag: 'PREMIUM',
  },
  {
    id: 3,
    title: 'Elegant Family Apartment',
    location: 'Hazratganj, Lucknow',
    price: '₹42 Lac',
    area: '950 sq.ft.',
    beds: '2 BHK',
    type: 'Apartment',
    image:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85',
    tag: 'POPULAR',
  },
  {
    id: 4,
    title: 'Modern Architectural Home',
    location: 'Vibhuti Khand, Lucknow',
    price: '₹89 Lac',
    area: '1,800 sq.ft.',
    beds: '3 BHK',
    type: 'Independent House',
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=85',
    tag: 'NEW',
  },
];

// --------------------------------------------------
// AI TOOLS
// --------------------------------------------------

const TOOLS = [
  {
    icon: FiTrendingUp,
    title: 'AI Price Prediction',
    description:
      'Understand property value with AI-assisted price estimates.',
    link: '/price-prediction',
  },
  {
    icon: FiImage,
    title: 'Image Valuation',
    description:
      'Explore visual property insights with image-based analysis.',
    link: '/image-valuation',
  },
  {
    icon: FiBarChart2,
    title: 'Investment Analytics',
    description:
      'Compare rental yield, ROI and potential investment returns.',
    link: '/ai-tools',
  },
  {
    icon: FiMessageCircle,
    title: 'AI Property Assistant',
    description:
      'Get assistance with property discovery and real estate questions.',
    link: '/ai-tools',
  },
];

// --------------------------------------------------
// QUICK PROPERTY SEARCHES
// --------------------------------------------------

const QUICK_LINKS = [
  {
    label: 'Flats in Lucknow',
    link: getListingUrl({
      purpose: 'buy',
      type: 'apartment',
      location: 'Lucknow',
    }),
  },
  {
    label: 'House for sale',
    link: getListingUrl({
      purpose: 'buy',
      location: 'house',
    }),
  },
  {
    label: 'Property in Gomti Nagar',
    link: getListingUrl({
      location: 'Gomti Nagar',
    }),
  },
  {
    label: 'Apartments in Kanpur',
    link: getListingUrl({
      purpose: 'buy',
      type: 'apartment',
      location: 'Kanpur',
    }),
  },
  {
    label: 'Plots for sale',
    link: getListingUrl({
      purpose: 'buy',
      type: 'plot',
    }),
  },
  {
    label: 'Commercial property',
    link: getListingUrl({
      purpose: 'buy',
      type: 'commercial',
    }),
  },
];

// --------------------------------------------------
// FEATURED PROPERTY CARD
// --------------------------------------------------

const PropertyListingCard = ({ property }) => {
  const [saved, setSaved] = useState(false);

  const propertyType =
    property.type === 'Apartment'
      ? 'apartment'
      : property.type === 'Villa'
        ? 'villa'
        : '';

  const propertyLink = getListingUrl({
    purpose: 'buy',
    type: propertyType,
    location: property.location,
  });

  return (
    <article className="group overflow-hidden border border-[#EAE9E5] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#C9B38C] hover:shadow-[0_16px_40px_rgba(30,35,40,0.09)]">
      <div className="relative h-[220px] overflow-hidden bg-[#F1F0EC]">
        <img
          src={property.image}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <span className="absolute left-4 top-4 bg-white px-3 py-1.5 text-[9px] font-bold tracking-[0.13em] text-[#33362F] shadow-sm">
          {property.tag}
        </span>

        <button
          type="button"
          onClick={() => setSaved(!saved)}
          aria-label="Save property"
          aria-pressed={saved}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#34362F] shadow-sm transition hover:text-red-500"
        >
          <FiHeart
            size={16}
            fill={saved ? 'currentColor' : 'none'}
          />
        </button>

        <span className="absolute bottom-4 left-4 bg-[#202B37]/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-white">
          {property.type}
        </span>
      </div>

      <div className="p-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-[#9A855E]">
          {property.location}
        </p>

        <h3 className="mt-2 line-clamp-1 text-[17px] font-semibold text-[#282D32]">
          {property.title}
        </h3>

        <div className="mt-5 flex items-center justify-between border-b border-[#EEEEEA] pb-4">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#92958F]">
              Asking price
            </p>

            <p className="mt-1 text-xl font-bold text-[#252A30]">
              {property.price}
            </p>
          </div>

          <Link
            to={propertyLink}
            className="flex h-9 w-9 items-center justify-center border border-[#E6E3DC] text-[#8C7854] transition hover:bg-[#F4F0E8]"
            aria-label={`Explore ${property.type} properties`}
          >
            <FiArrowUpRight size={17} />
          </Link>
        </div>

        <div className="flex gap-5 pt-4 text-[11px] text-[#747A7F]">
          <span>{property.beds}</span>
          <span>{property.area}</span>
        </div>
      </div>
    </article>
  );
};

// --------------------------------------------------
// SECTION TITLE
// --------------------------------------------------

const SectionTitle = ({
  eyebrow,
  title,
  description,
  action,
}) => (
  <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
    <div className="max-w-2xl">
      <p className="text-[10px] font-bold uppercase tracking-[0.23em] text-[#A58A5D]">
        {eyebrow}
      </p>

      <h2 className="mt-3 font-serif text-3xl font-normal leading-tight tracking-tight text-[#252A30] sm:text-4xl lg:text-[43px]">
        {title}
      </h2>

      {description && (
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#747A7F]">
          {description}
        </p>
      )}
    </div>

    {action && (
      <Link
        to={action.link}
        className="inline-flex shrink-0 items-center gap-3 border-b border-[#B99A63] pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#65563D] transition hover:text-[#A18451]"
      >
        {action.label}
        <FiArrowUpRight size={16} />
      </Link>
    )}
  </div>
);

// --------------------------------------------------
// LANDING PAGE
// --------------------------------------------------

const LandingPage = () => {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('Buy');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('Any Budget');

  useEffect(() => {
    document.title = 'LandEstateX | Find Your Perfect Property';

    const meta = document.querySelector(
      'meta[name="description"]'
    );

    if (meta) {
      meta.setAttribute(
        'content',
        'Discover properties for sale and rent with LandEstateX. Explore property listings, AI-assisted valuation, investment insights and broker information.'
      );
    }
  }, []);

  // ------------------------------------------------
  // PROPERTY SEARCH
  // ------------------------------------------------

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    const purpose =
      activeCategory === 'Rent' || activeCategory === 'PG'
        ? 'rent'
        : 'buy';

    params.set('purpose', purpose);

    if (activeCategory === 'Commercial') {
      params.set('type', 'commercial');
    } else if (activeCategory === 'Plots') {
      params.set('type', 'plot');
    }

    let searchLocation = location.trim();

    if (activeCategory === 'PG') {
      searchLocation = `PG ${searchLocation}`.trim();
    } else if (activeCategory === 'Projects') {
      searchLocation = `project ${searchLocation}`.trim();
    }

    if (searchLocation) {
      params.set('location', searchLocation);
    }

    const budgetRanges = {
      'Below 25 Lac': {
        max_price: 2500000,
      },
      '25-50 Lac': {
        min_price: 2500000,
        max_price: 5000000,
      },
      '50 Lac-1 Cr': {
        min_price: 5000000,
        max_price: 10000000,
      },
      '1-2 Cr': {
        min_price: 10000000,
        max_price: 20000000,
      },
      'Above 2 Cr': {
        min_price: 20000000,
      },
    };

    const selectedRange = budgetRanges[budget];

    if (selectedRange) {
      Object.entries(selectedRange).forEach(([key, value]) => {
        params.set(key, String(value));
      });
    }

    navigate(`/properties?${params.toString()}`);
  };

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------

  return (
    <div className="min-h-screen bg-white text-[#252A30]">
      <Navbar />

      <main>
        {/* HERO / SEARCH */}

        <section className="relative overflow-hidden bg-[#F5F4F0]">
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-14 sm:px-9 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-20">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 border border-[#DDD5C5] bg-white px-3 py-2 text-[9px] font-bold uppercase tracking-[0.17em] text-[#89734E]">
                <FiStar size={12} />
                A smarter way to find property
              </div>

              <h1 className="mt-7 max-w-2xl font-serif text-[42px] font-normal leading-[1.13] tracking-[-0.035em] text-[#252A30] sm:text-6xl lg:text-[66px]">
                Find a place that
                <span className="block italic text-[#9B8055]">
                  feels like yours.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-7 text-[#70767B] sm:text-base">
                Discover homes, explore opportunities and make informed
                property decisions with intelligent real estate insights.
              </p>

              <div className="mt-9 flex flex-wrap gap-5 text-[10px] font-semibold uppercase tracking-wider text-[#626A6E]">
                <span className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#A58A5D]" />
                  Property discovery
                </span>

                <span className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#A58A5D]" />
                  AI insights
                </span>
              </div>
            </div>

            <div className="relative min-h-[330px] sm:min-h-[430px]">
              <img
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=90"
                alt="Premium contemporary residential property"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-[#1D2429]/10" />

              <div className="absolute bottom-5 left-5 border-l-2 border-[#D3BC91] bg-white/95 px-5 py-4 sm:bottom-8 sm:left-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9B8055]">
                  LandEstateX selection
                </p>

                <p className="mt-1 font-serif text-xl text-[#292E31]">
                  Spaces. Stories. Possibilities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PROPERTY SEARCH */}

        <section className="relative z-10 px-4 sm:px-8">
          <div className="mx-auto -mt-2 max-w-6xl border border-[#E7E5DF] bg-white shadow-[0_14px_45px_rgba(34,40,44,0.09)]">
            <div className="flex overflow-x-auto border-b border-[#EAE8E2] px-3 sm:px-7">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const active =
                  activeCategory === category.label;

                return (
                  <button
                    type="button"
                    key={category.label}
                    onClick={() =>
                      setActiveCategory(category.label)
                    }
                    aria-pressed={active}
                    className={`flex shrink-0 items-center gap-2 border-b-[3px] px-4 py-5 text-[11px] font-bold transition sm:px-6 ${
                      active
                        ? 'border-[#A78B5B] text-[#806B47]'
                        : 'border-transparent text-[#777D80] hover:text-[#30363A]'
                    }`}
                  >
                    <Icon size={15} />
                    {category.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSearch} className="p-5 sm:p-7">
              <div className="grid gap-3 md:grid-cols-[1.5fr_0.9fr_auto]">
                <label className="flex min-h-[58px] items-center gap-3 border border-[#E6E5E0] bg-[#FBFAF8] px-4">
                  <FiMapPin
                    className="shrink-0 text-[#A58A5D]"
                    size={19}
                  />

                  <div className="min-w-0 flex-1">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-[#92958F]">
                      Location
                    </span>

                    <input
                      value={location}
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                      placeholder="Enter city, locality or project"
                      className="mt-1 w-full bg-transparent text-sm text-[#30363A] outline-none placeholder:text-[#A5A6A2]"
                    />
                  </div>
                </label>

                <label className="flex min-h-[58px] items-center gap-3 border border-[#E6E5E0] bg-[#FBFAF8] px-4">
                  <FiHome
                    className="shrink-0 text-[#A58A5D]"
                    size={19}
                  />

                  <div className="min-w-0 flex-1">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-[#92958F]">
                      Budget
                    </span>

                    <select
                      value={budget}
                      onChange={(event) =>
                        setBudget(event.target.value)
                      }
                      className="mt-1 w-full bg-transparent text-sm text-[#30363A] outline-none"
                    >
                      <option>Any Budget</option>
                      <option>Below 25 Lac</option>
                      <option>25-50 Lac</option>
                      <option>50 Lac-1 Cr</option>
                      <option>1-2 Cr</option>
                      <option>Above 2 Cr</option>
                    </select>
                  </div>

                  <FiChevronDown
                    className="text-[#99958D]"
                    size={15}
                  />
                </label>

                <button
                  type="submit"
                  className="flex min-h-[58px] items-center justify-center gap-3 bg-[#26333D] px-8 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#A58A5D]"
                >
                  <FiSearch size={17} />
                  Search
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-[#858A8D]">
                <span className="font-bold uppercase tracking-wider">
                  Popular:
                </span>

                {[
                  'Lucknow',
                  'Gomti Nagar',
                  'Kanpur',
                  'Noida',
                ].map((city) => (
                  <button
                    type="button"
                    key={city}
                    onClick={() => setLocation(city)}
                    className="transition hover:text-[#967B50]"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </section>

        {/* QUICK DISCOVERY */}

        <section className="px-5 pb-16 pt-20 sm:px-9 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Explore real estate"
              title="What are you looking for?"
              description="Choose a property category and start exploring opportunities that match your plans."
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;

                return (
                  <Link
                    key={category.label}
                    to={CATEGORY_LINKS[category.label]}
                    className="group border border-[#EAE9E4] bg-[#FAF9F6] px-4 py-7 text-center transition hover:border-[#C5AF86] hover:bg-white hover:shadow-md"
                  >
                    <Icon
                      size={25}
                      strokeWidth={1.4}
                      className="mx-auto text-[#A58A5D] transition-transform group-hover:-translate-y-1"
                    />

                    <p className="mt-4 text-[11px] font-bold text-[#343A3E]">
                      {category.label}
                    </p>

                    <p className="mt-2 text-[9px] text-[#92958F]">
                      Explore now
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURED PROPERTIES */}

        <section className="bg-[#F7F6F2] px-5 py-20 sm:px-9 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Handpicked for discovery"
              title="Properties worth exploring."
              description="Explore a selection of residential and commercial opportunities."
              action={{
                label: 'View all properties',
                link: '/properties',
              }}
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PROPERTIES.map((property) => (
                <PropertyListingCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/properties"
                className="inline-flex items-center gap-3 border border-[#C9B58F] bg-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#65563D] transition hover:bg-[#26333D] hover:text-white"
              >
                Explore all listings
                <FiArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* POPULAR CITIES */}

        <section className="px-5 py-20 sm:px-9 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Discover locations"
              title="Find your city. Find your place."
              description="Explore property opportunities across popular cities."
              action={{
                label: 'Explore properties',
                link: '/properties',
              }}
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {CITIES.map((city) => (
                <Link
                  key={city.name}
                  to={getListingUrl({
                    location: city.name,
                  })}
                  className="group relative h-[230px] overflow-hidden bg-[#E7E4DC] sm:h-[290px]"
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#111820]/90 via-[#111820]/10 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="text-[9px] uppercase tracking-[0.17em] text-white/70">
                      {city.subtitle}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <h3 className="font-serif text-2xl">
                        {city.name}
                      </h3>

                      <FiArrowUpRight
                        size={20}
                        className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </div>

                    <p className="mt-2 text-[10px] text-white/70">
                      {city.count}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* AI TOOLS */}

        <section className="bg-[#202B35] px-5 py-20 text-white sm:px-9 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.23em] text-[#D2B98D]">
                  The LandEstateX advantage
                </p>

                <h2 className="mt-5 font-serif text-4xl font-normal leading-tight sm:text-5xl">
                  Property discovery,
                  <span className="block italic text-[#D2B98D]">
                    made intelligent.
                  </span>
                </h2>

                <p className="mt-6 max-w-md text-sm leading-8 text-white/65">
                  Go beyond property listings. Explore AI-assisted
                  valuation, recommendations and investment tools
                  designed to support informed decisions.
                </p>

                <Link
                  to="/ai-tools"
                  className="mt-9 inline-flex items-center gap-3 bg-[#D2B98D] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#202B35] transition hover:bg-white"
                >
                  Explore AI tools
                  <FiArrowUpRight size={16} />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {TOOLS.map((tool, index) => {
                  const Icon = tool.icon;

                  return (
                    <Link
                      to={tool.link}
                      key={tool.title}
                      className="border border-white/10 bg-white/[0.04] p-6 transition hover:border-[#D2B98D]/60 hover:bg-white/[0.08]"
                    >
                      <div className="flex items-center justify-between">
                        <Icon
                          size={23}
                          className="text-[#D2B98D]"
                        />

                        <span className="font-serif text-sm italic text-white/35">
                          0{index + 1}
                        </span>
                      </div>

                      <h3 className="mt-7 font-serif text-xl">
                        {tool.title}
                      </h3>

                      <p className="mt-3 text-xs leading-6 text-white/55">
                        {tool.description}
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-[#D2B98D]">
                        Explore tool
                        <FiArrowUpRight size={13} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* TRUST SECTION */}

        <section className="px-5 py-20 sm:px-9 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Confidence at every step"
              title="A more informed property journey."
              description="Useful information and intelligent tools to help you navigate real estate with greater clarity."
            />

            <div className="grid gap-8 border-y border-[#EAE8E2] py-10 sm:grid-cols-3">
              <div>
                <FiShield
                  size={27}
                  className="text-[#A58A5D]"
                />

                <h3 className="mt-5 font-serif text-xl">
                  Broker transparency
                </h3>

                <p className="mt-3 text-xs leading-7 text-[#777D80]">
                  Review broker profiles, available information and trust indicators.
                </p>
              </div>

              <div>
                <FiTrendingUp
                  size={27}
                  className="text-[#A58A5D]"
                />

                <h3 className="mt-5 font-serif text-xl">
                  Market perspective
                </h3>

                <p className="mt-3 text-xs leading-7 text-[#777D80]">
                  Explore asking-price trends and available market snapshots.
                </p>
              </div>

              <div>
                <FiCheckCircle
                  size={27}
                  className="text-[#A58A5D]"
                />

                <h3 className="mt-5 font-serif text-xl">
                  Listing insights
                </h3>

                <p className="mt-3 text-xs leading-7 text-[#777D80]">
                  Access available listing details and automated risk indicators.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK LINKS */}

        <section className="bg-[#F7F6F2] px-5 py-16 sm:px-9 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A58A5D]">
              Explore more
            </p>

            <h2 className="mt-3 font-serif text-3xl text-[#252A30]">
              Popular property searches
            </h2>

            <div className="mt-7 flex flex-wrap gap-3">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.link}
                  className="border border-[#E0DDD5] bg-white px-4 py-3 text-[11px] text-[#60676B] transition hover:border-[#B99A63] hover:text-[#8B7046]"
                >
                  {item.label}
                  <FiChevronRight
                    className="ml-2 inline"
                    size={13}
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}

        <section className="bg-white px-5 py-20 sm:px-9 lg:px-16">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 border border-[#E6E1D6] bg-[#F5F2EB] p-8 sm:p-12 lg:flex-row lg:items-center lg:p-16">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A8055]">
                Your next chapter starts here
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-tight text-[#252A30] sm:text-5xl">
                Find the property.
                <span className="block italic text-[#9A8055]">
                  Discover the possibilities.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#737A7D]">
                Start exploring homes, investment opportunities and
                intelligent real estate insights with LandEstateX.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                to="/properties"
                className="inline-flex items-center gap-3 bg-[#26333D] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#A58A5D]"
              >
                Explore properties
                <FiArrowUpRight size={16} />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center border border-[#B9A783] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#62543D] transition hover:bg-white"
              >
                Join LandEstateX
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
