export const GENERAL_INFO_QUERY = `
*[_type == "generalInfo" && _id == "generalInfo"][0]{
  _id,
  siteTitle,
  siteSubtitle,
  description,
  logo,
  contact,
  defaultWhatsAppMessage,
  socialLinks
}
`

export const HERO_QUERY = `
*[_type == "hero" && _id == "hero"][0]{
  _id,
  title,
  highlight,
  description,
  backgroundImage,
  primaryCta,
  secondaryCta,
  bookingForm,
  translations
}
`

export const EVENTS_FOR_HERO_QUERY = `
*[_type in ["events","event"] && (isActive == true || !defined(isActive))] | order(coalesce(order, 999) asc, _createdAt asc)[0...10]{
  _id,
  title,
  image,
  pricePerPerson,
  date,
  time,
  meetingPoint,
  shortInfo,
  description,
  gallery,
  translations
}
`

export const TOURS_LIST_QUERY = `
  *[_type == "tour"] | order(orderRank asc, _createdAt desc){
  _id,
  title,
  "slug": slug.current,
  summary,
  mainImage,
  route{origin, destination, circuitName, roundTrip},
  pricingMode,
  pricingRules{ baseUpTo4EUR },
  pricingTable{ p4, p5, p6, p7, p8, extraFrom9 },
  booking{ startingPriceEUR },
  isPopular,
  requirements{ requireTime, requireFlightNumber },
  translations
}
`
export const TOUR_BY_SLUG_QUERY = `
*[_type == "tour" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  summary,
  description,
  mainImage,
  route{origin, destination, circuitName, roundTrip},
  features,
  includes,
  visitedPlaces,
  notes,
  amenities,
  pricingMode,
  pricingRules{ baseUpTo4EUR },
  pricingTable{ p4,p5,p6,p7,p8,extraFrom9 },
  booking{ startingPriceEUR },
  isPopular,
  orderRank,
  requirements{ requireTime, requireFlightNumber },
  translations
}
`

export const TRANSFERS_LIST_QUERY = `
*[_type == "transfers"] | order(coalesce(order, 999) asc, _createdAt asc) {
  _id,
  slug,
  from,
  to,
  briefInfo,
  description,
  duration,
  popular,
  order,

  // === Requerimientos de vuelo ===
  requireFlightInfo,
  requireFlightNumber,
  requireFlightTimes,

  // === Precios ===
  priceP4,
  priceP5,
  priceP6,
  priceP7,
  priceP8,
  
  translations
}
`;

export const TRANSFER_BY_SLUG_QUERY = `
*[_type == "transfers" && slug.current == $slug][0] {
  _id,
  slug,
  from,
  to,
  briefInfo,
  description,
  duration,
  popular,
  order,

  // === Requerimientos de vuelo ===
  requireFlightInfo,
  requireFlightNumber,
  requireFlightTimes,

  // === Precios ===
  priceP4,
  priceP5,
  priceP6,
  priceP7,
  priceP8,
  
  translations
}
`;

export const TRANSFERS_SECTION_CONTENT_QUERY = `
*[_type == "transfersSectionContent" && _id == "transfersSectionContent"][0]{
  _id,
  title,
  subtitle,
  highlight,
  footnote,
  cta{ label, href, internalHref },
  notes,
  extraCharges[]{ icon, text, price },
  translations
}
`

export const TOURS_SECTION_QUERY = `
*[_type == "toursSection" && _id == "toursSection"][0]{
  _id,
  title,
  subtitle,
  footnote,
  customQuote,
  additionalCharges,
  translations
}
`

export const TESTIMONIALS_SECTION_QUERY = `
*[_type == "testimonialsSection" && _id == "testimonialsSection"][0]{
  _id,
  title,
  subtitle,
  testimonials[]{
    name,
    location,
    rating,
    comment,
    service,
    avatar
  }
}
`

export const CONTACT_SECTION_QUERY = `
*[_type == "contactSection" && _id == "contactSection"][0]{
  _id,
  title,
  subtitle,
  formTitle,
  formNote,
  showWhatsAppButton
}
`

export const FOOTER_SECTION_QUERY = `
*[_type == "footerSection" && _id == "footerSection"][0]{
  _id,
  description,
  showStars,
  statsText,
  columns[]{
    title,
    links[]{ label, href, internalHref, external }
  },
  copyright
}
`
