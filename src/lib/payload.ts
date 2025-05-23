import payload from 'payload'

let cached = (global as any).payload

if (!cached) {
  cached = (global as any).payload = {
    client: null,
    promise: null,
  }
}

export const getPayloadClient = async () => {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET environment variable is missing')
  }

  if (cached.client) {
    return cached.client
  }

  if (!cached.promise) {
    cached.promise = payload.init({
      // @ts-ignore - Payload types are not properly exported
      secret: process.env.PAYLOAD_SECRET,
      local: true,
    })
  }

  try {
    cached.client = await cached.promise
  } catch (e: unknown) {
    cached.promise = null
    throw e
  }

  return cached.client
}
