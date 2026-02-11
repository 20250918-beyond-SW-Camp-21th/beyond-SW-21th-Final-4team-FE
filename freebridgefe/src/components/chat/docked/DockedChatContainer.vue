<template>
    <div class="fixed bottom-0 right-4 z-50 flex items-end gap-3 pointer-events-none">
        <!-- Docked Rooms (Individual Windows) -->
        <div class="flex items-end gap-3 pointer-events-auto">
            <DockedChatWindow 
                v-for="room in chatStore.openDockedRooms"
                :key="room.roomId"
                :roomId="room.roomId"
                :minimized="room.minimized"
            />
        </div>

        <!-- Main Messaging List -->
        <div class="pointer-events-auto flex flex-col items-end">
            <!-- Toggle Button (Only visible if list is closed) -->
            <button 
                v-if="!chatStore.isRoomListOpen"
                @click="chatStore.toggleRoomList"
                class="bg-white border border-gray-200 shadow-lg rounded-t-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
                <div class="relative">
                     <img :src="userAvatar" class="w-6 h-6 rounded-full border border-gray-200" />
                    <span class="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <span class="font-bold text-gray-700 text-sm">메시지</span>
                <ChevronUpIcon class="w-4 h-4 text-gray-500" />
            </button>

            <!-- Room List Window -->
            <DockedRoomList v-else />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import DockedRoomList from './DockedRoomList.vue';
import DockedChatWindow from './DockedChatWindow.vue';
import { ChevronUp as ChevronUpIcon } from 'lucide-vue-next';

const chatStore = useChatStore();
const authStore = useAuthStore();

const userAvatar = computed(() => {
    return `https://ui-avatars.com/api/?name=${authStore.user?.name || 'Me'}&background=random`;
});
</script>
