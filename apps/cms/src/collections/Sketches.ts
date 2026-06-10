import type { CollectionConfig } from 'payload'
import { revalidateBlog } from '../hooks/revalidateBlog'

export const Sketches: CollectionConfig = {
  slug: 'sketches',

  access: {
    read: () => true,
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'featured', 'pubDate', 'status'],
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
      name: 'image',
      type: 'text',
      required: true,
      label: 'Imagen',
      admin: {
        description: 'Path publico o URL. Ejemplo: /sketches/1.JPEG',
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt',
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Destacado',
      defaultValue: false,
    },
    {
      name: 'pubDate',
      type: 'date',
      required: true,
      label: 'Fecha de publicacion',
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'Se usa para ordenar los sketches.',
      },
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
