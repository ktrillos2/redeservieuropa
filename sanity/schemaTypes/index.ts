import { type SchemaTypeDefinition } from 'sanity'
import generalInfo from './generalInfo'
import header, { menuGroup, menuLink, menuSeparator } from './header'
import hero from './hero'
import event from './event'
import tour from './tour'
import transfers from './transfers'
import toursSection from './toursSection'
import testimonialsSection, { testimonialItem } from './testimonialsSection'
import contactSection from './contactSection'
import footerSection, { footerColumn } from './footerSection'
import transfersSectionContent from './transfersSection'
import order from './order'
import whatsappTemplate from './whatsappTemplate'
import messageUser from './messageUser'
import translation from './translation'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    generalInfo,
    menuLink,
    menuGroup,
    menuSeparator,
    header,
    hero,
  event,
  tour,
  transfers,
  transfersSectionContent,
    toursSection,
    testimonialItem,
    testimonialsSection,
    contactSection,
    footerColumn,
    footerSection,
     order,
     whatsappTemplate,
     messageUser,
     translation,
  ],
}
