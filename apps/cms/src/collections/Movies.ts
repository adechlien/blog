import type { CollectionConfig } from 'payload'
import { revalidateBlog } from '../hooks/revalidateBlog'

export const Movies: CollectionConfig = {
  slug: 'movies',

  access: {
    read: () => true,
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'label', 'letterboxdUrl', 'featured', 'order', 'status'],
  },

  hooks: {
    afterChange: [
      async ({ doc }) => {
        if (doc.status === 'published') {
          await revalidateBlog()
        }

        return doc
      },
    ],
    afterDelete: [
      async () => {
        await revalidateBlog()
      },
    ],
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titulo',
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Label',
      admin: {
        description: 'Texto corto para mostrar sobre el poster. Ejemplo: I, II, 01.',
      },
    },
    {
      name: 'letterboxdUrl',
      type: 'text',
      required: true,
      label: 'Link de Letterboxd',
      admin: {
        description: 'URL completa de la pelicula en Letterboxd.',
      },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Poster',
    },
    {
      name: 'order',
      type: 'number',
      label: 'Orden',
      defaultValue: 0,
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Destacada',
      defaultValue: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: 'Estado',
      options: [
        {
          label: 'Borrador',
          value: 'draft',
        },
        {
          label: 'Publicado',
          value: 'published',
        },
        {
          label: 'Archivado',
          value: 'archived',
        },
      ],
    },
  ],
}
