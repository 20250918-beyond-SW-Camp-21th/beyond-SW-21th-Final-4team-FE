<template>
    <div :class="['flex mb-4 transition-all duration-300 ease-out', isMine ? 'justify-end' : 'justify-start']">
        <!-- Avatar (Optionally show only for other) -->
        <div v-if="!isMine && !isSystem" class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-2 shrink-0 shadow-sm mt-1">
            {{ senderName.charAt(0) }}
        </div>

        <div class="max-w-[75%]">
            <!-- System Message -->
            <div v-if="isSystem" class="flex justify-center w-full my-4">
                <span class="bg-gray-100 text-gray-500 text-xs px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                    {{ message.content }}
                </span>
            </div>

            <!-- User Message -->
            <template v-else>
                <div class="flex flex-col" :class="isMine ? 'items-end' : 'items-start'">
                    <!-- Sender Name (Only for other) -->
                    <span v-if="!isMine" class="text-xs text-gray-500 mb-1 ml-1">{{ senderName }}</span>
                    
                    <div 
                        :class="[
                            'px-4 py-2.5 rounded-2xl text-sm relative group shadow-sm transition-all',
                            isMine 
                                ? 'bg-blue-600 text-white rounded-tr-none hover:bg-blue-700' 
                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none hover:bg-gray-50'
                        ]"
                    >
                        <p class="whitespace-pre-wrap leading-relaxed break-words">{{ message.content }}</p>
                        
                        <!-- Timestamp -->
                        <span 
                            :class="[
                                'text-[10px] absolute bottom-0 mb-1.5',
                                isMine ? 'text-blue-200 right-full mr-2' : 'text-gray-400 left-full ml-2'
                            ]"
                            class="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            {{ formatTime(message.createdAt) }}
                        </span>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import type { ChatMessage } from '@/types';
import { format } from 'date-fns';

const props = defineProps<{
    message: ChatMessage;
    senderName: string;
}>();

const authStore = useAuthStore();

const isSystem = computed(() => props.message.type === 'SYSTEM' || props.message.type === 'CONTRACT_ALERT');

const isMine = computed(() => {
    if (!authStore.user) return false;
    const myPrefix = authStore.user.role === 'EMPLOYER' ? 'e' : 'f';
    const myFullId = `${myPrefix}${authStore.user.id}`;
    return props.message.senderId === myFullId;
});

function formatTime(date: Date) {
    if (!date) return '';
    return format(new Date(date), 'HH:mm');
}
</script>
