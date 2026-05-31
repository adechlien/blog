import type { CollectionConfig } from 'payload'
import { generateTextNumericId } from '../utils/generateTextId'

export const Texts: CollectionConfig = {
  slug: 'texts',
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data) return data;

        if (operation !== "create" || data.numericId) {
          return data;
        }

        const pubDate = data.pubDate ?? new Date().toISOString();

        let numericId = generateTextNumericId(pubDate);
        let attempts = 0;

        while (attempts < 20) {
          const existing = await req.payload.find({
            collection: "texts",
            where: {
              numericId: {
                equals: numericId,
              },
            },
            limit: 1,
          });

          const alreadyExists = existing.docs.some(
            (doc: any) => doc.id !== originalDoc?.id
          );

          if (!alreadyExists) break;

          numericId = generateTextNumericId(pubDate);
          attempts++;
        }

        if (attempts >= 20) {
          throw new Error("Could not generate a unique numericId for this text");
        }

        data.numericId = numericId;

        return data;
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'collection', 'status', 'pubDate'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Título',
    },
    {
      name: 'numericId',
      type: 'text',
      unique: true,
      label: 'ID numérico',
      admin: {
        readOnly: true,
        description: 'ID de la ruta pública del texto. Se genera automáticamente.',
      },
    },
    {
      name: 'legacySlug',
      type: 'text',
      label: 'Slug anterior',
      admin: {
        description: 'Ruta antigua del texto para mantener redirects.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Previsualización',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Contenido',
      admin: {
        description:
          'Contenido del texto.',
      },
    },
    {
      name: 'collection',
      type: 'relationship',
      relationTo: 'collections',
      required: true,
      label: 'Colección',
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Portada',
    },
    {
      name: 'pubDate',
      type: 'date',
      required: true,
      label: 'Fecha',
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
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Destacado',
      defaultValue: false,
    },
  ],
}
