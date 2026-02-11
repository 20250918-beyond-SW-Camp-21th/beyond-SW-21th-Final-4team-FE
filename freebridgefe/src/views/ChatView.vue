<template>
    <div class="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
        <!-- Sidebar -->
        <div class="w-80 border-r border-gray-200 bg-white flex-shrink-0">
            <ChatSidebar />
        </div>

        <!-- Main Chat Area -->
        <div class="flex-1 flex flex-col min-w-0 bg-white">
            <template v-if="chatStore.currentRoomId">
                <ChatWindow :roomId="chatStore.currentRoomId" />
            </template>
            <template v-else>
                <div class="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <MessageSquareIcon class="w-16 h-16 mb-4 opacity-20" />
                    <p class="text-lg font-medium">채팅방을 선택해주세요</p>
                    <p class="text-sm">왼쪽 목록에서 대상을 선택하여 대화를 시작하세요.</p>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import ChatSidebar from '@/components/chat/ChatSidebar.vue';
import ChatWindow from '@/components/chat/ChatWindow.vue';
import { MessageSquare as MessageSquareIcon } from 'lucide-vue-next';

const chatStore = useChatStore();
</script>
