import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PropertyCard from '../components/PropertyCard';
import Footer from '../components/Footer';

// Mock property data using our generated images
const properties = [
  {
    id: 1,
    title: 'The Residence at Palm Jumeirah',
    location: 'Palm Jumeirah, Dubai, UAE',
    price: 'AED 18,500,000',
    area: '8,200',
    beds: 5,
    baths: 6,
    image: '/p1.png',
    tag: 'Exclusive',
    description: 'An exquisite 5-bedroom villa with panoramic Gulf views, private beach access, and state-of-the-art smart home systems.'
  },
  {
    id: 2,
    title: 'Oceanus Beachfront Edition',
    location: 'Jumeirah Bay Island, Dubai',
    price: 'AED 9,200,000',
    area: '4,800',
    beds: 4,
    baths: 4,
    image: '/p2.png',
    tag: 'New Launch',
    description: 'Contemporary beachfront living with direct ocean access, infinity pool, and lush private gardens designed by award-winning architects.'
  },
  {
    id: 3,
    title: 'Crown Penthouse – Burj View',
    location: 'Downtown Dubai, UAE',
    price: 'AED 42,000,000',
    area: '12,500',
    beds: 6,
    baths: 7,
    image: '/p3.png',
    tag: 'Ultra Prime',
    description: 'The pinnacle of vertical living — a full-floor penthouse offering 360° skyline views, private elevator, and bespoke interior finishes.'
  },
  {
    id: 4,
    title: 'Silveroak Estate Villas',
    location: 'Mohammed Bin Rashid City, Dubai',
    price: 'AED 14,750,000',
    area: '6,400',
    beds: 5,
    baths: 5,
    image: '/p1.png',
    tag: 'Limited',
    description: 'Architectural masterpieces blending raw concrete and warm timber, surrounded by curated landscaping and private lagoon access.'
  },
  {
    id: 5,
    title: 'Aqua Marina Residences',
    location: 'Dubai Marina Walk, UAE',
    price: 'AED 6,800,000',
    area: '3,200',
    beds: 3,
    baths: 4,
    image: '/p2.png',
    tag: null,
    description: 'Premium waterfront apartments with sweeping marina vistas, rooftop amenities, and concierge-level services for discerning residents.'
  },
  {
    id: 6,
    title: 'The Belvedere Mansions',
    location: 'Emirates Hills, Dubai',
    price: 'AED 28,000,000',
    area: '9,800',
    beds: 7,
    baths: 8,
    image: '/p3.png',
    tag: 'Sold Out Soon',
    description: 'Sprawling Emirates Hills mansions with golf course frontage, resort-style pools and entertainment wings crafted for extraordinary lifestyles.'
  },
  {
    id: 7,
    title: 'Aria Sky Residences',
    location: 'Business Bay, Dubai',
    price: 'AED 5,400,000',
    area: '2,800',
    beds: 3,
    baths: 3,
    image: '/p1.png',
    tag: null,
    description: 'Modern duplex units with floor-to-ceiling glazing, private terraces and direct canal access in the heart of Business Bay.'
  },
  {
    id: 8,
    title: 'Horizon Crest Villas',
    location: 'Al Barari, Dubai',
    price: 'AED 11,200,000',
    area: '5,600',
    beds: 4,
    baths: 5,
    image: '/p2.png',
    tag: 'Eco Luxury',
    description: 'Nestled within 3 million square feet of botanical gardens, these sustainably designed villas offer serene luxury away from the urban hustle.'
  }
];

const stats = [
  { value: '₿ AED 2.4B+', label: 'Assets Under Management' },
  { value: '850+', label: 'Properties Sold' },
  { value: '14', label: 'Years of Excellence' },
  { value: '98%', label: 'Client Satisfaction' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero.png)' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/80 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-2xl animate-slide-up">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-[1px] bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Premier Real Estate</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-semibold text-white leading-[1.05] mb-6">
              Where Luxury
              <br />
              <span className="text-gold-gradient">Meets Legacy</span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-lg">
              Discover an exclusive portfolio of world-class properties — curated for those who demand nothing less than extraordinary.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#properties" className="btn-gold flex items-center gap-2">
                Explore Properties
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <Link to="/login" className="btn-outline-gold">
                Client Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-gray-600 text-xs tracking-wider">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold/40 to-transparent" />
        </div>
      </section>

      {/* ─── STATS STRIP ──────────────────────────────────────────── */}
      <section className="bg-dark-card border-y border-dark-border py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-gold font-display text-3xl font-semibold mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROPERTIES ───────────────────────────────────────────── */}
      <section id="properties" className="py-24 px-6 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-[1px] bg-gold/40" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Portfolio</span>
            <div className="w-12 h-[1px] bg-gold/40" />
          </div>
          <h2 className="font-display text-4xl text-white font-semibold mb-4">
            Featured Properties
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Handpicked residences and estates across the world's most coveted addresses
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {['All Properties', 'Villas', 'Penthouses', 'Residences', 'Waterfront'].map((filter, i) => (
            <button
              key={filter}
              id={`filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}
              className={`text-xs px-4 py-2 rounded-full border transition-all duration-200 ${
                i === 0
                  ? 'border-gold text-gold bg-gold/10'
                  : 'border-dark-border text-gray-500 hover:border-gold/40 hover:text-gray-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            id="load-more-properties"
            className="btn-outline-gold"
          >
            View All Properties
          </button>
        </div>
      </section>

      {/* ─── ABOUT / CTA SECTION ──────────────────────────────────── */}
      <section id="about" className="py-24 bg-dark-card border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-[1px] bg-gold" />
                <span className="text-gold text-xs tracking-[0.3em] uppercase">Our Story</span>
              </div>
              <h2 className="font-display text-4xl text-white font-semibold mb-6 leading-tight">
                A Legacy Built on{' '}
                <span className="text-gold-gradient">Excellence</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                JB Crownstone was founded with a singular vision: to redefine the standards of luxury real estate and private investment. For over a decade, we have served as the trusted partners to individuals who measure value not merely in price, but in permanence.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                Our exclusive portfolio spans the world's most prestigious addresses, from the golden shores of Dubai to private islands in the Maldives. Each property is meticulously curated, every transaction handled with absolute discretion.
              </p>
              <Link to="/login" className="btn-gold inline-flex items-center gap-2">
                Access Client Portal
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🏛️', title: 'Curated Portfolio', desc: 'Every property hand-selected by our expert committee' },
                { icon: '🔒', title: 'Absolute Discretion', desc: 'Client privacy is our highest commitment' },
                { icon: '📈', title: 'Private Investments', desc: 'Exclusive access to premium asset strategies' },
                { icon: '🌐', title: 'Global Reach', desc: 'Properties across 20+ premium destinations' },
              ].map((item, i) => (
                <div key={i} className="card border-dark-border hover:border-gold/20 transition-all duration-300">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="text-white text-sm font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
