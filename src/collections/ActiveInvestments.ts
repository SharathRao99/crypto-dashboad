import { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { anyone } from '@/access/anyone'

const ActiveInvestments: CollectionConfig = {
  slug: 'active-investments',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    // Admin can manage all active investments
    create: isAdmin,
    read: anyone, // Allow users to read their own active investments (will add row-level access later)
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'crypto',
      type: 'relationship',
      relationTo: 'cryptos',
      required: true,
      index: true,
    },
    {
      name: 'activeCryptoAmount',
      type: 'number',
      required: true,
    },
    {
      name: 'activeAmountInr',
      type: 'number',
      required: true,
    },
    {
      name: 'lastUpdated',
      type: 'date',
      required: true,
    },
  ],
  indexes: [
    {
      fields: ['user', 'crypto'],
      unique: true,
    },
  ],
}

export default ActiveInvestments
