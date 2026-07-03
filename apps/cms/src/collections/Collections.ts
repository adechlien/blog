import type { CollectionConfig } from 'payload'
import { revalidateBlog } from '../hooks/revalidateBlog'

export const Collections: CollectionConfig = {
  slug: 'collections',

  access: {
    read: () => true,
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'color', 'order'],
  },

  hooks: {
    afterChange: [
      async ({ doc }) => {
        await revalidateBlog()

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
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nombre',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descripcion',
    },
    {
      name: 'color',
      type: 'text',
      required: true,
      label: 'Color principal',
      admin: {
        description: 'Color hexadecimal asociado a la coleccion. Ejemplo: #8B5CF6',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Icono',
    },
    {
      name: 'order',
      type: 'number',
      label: 'Orden',
      defaultValue: 0,
    },
  ],
}
