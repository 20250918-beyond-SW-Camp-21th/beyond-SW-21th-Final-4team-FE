<template>
    <div class="w-72 bg-slate-800 rounded-xl border border-emerald-500/30 overflow-hidden shadow-md my-2">
        <!-- Header -->
        <div class="px-4 py-3 bg-slate-800/50 border-b border-white/5 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <FileTextIcon class="w-4 h-4 text-emerald-500" />
            </div>
            <div>
                <p class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">계약 요청</p>
                <p class="text-sm font-bold text-white">프로젝트 표준 계약</p>
            </div>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-3">
            <div class="flex justify-between items-center text-sm">
                <span class="text-slate-400">상태</span>
                <span class="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    서명 대기중
                </span>
            </div>
            
            <div class="space-y-1">
                <p class="text-xs text-slate-500">프로젝트명</p>
                <p class="text-sm text-slate-300 font-medium truncate">모바일 앱 개발 1단계</p>
            </div>

            <div class="pt-2 flex gap-2">
                <button class="flex-1 py-2 text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-white/5">
                    상세 보기
                </button>
                <button class="flex-1 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-lg shadow-emerald-900/20">
                    서명하기
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FileText as FileTextIcon } from 'lucide-vue-next';
import type { ChatMessage } from '@/types';

defineProps<{
    message?: ChatMessage;
}>();
</script>
