<script setup lang="ts">
import { computed } from 'vue';
import { useAlertStore } from '@/stores/alertStore';

const alertStore = useAlertStore();

const toneClass = computed(() => {
  switch (alertStore.type) {
    case 'success':
      return 'bg-emerald-400/10 text-emerald-200 border-emerald-400/20';
    case 'warning':
      return 'bg-amber-300/10 text-amber-200 border-amber-300/20';
    case 'error':
      return 'bg-rose-400/10 text-rose-200 border-rose-400/20';
    default:
      return 'bg-white/10 text-white/80 border-white/10';
  }
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="alertStore.isOpen"
      class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="alertStore.close"
    >
      <div class="w-full max-w-md rounded-[28px] border border-white/10 bg-white/10 shadow-[0_30px_90px_-60px_rgba(255,255,255,0.35)] backdrop-blur-2xl">
        <div class="p-6">
          <div class="inline-flex items-center px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] rounded-full border" :class="toneClass">
            Notice
          </div>
          <h3 class="mt-4 text-xl font-semibold text-white">{{ alertStore.title }}</h3>
          <p class="mt-3 text-sm text-white/70 leading-relaxed whitespace-pre-line">{{ alertStore.message }}</p>
        </div>
        <div class="p-6 pt-0 flex justify-end gap-3">
          <button
            v-if="alertStore.showCancel"
            type="button"
            class="px-5 py-2.5 rounded-full border border-white/15 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            @click="alertStore.cancel"
          >
            {{ alertStore.cancelText }}
          </button>
          <button
            type="button"
            class="px-5 py-2.5 rounded-full bg-white text-slate-900 text-sm font-semibold hover:bg-white/90 transition-colors"
            @click="alertStore.confirm"
          >
            {{ alertStore.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
