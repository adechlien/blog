import type { CollectionConfig } from 'payload'

export const Figures: CollectionConfig = {
  slug: 'figures',

  access: {
    read: () => true,
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'isFictional', 'order'],
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
      name: 'birthDate',
      type: 'date',
      label: 'Fecha de nacimiento',
    },
    {
      name: 'deathDate',
      type: 'date',
      label: 'Fecha de fallecimiento',
      admin: {
        description: 'Déjalo vacío si la persona sigue viva o si no aplica.',
      },
    },
    {
      name: 'lifeSpanLabel',
      type: 'text',
      label: 'Texto de vida',
      admin: {
        description:
          'Opcional. Ejemplo: 1955–actualidad, c. 470 a. C.–399 a. C., personaje ficticio.',
      },
    },
    {
      name: 'isFictional',
      type: 'checkbox',
      label: 'Es ficticio',
      defaultValue: false,
    },
    {
      name: 'fictionalNotice',
      type: 'textarea',
      label: 'Aviso de personaje ficticio',
      defaultValue:
        'Este perfil corresponde a un personaje ficticio. Su biografía y aportes se presentan desde el contexto de su obra.',
      admin: {
        condition: (_, siblingData) => siblingData?.isFictional === true,
      },
    },
    {
      name: 'kind',
      type: 'text',
      required: true,
      defaultValue: 'Escritora',
      label: 'Tipo',
    },
    {
      name: 'biography',
      type: 'richText',
      required: true,
      label: 'Biografía',
      admin: {
        description:
          'Biografía escrita por ti a partir de tu investigación sobre el personaje.',
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      required: true,
      label: 'Color de fondo',
      defaultValue: '#080809',
      admin: {
        description: 'Color hexadecimal. Ejemplo: #331717',
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
      name: 'order',
      type: 'number',
      label: 'Orden',
      defaultValue: 0,
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Destacado',
      defaultValue: false,
    },
    {
      name: 'contributions',
      type: 'blocks',
      label: 'Aportes',
      blocks: [
        {
          slug: 'quote',
          labels: {
            singular: 'Frase',
            plural: 'Frases',
          },
          fields: [
            {
              name: 'text',
              type: 'textarea',
              required: true,
              label: 'Frase',
            },
            {
              name: 'source',
              type: 'text',
              label: 'Fuente',
            },
          ],
        },
        {
          slug: 'link',
          labels: {
            singular: 'Link',
            plural: 'Links',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Título',
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'URL',
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Descripción',
            },
          ],
        },
        {
          slug: 'image',
          labels: {
            singular: 'Imagen',
            plural: 'Imágenes',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Imagen',
            },
            {
              name: 'caption',
              type: 'text',
              label: 'Pie de imagen',
            },
          ],
        },
        {
          slug: 'repository',
          labels: {
            singular: 'Repositorio',
            plural: 'Repositorios',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Nombre',
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'URL',
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Descripción',
            },
          ],
        },
        {
          slug: 'note',
          labels: {
            singular: 'Nota',
            plural: 'Notas',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Título',
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              label: 'Contenido',
            },
          ],
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
