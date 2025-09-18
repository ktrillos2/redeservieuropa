import { type SchemaTypeDefinition } from 'sanity'
import generalInfo from './generalInfo'
import header, { menuGroup, menuLink, menuSeparator } from './header'
import hero from './hero'
import event from './event'
import tour, { pricingItem } from './tour'
import transfers from './transfers'
import toursSection from './toursSection'
import testimonialsSection, { testimonialItem } from './testimonialsSection'
import contactSection from './contactSection'
import footerSection, { footerColumn } from './footerSection'
import transfersSectionContent from './transfersSection'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    generalInfo,
    menuLink,
    menuGroup,
    menuSeparator,
    header,
    hero,
  event,
    pricingItem,
  tour,
  transfers,
  transfersSectionContent,
    toursSection,
    testimonialItem,
    testimonialsSection,
    contactSection,
    footerColumn,
    footerSection,
  ],
}
