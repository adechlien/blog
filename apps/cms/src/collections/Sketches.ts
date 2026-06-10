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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'Ruta publica del sketchbook. Ejemplo: mars',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Cover',
    },
    {
      name: 'timeSpan',
      type: 'text',
      label: 'Rango de tiempo',
      admin: {
        description: 'Ejemplo: Diciembre de 2024 - Febrero de 2025',
      },
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
        description: 'Se usa para ordenar los sketchbooks.',
      },
    },
    {
      name: 'sketches',
      type: 'array',
      required: true,
      label: 'Sketches',
      labels: {
        singular: 'Sketch',
        plural: 'Sketches',
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
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Imagen',
        },
        {
          name: 'order',
          type: 'number',
          required: true,
          label: 'Orden',
          defaultValue: 0,
        },
      ],
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
