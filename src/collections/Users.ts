import { CollectionConfig } from 'payload'

const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Enables authentication
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req: { user } }) => {
      // Admin can read all users, normal users can only read their own data
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => {
      return user?.role === 'admin' // Only admin can create users
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      access: {
        // Only admin can assign roles
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'walletAddress',
      type: 'text',
    },
    {
      name: 'address',
      type: 'textarea',
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media', // Assuming you have a media collection
    },
  ],
}

export default Users
