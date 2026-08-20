<template>
  <w-calendar
    :events="events"
    :view="view"
    @date-click="$emit('date-click', $event)"
    @event-click="onEventClick"
    @view-change="$emit('view-change', $event)"
    @range-change="$emit('range-change', $event)"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import WCalendar from '@/components/ui/WCalendar.vue'
import { NETWORK_COLORS } from '@/api/marketing/marketing-shared.types'
import type { MarketingPost } from '@/api/marketing/marketing-posts.types'
import type { CalendarView } from '@/components/ui/WCalendar.vue'

export default defineComponent({
  name: 'MarketingCalendar',
  components: { WCalendar },
  props: {
    posts: { type: Array as PropType<MarketingPost[]>, default: () => [] },
    network: { type: String, default: '' },
    view: { type: String as PropType<CalendarView>, default: 'month' },
  },
  emits: ['date-click', 'event-click', 'view-change', 'range-change'],
  setup(props, { emit }) {
    const events = computed(() => {
      const filtered = props.posts
        .filter(post => !props.network || post.network === props.network)
        .filter(post => !!post.scheduledDate)
        .map(post => ({
          _id: post._id,
          title: post.title,
          startTime: post.scheduledDate,
          color: NETWORK_COLORS[post.network],
          post,
        }))
      return filtered
    })

    function onEventClick(event: any) {
      emit('event-click', event.post as MarketingPost)
    }

    return { events, onEventClick }
  },
})
</script>
