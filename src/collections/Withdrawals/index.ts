import { CollectionConfig } from 'payload'
import { updateActiveInvestments } from './hooks/AfterChange'

const Withdrawals: CollectionConfig = {
  slug: 'withdrawals',
  admin: {
    useAsTitle: 'id',
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
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
      name: 'withdrawalDetails',
      type: 'group',
      fields: [
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Complete', value: 'complete' },
            { label: 'Failed', value: 'failed' },
          ],
          required: true,
          defaultValue: 'pending',
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [updateActiveInvestments],
  },
}

export default Withdrawals
