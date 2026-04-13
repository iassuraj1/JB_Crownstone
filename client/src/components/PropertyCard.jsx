const PropertyCard = ({ property }) => {
  const { title, location, price, area, beds, baths, image, tag, description } = property;

  return (
    <div className="group card-hover overflow-hidden flex flex-col animate-fade-in">
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg mb-4 aspect-[4/3]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {tag && (
          <span className="absolute top-3 left-3 bg-gold text-black text-xs font-semibold px-2.5 py-1 rounded">
            {tag}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
          <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-base mb-2 leading-snug group-hover:text-gold transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-xs mb-4 leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-4 text-gray-500 text-xs mb-5 border-t border-dark-border pt-4">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {beds} Beds
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            {baths} Baths
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            {area} sqft
          </span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-xs text-gray-600 mb-0.5">Starting from</p>
            <p className="text-gold font-semibold text-lg">{price}</p>
          </div>
          <button
            id={`view-property-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="btn-outline-gold text-xs py-2 px-4"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
