import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VApp } from 'vuetify/components/VApp'

export default createVuetify({
  components: {
    VApp
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#2563EB',
          secondary: '#1B1B25',
          accent: '#C3C0FF',
          error: '#EF4444',
          info: '#2563EB',
          success: '#10B981',
          warning: '#F59E0B',
          background: '#0D0E11',
          surface: '#13141A',
        },
      },
      light: {
        dark: false,
        colors: {
          primary: '#2563EB',
          secondary: '#F1F3F5',
          accent: '#C3C0FF',
          error: '#EF4444',
          info: '#2563EB',
          success: '#10B981',
          warning: '#F59E0B',
          background: '#F8F9FA',
          surface: '#FFFFFF',
        },
      },
    },
  },
})
