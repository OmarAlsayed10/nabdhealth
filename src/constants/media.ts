import { CONFIG } from './config'
import logoUrl from '../assets/logo.png'

const { cloudName } = CONFIG.cloudinary

const img = (publicId: string, transform = 'q_auto,f_auto') =>
  `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}`

const vid = (publicId: string, transform = 'q_auto') =>
  `https://res.cloudinary.com/${cloudName}/video/upload/${transform}/${publicId}`

export const MEDIA = {
  logo: logoUrl,

  hero: {
    mockup: img('ikseer/hero-mockup', 'q_auto,f_auto,w_1200'),
    background: img('ikseer/hero-bg', 'q_auto,f_auto'),
  },

  demos: {
    overview: vid('ikseer/demo-overview'),
    appointment: vid('ikseer/demo-appointment'),
    billing: vid('ikseer/demo-billing'),
  },

  features: {
    patients: {
      video: vid('ikseer/feature-patients'),
      thumbnail: img('ikseer/feature-patients-thumb'),
    },
    scheduling: {
      video: vid('ikseer/feature-scheduling'),
      thumbnail: img('ikseer/feature-scheduling-thumb'),
    },
    billing: {
      video: vid('ikseer/feature-billing'),
      thumbnail: img('ikseer/feature-billing-thumb'),
    },
    reports: {
      video: vid('ikseer/feature-reports'),
      thumbnail: img('ikseer/feature-reports-thumb'),
    },
    staff: {
      video: vid('ikseer/feature-staff'),
      thumbnail: img('ikseer/feature-staff-thumb'),
    },
  },

  about: {
    team: img('ikseer/team', 'q_auto,f_auto,w_900'),
    office: img('ikseer/office', 'q_auto,f_auto,w_900'),
  },
} as const
