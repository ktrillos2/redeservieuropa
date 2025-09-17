import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      // Singleton for General Info
      S.listItem()
        .title('Información General')
        .id('generalInfo')
        .child(
          S.editor()
            .id('generalInfoEditor')
            .schemaType('generalInfo')
            .documentId('generalInfo')
        ),
      // Singleton Header
      S.listItem()
        .title('Header')
        .id('header')
        .child(
          S.editor()
            .id('headerEditor')
            .schemaType('header')
            .documentId('header')
        ),
      // Singleton Transfers
      S.listItem()
        .title('Traslados')
        .id('transfers')
        .child(
          S.editor()
            .id('transfersEditor')
            .schemaType('transfers')
            .documentId('transfers')
        ),
      // Singleton Tours Section
      S.listItem()
        .title('Sección: Nuestros Tours')
        .id('toursSection')
        .child(
          S.editor()
            .id('toursSectionEditor')
            .schemaType('toursSection')
            .documentId('toursSection')
        ),
      // Singleton Testimonials Section
      S.listItem()
        .title('Sección: Testimonios')
        .id('testimonialsSection')
        .child(
          S.editor()
            .id('testimonialsSectionEditor')
            .schemaType('testimonialsSection')
            .documentId('testimonialsSection')
        ),
      // Singleton Contact Section
      S.listItem()
        .title('Sección: Contáctanos')
        .id('contactSection')
        .child(
          S.editor()
            .id('contactSectionEditor')
            .schemaType('contactSection')
            .documentId('contactSection')
        ),
      // Singleton Footer Section
      S.listItem()
        .title('Sección: Footer')
        .id('footerSection')
        .child(
          S.editor()
            .id('footerSectionEditor')
            .schemaType('footerSection')
            .documentId('footerSection')
        ),
      S.divider(),
      // Fallback: other document lists (excluir singletons para evitar IDs duplicados)
      ...S.documentTypeListItems().filter((item) => !['generalInfo','header','transfers','toursSection','testimonialsSection','contactSection','footerSection'].includes(item.getId() || '')),
    ])
