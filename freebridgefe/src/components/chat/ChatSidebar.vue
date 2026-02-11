<template>
    <div class="flex flex-col h-full bg-[#020617] border-r border-white/5 relative">
        <!-- Header -->
        <div class="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#020617]/80 backdrop-blur-md z-20 border-b border-white/5">
            <h2 class="text-lg font-bold text-white tracking-tight">메시지</h2>
            <div class="flex gap-1 text-slate-400">
                <button class="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"><MoreHorizontalIcon class="w-5 h-5" /></button>
                <button class="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"><PencilIcon class="w-5 h-5" /></button>
            </div>
        </div>

        <!-- Search -->
        <div class="px-4 pb-4 pt-2 bg-[#020617]">
            <div class="relative group">
                <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="대화 검색..." 
                    class="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-transparent rounded-full text-sm text-white focus:bg-slate-800 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none placeholder:text-slate-600"
                />
            </div>
        </div>

        <!-- Room List -->
        <div class="flex-1 overflow-y-auto custom-scrollbar bg-[#020617] p-2 space-y-1">
            <div 
                v-for="room in chatStore.myRooms" 
                :key="room.id"
                @click="chatStore.selectRoom(room.id)"
                :class="[
                    'p-3 rounded-xl cursor-pointer transition-all duration-200 flex gap-4 items-center group',
                    chatStore.currentRoomId === room.id 
                        ? 'bg-slate-800/80 shadow-md ring-1 ring-white/5' 
                        : 'hover:bg-slate-900/50 hover:shadow-sm'
                ]"
            >
                <!-- Avatar -->
                <div class="relative shrink-0">
                    <div class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold overflow-hidden border border-white/5 ring-2 ring-[#020617] group-hover:ring-slate-800 transition-all">
                        <img v-if="getOtherParticipantImage(room)" :src="getOtherParticipantImage(room)" class="w-full h-full object-cover" />
                        <span v-else>{{ getOtherParticipantName(room).charAt(0) }}</span>
                    </div>
                    <!-- Online Status Indicator (Mock) -->
                     <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#020617] rounded-full"></span>
                </div>

                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center mb-0.5">
                        <h3 
                            class="font-semibold text-sm truncate transition-colors"
                            :class="chatStore.currentRoomId === room.id ? 'text-white' : 'text-slate-200 group-hover:text-white'"
                        >
                            {{ getOtherParticipantName(room) }}
                        </h3>
                        <span class="text-[11px] text-slate-500 whitespace-nowrap font-medium">
                             {{ formatDate(room.lastMessage?.createdAt) }}
                        </span>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <p 
                            :class="[
                                'text-sm truncate max-w-[180px] leading-snug', 
                                getMyUnreadCount(room) > 0 ? 'font-medium text-slate-100' : 'text-slate-500 group-hover:text-slate-400'
                            ]"
                        >
                            <span v-if="room.lastMessage?.senderId === String(authStore.user?.id)" class="text-slate-600">나: </span>
                            {{ room.lastMessage?.content || '대화 없음' }}
                        </p>
                         <div v-if="getMyUnreadCount(room) > 0" class="px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm shadow-emerald-500/20">
                            {{ getMyUnreadCount(room) }}
                         </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="chatStore.myRooms.length === 0" class="flex flex-col items-center justify-center p-8 text-center text-slate-500 mt-10">
                <MessageSquareOffIcon class="w-16 h-16 mb-4 opacity-20" />
                <h3 class="text-lg font-semibold text-slate-300 mb-2">대화 없음</h3>
                <p class="text-sm max-w-[200px] mb-6">진행 중인 계약 관련 대화가 없습니다.</p>
                <button class="px-4 py-1.5 border border-slate-600 rounded-full text-slate-400 font-medium hover:bg-white/5 hover:text-white text-sm transition-colors">
                    메시지 보내기
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
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
import { ko } from 'date-fns/locale';
import type { ChatRoom } from '@/types';

const chatStore = useChatStore();
const authStore = useAuthStore();

function getOtherParticipantImage(room: ChatRoom) {
    // Placeholder logic for avatar
    return null;
}

function getOtherParticipantName(room: ChatRoom) {
    if (!authStore.user) return 'Unknown';
    const myFullId = String(authStore.user.id);
    
    // Find key in participants that is not me
    const otherId = room.participants.find(id => id !== myFullId);
    return otherId && room.participantNames[otherId] ? room.participantNames[otherId] : '알 수 없음';
}

function getMyUnreadCount(room: ChatRoom) {
    if (!authStore.user) return 0;
    const myFullId = String(authStore.user.id);
    return room.unreadCount[myFullId] || 0;
}

function formatDate(date: Date | undefined) {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    // If today, return time. If older, return MMM DD
    if (d.toDateString() === now.toDateString()) {
        return format(d, 'a h:mm', { locale: ko });
    }
    return format(d, 'M월 d일', { locale: ko });
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
