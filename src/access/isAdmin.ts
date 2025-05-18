import { Access, PayloadRequest } from 'payload'

/** @typedef {import('payload/types').Access} Access */
/**
 * @type {Access}
 */
export const isAdmin: Access = ({ req: { user } }: { req: { user: PayloadRequest['user'] } }) => {
  // Return true if user is authenticated and has admin role
  return Boolean(user?.role === 'admin')
}
