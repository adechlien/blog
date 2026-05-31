import type { CollectionConfig } from 'payload'

export const Collections: CollectionConfig = {
  slug: 'collections',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'color'],
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
      label: 'Descripción',
    },
    {
      name: 'color',
      type: 'text',
      required: true,
      label: 'Color principal',
      admin: {
        description: 'Color hexadecimal asociado a la colección. Ejemplo: #8B5CF6',
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
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'writer',
      label: 'Tipo',
      options: [
        { label: 'Escritor/a', value: 'writer' },
        { label: 'Filósofo/a', value: 'philosopher' },
        { label: 'Desarrollador/a', value: 'developer' },
        { label: 'Artista', value: 'artist' },
        { label: 'Personaje ficticio', value: 'fictional' },
        { label: 'Otro', value: 'other' },
      ],
    }
  ],
}
