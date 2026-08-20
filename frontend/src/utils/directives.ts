import type { App, DirectiveBinding } from 'vue'

export const clickOutside = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    (el as any).clickOutsideEvent = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', (el as any).clickOutsideEvent)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', (el as any).clickOutsideEvent)
  }
}

export default {
  install: (app: App) => {
    app.directive('click-outside', clickOutside)
  }
}
