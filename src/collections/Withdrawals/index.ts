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
      name: 'inrValue',
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
          defaultValue: 'pending',
          required: true,
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Complete', value: 'complete' },
          ],
        },
        {
          name: 'transactionId',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            condition: (data, siblingData) => siblingData?.status === 'complete',
          },
        },
        {
          name: 'timestamp',
          type: 'date',
          defaultValue: new Date(),
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [updateActiveInvestments],
  },
}

export default Withdrawals
