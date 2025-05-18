import { CollectionConfig } from 'payload'

const Cryptos: CollectionConfig = {
  slug: 'cryptos',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true, // Publicly readable (optional – if needed by frontend)
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'symbol',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'value',
      type: 'text',
      required: true,
      label: 'Current value in INR',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media', // Default Payload media collection
      required: true,
    },
  ],
}

export default Cryptos
