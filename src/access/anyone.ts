import { Access } from 'payload'

export const anyone: Access = ({ req: { user } }) => {
  // Return true if there is a user or if the request is not authenticated
  return Boolean(user)
}
