import { CollectionConfig } from 'payload'
import { validateWithdrawAmount } from './hooks/ValidateWithdraw'

const Withdrawals: CollectionConfig = {
  slug: 'withdrawals',
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => user?.role === 'user' || user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [validateWithdrawAmount],
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
      admin: {
        description: 'Available balance: ',
      },
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
}

export default Withdrawals
