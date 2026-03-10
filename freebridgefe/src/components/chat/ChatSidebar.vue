<template>
    <div class="flex flex-col h-full bg-[#020617] border-r border-white/5 relative">
        <!-- Header -->
        <div class="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#020617]/80 backdrop-blur-md z-20 border-b border-white/5">
            <h2 class="text-lg font-bold text-white tracking-tight">메시지</h2>
            <div class="relative flex gap-1 text-slate-400" ref="menuRoot">
                <button
                    class="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
                    @click="toggleMenu"
                    title="대화 목록 메뉴"
                >
                    <MoreHorizontalIcon class="w-5 h-5" />
                </button>
                <div
                    v-if="menuOpen"
                    class="absolute right-0 top-11 w-52 bg-slate-900 border border-white/10 rounded-xl shadow-lg overflow-hidden z-30"
                >
                    <button
                        class="w-full px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        :disabled="!chatStore.currentRoomId"
                        @click="togglePinCurrentRoom"
                    >
                        {{ isCurrentRoomPinned ? '현재 대화 상단 고정 해제' : '현재 대화 상단 고정' }}
                    </button>
                    <button
                        class="w-full px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        :disabled="!chatStore.currentRoomId"
                        @click="toggleMuteCurrentRoom"
                    >
                        {{ isCurrentRoomMuted ? '현재 대화 알림 켜기' : '현재 대화 알림 끄기' }}
                    </button>
                    <button
                        class="w-full px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        :disabled="!chatStore.currentRoomId"
                        @click="hideCurrentRoom"
                    >
                        현재 대화 숨기기
                    </button>
                    <div class="border-t border-white/10"></div>
                    <button
                        class="w-full px-3 py-2.5 text-left text-sm text-emerald-300 hover:bg-white/5 transition-colors"
                        @click="restoreHiddenRooms"
                    >
                        숨긴 대화 모두 복원
                    </button>
                </div>
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
                v-for="room in displayedRooms"
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
                            <span v-if="room.lastMessage?.senderId === chatStore.getCurrentChatParticipantId()" class="text-slate-600">나: </span>
                            {{ room.lastMessage?.content || '대화 없음' }}
                        </p>
                        <div v-if="getMyUnreadCount(room) > 0" class="px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm shadow-emerald-500/20">
                            {{ getMyUnreadCount(room) }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="displayedRooms.length === 0" class="flex flex-col items-center justify-center p-8 text-center text-slate-500 mt-10">
                <MessageSquareOffIcon class="w-16 h-16 mb-4 opacity-20" />
                <h3 class="text-lg font-semibold text-slate-300 mb-2">대화 없음</h3>
                <p class="text-sm max-w-[220px] mb-6">숨김 처리했거나 진행 중인 계약 관련 대화가 없습니다.</p>
                <button class="px-4 py-1.5 border border-slate-600 rounded-full text-slate-400 font-medium hover:bg-white/5 hover:text-white text-sm transition-colors" @click="restoreHiddenRooms">
                    숨긴 대화 복원
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import {
    Search as SearchIcon,
    MoreHorizontal as MoreHorizontalIcon,
    MessageSquareOff as MessageSquareOffIcon
} from 'lucide-vue-next';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ChatRoom } from '@/types';
import { CHAT_HIDDEN_ROOMS_KEY, CHAT_MUTED_ROOMS_KEY, CHAT_PINNED_ROOMS_KEY } from '@/constants/chatUi';

const chatStore = useChatStore();
const authStore = useAuthStore();
const menuOpen = ref(false);
const menuRoot = ref<HTMLElement | null>(null);
const pinnedRoomIds = ref<string[]>([]);
const mutedRoomIds = ref<string[]>([]);
const hiddenRoomIds = ref<string[]>([]);

const isCurrentRoomPinned = computed(() => {
    if (!chatStore.currentRoomId) return false;
    return pinnedRoomIds.value.includes(chatStore.currentRoomId);
});

const isCurrentRoomMuted = computed(() => {
    if (!chatStore.currentRoomId) return false;
    return mutedRoomIds.value.includes(chatStore.currentRoomId);
});

const displayedRooms = computed(() => {
    const visibleRooms = chatStore.myRooms.filter((room) => !hiddenRoomIds.value.includes(room.id));
    const roomOrderMap = new Map(visibleRooms.map((room, index) => [room.id, index]));

    return [...visibleRooms].sort((firstRoom, secondRoom) => {
        const firstPinned = pinnedRoomIds.value.includes(firstRoom.id);
        const secondPinned = pinnedRoomIds.value.includes(secondRoom.id);
        if (firstPinned && !secondPinned) return -1;
        if (!firstPinned && secondPinned) return 1;
        return (roomOrderMap.get(firstRoom.id) ?? 0) - (roomOrderMap.get(secondRoom.id) ?? 0);
    });
});

function readStoredRoomIds(storageKey: string): string[] {
    const storedValue = localStorage.getItem(storageKey);
    if (!storedValue) return [];

    try {
        const parsed = JSON.parse(storedValue);
        return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
    } catch {
        return [];
    }
}

function writeStoredRoomIds(storageKey: string, roomIds: string[]) {
    localStorage.setItem(storageKey, JSON.stringify(roomIds));
}

function toggleMenu() {
    menuOpen.value = !menuOpen.value;
}

function closeMenu() {
    menuOpen.value = false;
}

function toggleId(targetIds: string[], roomId: string) {
    return targetIds.includes(roomId)
        ? targetIds.filter((id) => id !== roomId)
        : [...targetIds, roomId];
}

function togglePinCurrentRoom() {
    if (!chatStore.currentRoomId) return;
    pinnedRoomIds.value = toggleId(pinnedRoomIds.value, chatStore.currentRoomId);
    writeStoredRoomIds(CHAT_PINNED_ROOMS_KEY, pinnedRoomIds.value);
    closeMenu();
}

function toggleMuteCurrentRoom() {
    if (!chatStore.currentRoomId) return;
    mutedRoomIds.value = toggleId(mutedRoomIds.value, chatStore.currentRoomId);
    writeStoredRoomIds(CHAT_MUTED_ROOMS_KEY, mutedRoomIds.value);
    closeMenu();
}

function hideCurrentRoom() {
    if (!chatStore.currentRoomId) return;

    const selectedRoomId = chatStore.currentRoomId;
    if (!hiddenRoomIds.value.includes(selectedRoomId)) {
        hiddenRoomIds.value = [...hiddenRoomIds.value, selectedRoomId];
        writeStoredRoomIds(CHAT_HIDDEN_ROOMS_KEY, hiddenRoomIds.value);
    }

    const nextRoom = displayedRooms.value.find((room) => room.id !== selectedRoomId);
    if (nextRoom) {
        chatStore.selectRoom(nextRoom.id);
    }

    closeMenu();
}

function restoreHiddenRooms() {
    hiddenRoomIds.value = [];
    writeStoredRoomIds(CHAT_HIDDEN_ROOMS_KEY, hiddenRoomIds.value);
    closeMenu();
}

function handleGlobalPointerDown(event: MouseEvent) {
    if (!menuOpen.value || !menuRoot.value) return;
    const targetNode = event.target as Node | null;
    if (targetNode && !menuRoot.value.contains(targetNode)) {
        closeMenu();
    }
}

function handleGlobalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        closeMenu();
    }
}

onMounted(() => {
    pinnedRoomIds.value = readStoredRoomIds(CHAT_PINNED_ROOMS_KEY);
    mutedRoomIds.value = readStoredRoomIds(CHAT_MUTED_ROOMS_KEY);
    hiddenRoomIds.value = readStoredRoomIds(CHAT_HIDDEN_ROOMS_KEY);
    document.addEventListener('mousedown', handleGlobalPointerDown);
    document.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleGlobalPointerDown);
    document.removeEventListener('keydown', handleGlobalKeydown);
});

function getOtherParticipantImage(room: ChatRoom) {
    // Placeholder logic for avatar
    return null;
}

function getOtherParticipantName(room: ChatRoom) {
    if (!authStore.user) return 'Unknown';
    const otherId = chatStore.getOtherParticipantId(room);
    return otherId && room.participantNames[otherId] ? room.participantNames[otherId] : '알 수 없음';
}

function getMyUnreadCount(room: ChatRoom) {
    if (!authStore.user) return 0;
    return chatStore.getMyParticipantIds().reduce((total, id) => total + (room.unreadCount[id] || 0), 0);
}

function formatDate(date: Date | undefined) {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
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
    background-color: var(--scroll-thumb-color);
    border-radius: 20px;
}
</style>


