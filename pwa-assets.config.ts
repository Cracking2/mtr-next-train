import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Maskable and Apple icons are cropped by the OS, so pad them on the icon's own dark colour, not white.
const background = '#1F2328'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background } },
  },
  images: ['public/icon.svg'],
})
