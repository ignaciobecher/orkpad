<script setup lang="ts">
const props = defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()

const name = props.content.useWorkspaceData !== false
  ? props.portfolioData.profile?.name
  : props.content.customName

const headline = props.content.useWorkspaceData !== false
  ? props.portfolioData.profile?.headline
  : props.content.customHeadline

const bio = props.content.useWorkspaceData !== false
  ? props.portfolioData.profile?.bio
  : props.content.customBio

const profile = props.portfolioData.profile ?? {}
const socialLinks = profile.socialLinks ?? {}
</script>

<template>
  <section class="hero" :class="`hero--${settings.layout ?? 'centered'}`">
    <div v-if="settings.showBanner && profile.bannerUrl" class="hero__banner">
      <img :src="profile.bannerUrl" alt="Banner" />
    </div>
    <div class="hero__inner">
      <div v-if="settings.layout === 'split'" class="hero__image-wrap">
        <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="name" class="hero__avatar hero__avatar--large" />
        <div v-else class="hero__avatar-placeholder hero__avatar--large">{{ (name || '?')[0] }}</div>
      </div>
      <div class="hero__content">
        <div v-if="settings.layout !== 'split'" class="hero__avatar-wrap">
          <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="name" class="hero__avatar" />
          <div v-else class="hero__avatar-placeholder">{{ (name || '?')[0] }}</div>
        </div>
        <div
          v-if="content.showAvailability !== false && profile.availableForWork"
          class="hero__badge"
        >
          <span class="hero__badge-dot"></span>
          {{ profile.availabilityNote || 'Disponible para proyectos' }}
        </div>
        <h1 class="hero__name">{{ name }}</h1>
        <p v-if="headline" class="hero__headline">{{ headline }}</p>
        <p v-if="bio" class="hero__bio">{{ bio }}</p>
        <div v-if="content.ctaLabel" class="hero__cta">
          <a :href="content.ctaUrl || '#contacto'" class="hero__btn">{{ content.ctaLabel }}</a>
        </div>
        <div v-if="content.showSocialLinks !== false" class="hero__social">
          <a v-if="socialLinks.github" :href="socialLinks.github" target="_blank" rel="noopener" class="hero__social-link"><span class="mdi mdi-github"></span></a>
          <a v-if="socialLinks.linkedin" :href="socialLinks.linkedin" target="_blank" rel="noopener" class="hero__social-link"><span class="mdi mdi-linkedin"></span></a>
          <a v-if="socialLinks.twitter" :href="socialLinks.twitter" target="_blank" rel="noopener" class="hero__social-link"><span class="mdi mdi-twitter"></span></a>
          <a v-if="socialLinks.website" :href="socialLinks.website" target="_blank" rel="noopener" class="hero__social-link"><span class="mdi mdi-web"></span></a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero { padding: 80px 24px; }
.hero--centered .hero__inner { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 700px; margin: 0 auto; }
.hero--left .hero__inner { display: flex; flex-direction: column; align-items: flex-start; max-width: 700px; margin: 0 auto; }
.hero--split .hero__inner { display: flex; flex-direction: row; align-items: center; gap: 60px; max-width: 960px; margin: 0 auto; }
.hero__banner { height: 220px; overflow: hidden; margin-bottom: 0; }
.hero__banner img { width: 100%; height: 100%; object-fit: cover; }
.hero__content { flex: 1; }
.hero__avatar-wrap { margin-bottom: 20px; }
.hero__avatar { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 3px solid var(--pf-primary, var(--color-primary)); }
.hero__avatar--large { width: 200px; height: 200px; border-radius: 50%; object-fit: cover; border: 3px solid var(--pf-primary, var(--color-primary)); flex-shrink: 0; }
.hero__avatar-placeholder { width: 88px; height: 88px; border-radius: 50%; background: var(--pf-primary, var(--color-primary)); display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700; color: #fff; }
.hero__badge { display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; border: 1px solid var(--color-success); color: var(--color-success); font-size: 12px; font-weight: 500; margin-bottom: 16px; }
.hero__badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-success); animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
.hero__name { font-size: clamp(32px, 5vw, 52px); font-weight: 700; margin: 0 0 10px; line-height: 1.1; }
.hero__headline { font-size: clamp(16px, 2.5vw, 22px); color: var(--pf-primary, var(--color-primary)); margin: 0 0 16px; font-weight: 500; }
.hero__bio { font-size: 16px; color: var(--color-text-muted); line-height: 1.7; max-width: 580px; margin: 0 0 28px; }
.hero__cta { margin-bottom: 24px; }
.hero__btn { display: inline-flex; align-items: center; padding: 12px 28px; background: var(--pf-primary, var(--color-primary)); color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; transition: opacity 0.15s; }
.hero__btn:hover { opacity: 0.85; }
.hero__social { display: flex; gap: 12px; flex-wrap: wrap; }
.hero__social-link { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 20px; transition: all 0.15s; text-decoration: none; }
.hero__social-link:hover { color: var(--pf-primary, var(--color-primary)); border-color: var(--pf-primary, var(--color-primary)); }
</style>
