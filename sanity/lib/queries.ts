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
  bookingForm
}
`

export const EVENTS_FOR_HERO_QUERY = `
*[_type == "event" && isActive == true] | order(coalesce(order, 999) asc, _createdAt asc)[0...10]{
  _id,
  title,
  image,
  pricePerPerson,
  date,
  time,
  meetingPoint
}
`

export const TOURS_LIST_QUERY = `
*[_type == "tour" && isActive == true] | order(coalesce(order, 999) asc, _createdAt asc){
  _id,
  title,
  slug,
  description,
  duration,
  distance,
  mainImage,
}
`

export const TOUR_BY_SLUG_QUERY = `
*[_type == "tour" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  description,
  duration,
  distance,
  mainImage,
  gallery,
  features,
  included,
  basePrice,
  basePriceDay,
  basePriceNight,
  pricing,
  pricingP4,
  pricingP5,
  extraSections
}
`
