import type { CollectionConfig } from 'payload'
import { revalidateBlog } from '../hooks/revalidateBlog'

export const Videos: CollectionConfig = {
  slug: 'videos',

  access: {
    read: () => true,
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'youtubeUrl', 'featured', 'order', 'status'],
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
      name: 'youtubeUrl',
      type: 'text',
      required: true,
      label: 'Link de YouTube',
      admin: {
        description: 'URL completa del video en YouTube.',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Thumbnail',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descripcion',
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
      label: 'Destacado',
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
