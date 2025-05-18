import { CollectionConfig } from 'payload'
import { updateActiveInvestments } from './hooks/AfterChange' // Import the new hook

const Investments: CollectionConfig = {
  slug: 'investments',
  admin: {
    useAsTitle: 'user',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'crypto',
      type: 'relationship',
      relationTo: 'cryptos',
      required: true,
    },
    {
      name: 'cryptoAmount',
      type: 'number',
      required: true,
    },
    {
      name: 'inrValue',
      type: 'number',
      required: true,
    },
    {
      name: 'purchaseDateTime',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'transactionId',
      type: 'text',
      required: true,
    },
    {
      name: 'notes',
      type: 'textarea',
      required: false,
    },
  ],
  hooks: {
    afterChange: [updateActiveInvestments], // Use the imported hook
  },
}

export default Investments
