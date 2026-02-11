<template>
    <div class="flex flex-col h-full bg-white border-r border-gray-200">
        <!-- Header -->
        <div class="p-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 class="text-sm font-bold text-gray-700">Messaging</h2>
            <div class="flex gap-2 text-gray-500">
                <button class="p-1 hover:bg-gray-100 rounded-full transition-colors"><MoreHorizontalIcon class="w-5 h-5" /></button>
                <button class="p-1 hover:bg-gray-100 rounded-full transition-colors"><PencilIcon class="w-5 h-5" /></button>
            </div>
        </div>

        <!-- Search -->
        <div class="px-3 py-2 bg-white">
            <div class="relative">
                <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search messages" 
                    class="w-full pl-9 pr-8 py-1.5 bg-gray-100 border border-transparent rounded-md text-sm focus:border-black focus:bg-white transition-all outline-none placeholder:text-gray-500"
                />
                <SettingsIcon class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 cursor-pointer" />
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 bg-white">
            <button 
                class="flex-1 py-3 text-sm font-semibold border-b-2 transition-colors hover:bg-gray-50 text-emerald-700 border-emerald-700"
            >
                Focused
            </button>
            <button 
                class="flex-1 py-3 text-sm font-semibold text-gray-500 border-b-2 border-transparent hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
                Other
            </button>
        </div>

        <!-- Room List -->
        <div class="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <div 
                v-for="room in chatStore.myRooms" 
                :key="room.id"
                @click="chatStore.selectRoom(room.id)"
                :class="[
                    'p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all duration-200 flex gap-3',
                    chatStore.currentRoomId === room.id ? 'bg-blue-50/30 border-l-[3px] border-l-emerald-700 pl-[9px]' : 'pl-3 border-l-[3px] border-l-transparent'
                ]"
            >
                <!-- Avatar -->
                <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0 overflow-hidden">
                     <img v-if="getOtherParticipantImage(room)" :src="getOtherParticipantImage(room)" class="w-full h-full object-cover" />
                     <span v-else>{{ getOtherParticipantName(room).charAt(0) }}</span>
                </div>

                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline mb-0.5">
                        <h3 class="font-semibold text-gray-900 truncate text-sm">
                            {{ getOtherParticipantName(room) }}
                        </h3>
                        <span class="text-xs text-gray-500 whitespace-nowrap ml-1 font-normal">
                             {{ formatDate(room.lastMessage?.createdAt) }}
                        </span>
                    </div>
                    
                    <p class="text-xs text-gray-500 truncate mb-1 line-clamp-1 h-4">
                        {{ room.relatedJobId ? 'Project Discussion' : 'General Inquiry' }}
                    </p>

                    <div class="flex justify-between items-center">
                        <p 
                            :class="['text-xs truncate max-w-[160px]', getMyUnreadCount(room) > 0 ? 'font-bold text-gray-800' : 'text-gray-500']"
                        >
                            {{ room.lastMessage?.senderId === authStore.user?.role + authStore.user?.id ? 'You: ' : '' }}{{ room.lastMessage?.content || 'No messages yet' }}
                        </p>
                         <span 
                            v-if="getMyUnreadCount(room) > 0" 
                            class="inline-block w-2 h-2 rounded-full bg-emerald-600"
                        ></span>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="chatStore.myRooms.length === 0" class="flex flex-col items-center justify-center p-8 text-center text-gray-500 mt-10">
                <MessageSquareOffIcon class="w-16 h-16 mb-4 opacity-20" />
                <h3 class="text-lg font-semibold text-gray-800 mb-2">No messages yet</h3>
                <p class="text-sm max-w-[200px] mb-6">Reach out and start a conversation to advance your career</p>
                <button class="px-4 py-1.5 border border-gray-400 rounded-full text-gray-600 font-medium hover:bg-gray-50 text-sm transition-colors">
                    Send a message
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { 
    Search as SearchIcon, 
    MoreHorizontal as MoreHorizontalIcon, 
    Pencil as PencilIcon,
    Settings as SettingsIcon,
    MessageSquareOff as MessageSquareOffIcon
} from 'lucide-vue-next';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale'; // Changed to English for LinkedIn style match, or keep ko? User asked for LinkedIn style but language kept as Korean previously. I will stick to mixed or English labels as per the UI screenshot request but maybe Korean data.
import type { ChatRoom } from '@/types';

const chatStore = useChatStore();
const authStore = useAuthStore();

function getOtherParticipantImage(room: ChatRoom) {
    // Placeholder logic for avatar
    return null;
}

function getOtherParticipantName(room: ChatRoom) {
    if (!authStore.user) return 'Unknown';
    const myPrefix = authStore.user.role === 'EMPLOYER' ? 'e' : 'f';
    const myFullId = `${myPrefix}${authStore.user.id}`;
    
    // Find key in participants that is not me
    const otherId = room.participants.find(id => id !== myFullId);
    return otherId && room.participantNames[otherId] ? room.participantNames[otherId] : '알 수 없음';
}

function getMyUnreadCount(room: ChatRoom) {
    if (!authStore.user) return 0;
    const myPrefix = authStore.user.role === 'EMPLOYER' ? 'e' : 'f';
    const myFullId = `${myPrefix}${authStore.user.id}`;
    return room.unreadCount[myFullId] || 0;
}

function formatDate(date: Date | undefined) {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    // If today, return time. If older, return MMM DD
    if (d.toDateString() === now.toDateString()) {
        return format(d, 'h:mm a');
    }
    return format(d, 'MMM d');
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 20px;
}
</style>
