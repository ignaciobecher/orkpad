import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'

// Styles
import './assets/css/main.css'
import directives from './utils/directives'
import { showToast } from '@/composables/useToast'

const app = createApp(App)

app.use(directives)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(i18n)

app.config.errorHandler = (err, instance, info) => {
  if (import.meta.env.DEV) {
    console.error('[Vue Error]', err, info)
  }
  const message = err instanceof Error ? err.message : String(err)
  if (message) {
    showToast(message, 'error')
  }
}

app.mount('#app')

// Register Service Worker
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  })
}

// Trigger Vite HMR
