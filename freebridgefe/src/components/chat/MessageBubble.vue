<template>
    <div :class="['flex mb-6 transition-all duration-300 ease-out group', isMine ? 'justify-end' : 'justify-start']">
        <!-- Avatar (Optionally show only for other) -->
        <div v-if="!isMine && !isSystem" class="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 mr-3 shrink-0 overflow-hidden border border-white/5 ring-1 ring-white/5 self-start mt-1 shadow-sm">
            {{ senderName.charAt(0) }}
        </div>

        <div class="max-w-[65%] flex flex-col" :class="isMine ? 'items-end' : 'items-start'">
            <!-- System Message -->
            <div v-if="isSystem" class="flex justify-center w-full my-6">
                <span class="bg-slate-800/50 backdrop-blur-sm text-slate-400 text-xs px-4 py-1.5 rounded-full border border-white/5 shadow-sm">
                    {{ message.content }}
                </span>
            </div>

            <!-- User Message -->
            <template v-else>
                <!-- Sender Name (Only for other) -->
                <span v-if="!isMine" class="text-[11px] text-slate-500 mb-1.5 ml-1 font-medium tracking-wide">{{ senderName }}</span>
                
                <!-- Contract/Business Alert Card -->
                <ChatMessageContract 
                    v-if="message.type === 'CONTRACT_ALERT'" 
                    :message="message" 
                    class="mb-1"
                />

                <!-- Standard Text Message -->
                <div 
                    v-else
                    class="px-4 py-2 text-[14px] relative shadow-md transition-all hover:shadow-lg"
                    :class="[
                        isMine 
                            ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-[22px] rounded-tr-sm' 
                            : 'bg-slate-800 border border-white/5 text-slate-200 rounded-[22px] rounded-tl-sm'
                    ]"
                >
                    <p class="whitespace-pre-wrap leading-relaxed break-words font-light tracking-wide">{{ message.content }}</p>
                </div>
                
                <!-- Timestamp -->
                <span 
                    class="text-[10px] text-slate-600 mt-1.5 mx-2 font-medium tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 translation-y-1 group-hover:translate-y-0"
                    :class="isMine ? 'text-right' : 'text-left'"
                >
                    {{ formatTime(message.createdAt) }}
                </span>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import type { ChatMessage } from '@/types';
import { format } from 'date-fns';
import ChatMessageContract from './ChatMessageContract.vue';

const props = defineProps<{
    message: ChatMessage;
    senderName: string;
}>();

const authStore = useAuthStore();

const isSystem = computed(() => props.message.type === 'SYSTEM');

const isMine = computed(() => {
    if (!authStore.user) return false;
    const myFullId = String(authStore.user.id);
    return props.message.senderId === myFullId;
});

function formatTime(date: Date) {
    if (!date) return '';
    return format(new Date(date), 'HH:mm');
}
</script>
