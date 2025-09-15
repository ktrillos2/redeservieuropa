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
      S.divider(),
      // Fallback: other document lists
      ...S.documentTypeListItems().filter((item) => !['generalInfo','header'].includes(item.getId() || '')),
    ])
