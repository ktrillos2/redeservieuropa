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
  meetingPoint,
  shortInfo,
  description,
  gallery
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

export const TRANSFERS_QUERY = `
*[_type == "transfers" && _id == "transfers"][0]{
  _id,
  title,
  subtitle,
  routes[]{ from, to, price, description, duration, popular, icon },
  extraCharges[]{ icon, text, price },
  specials[]{ title, subtitle, price, icon, notes },
  footnote
}
`

export const TOURS_SECTION_QUERY = `
*[_type == "toursSection" && _id == "toursSection"][0]{
  _id,
  title,
  subtitle,
  footnote,
  cta
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
