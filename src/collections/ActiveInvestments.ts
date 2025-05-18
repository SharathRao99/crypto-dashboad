import { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'

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
      unique: true, // User can only have one active investment record per crypto
      index: true,
    },
    {
      name: 'crypto',
      type: 'relationship',
      relationTo: 'cryptos',
      required: true,
      unique: true, // User can only have one active investment record per crypto (combined with user)
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
}

export default ActiveInvestments
