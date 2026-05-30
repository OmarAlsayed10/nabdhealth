export const CONFIG = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
    timeout: 10_000,
  },
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  },
  rateLimit: {
    formSubmissions: {
      maxRequests: 3,
      windowMs: 60_000,
    },
    contactForm: {
      maxRequests: 5,
      windowMs: 60_000,
    },
  },
  contact: {
    email: 'ikseerhealth@gmail.com',
  },
  trial: {
    days: 7,
    linkExpiryHours: 48,
  },
} as const
