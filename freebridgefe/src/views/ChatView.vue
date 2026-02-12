<template>
    <!-- 3-Column Grid Layout: Sidebar(320px) - Chat(1fr) - InfoPanel(320px) -->
    <div class="grid grid-cols-[320px_1fr_320px] h-[calc(100vh-64px)] overflow-hidden bg-slate-950 min-h-0">
        <!-- 1. Left Sidebar: Room List -->
        <div class="border-r border-white/5 flex flex-col bg-[#020617] relative z-10 w-[320px]">
            <ChatSidebar />
        </div>

        <!-- Main Chat Area -->
        <div class="flex-1 flex flex-col min-w-0 bg-slate-950 min-h-0">
            <template v-if="chatStore.currentRoomId">
                <ChatWindow :roomId="chatStore.currentRoomId" />
            </template>
            <template v-else>
                <div class="flex-1 flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
                    <!-- Background Pattern -->
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950 pointer-events-none"></div>

                    <div class="relative z-10 text-center space-y-4 p-8">
                        <div class="w-20 h-20 bg-slate-900/80 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10 shadow-2xl shadow-emerald-900/20">
                            <MessageSquareIcon class="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 class="text-xl font-bold text-white tracking-tight">대화 상대를 선택하세요</h3>
                        <p class="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                            채팅 목록에서 대화를 선택하거나<br>새로운 대화를 시작해보세요.
                        </p>
                    </div>
                </div>
            </template>
        </div>
        <!-- 3. Right Sidebar: Context Panel -->
        <div v-if="chatStore.currentRoomId" class="w-[320px] h-full bg-slate-900 border-l border-white/5">
            <ChatInfoPanel :roomId="chatStore.currentRoomId" />
        </div>
        <div v-else class="w-[320px] bg-slate-900 border-l border-white/5 flex items-center justify-center text-slate-600 text-sm">
            채팅을 선택하여 상세정보를 확인하세요
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import ChatSidebar from '@/components/chat/ChatSidebar.vue';
import ChatWindow from '@/components/chat/ChatWindow.vue';
import ChatInfoPanel from '@/components/chat/ChatInfoPanel.vue';
import { MessageSquare as MessageSquareIcon } from 'lucide-vue-next';

const chatStore = useChatStore();

const activeRoomId = ref<string | null>(null);

function handleSelectRoom(roomId: string) {
    activeRoomId.value = roomId;
}
</script>
