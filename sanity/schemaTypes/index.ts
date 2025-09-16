import { type SchemaTypeDefinition } from 'sanity'
import generalInfo from './generalInfo'
import header, { menuGroup, menuLink, menuSeparator } from './header'
import hero from './hero'
import event from './event'
import tour, { pricingItem } from './tour'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [generalInfo, menuLink, menuGroup, menuSeparator, header, hero, event, pricingItem, tour],
}
