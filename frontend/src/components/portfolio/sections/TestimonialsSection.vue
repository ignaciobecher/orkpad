<script setup lang="ts">
const props = defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()
const testimonials = props.portfolioData.testimonials ?? []
</script>

<template>
  <section class="testi">
    <div class="testi__inner">
      <h2 v-if="content.title" class="section-title">{{ content.title }}</h2>
      <div class="testi__grid">
        <div v-for="t in testimonials" :key="t._id" class="testi__card">
          <div v-if="settings.showRating !== false && t.rating" class="testi__stars">
            <span v-for="i in 5" :key="i" class="mdi" :class="i <= t.rating ? 'mdi-star' : 'mdi-star-outline'"></span>
          </div>
          <p class="testi__content">&ldquo;{{ t.content }}&rdquo;</p>
          <div class="testi__author">
            <img v-if="t.clientAvatarUrl" :src="t.clientAvatarUrl" :alt="t.clientName" class="testi__avatar" />
            <div v-else class="testi__avatar-placeholder">{{ (t.clientName || '?')[0] }}</div>
            <div>
              <p class="testi__name">{{ t.clientName }}</p>
              <p v-if="t.clientRole" class="testi__role">{{ t.clientRole }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-if="testimonials.length === 0" class="testi__empty">Sin testimonios aún.</div>
    </div>
  </section>
</template>

<style scoped>
.testi { padding: 80px 24px; }
.testi__inner { max-width: 1100px; margin: 0 auto; }
.testi__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 40px; }
.testi__card { background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 28px; display: flex; flex-direction: column; gap: 16px; }
.testi__stars { display: flex; gap: 2px; color: var(--color-warning); font-size: 16px; }
.testi__content { font-size: 15px; line-height: 1.7; color: var(--color-text-muted); margin: 0; flex: 1; }
.testi__author { display: flex; align-items: center; gap: 12px; }
.testi__avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.testi__avatar-placeholder { width: 40px; height: 40px; border-radius: 50%; background: var(--pf-primary, var(--color-primary)); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: #fff; }
.testi__name { font-size: 14px; font-weight: 700; margin: 0; }
.testi__role { font-size: 12px; color: var(--color-text-muted); margin: 2px 0 0; }
.testi__empty { color: var(--color-text-muted); font-size: 14px; margin-top: 24px; }
.section-title { font-size: 28px; font-weight: 700; margin: 0; }
</style>
