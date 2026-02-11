<template>
    <div 
        ref="windowRef"
        :style="dragStyle"
        class="w-72 bg-[#0f172a] border border-white/10 rounded-t-lg shadow-lg flex flex-col"
        :class="[
            isMinimized ? 'h-12' : 'h-[500px]',
            isDragging ? 'shadow-2xl' : 'transition-all duration-300'
        ]"
    >
        <!-- Header -->
        <div 
            ref="headerRef"
            @pointerdown="onPointerDown"
            @click="toggleMinimize" 
            class="px-4 h-12 flex items-center justify-between border-b border-white/10 cursor-move hover:bg-white/5 bg-[#0f172a] rounded-t-lg shrink-0 z-20"
        >
            <div class="flex items-center gap-2">
                <div class="relative">
                    <img :src="userAvatar" class="w-8 h-8 rounded-full border border-white/10" alt="User" />
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></span>
                </div>
                <h3 class="font-bold text-white text-sm">Messaging</h3>
            </div>
            <div class="flex items-center gap-3 text-slate-400">
                <button class="hover:text-white"><MoreHorizontalIcon class="w-4 h-4" /></button>
                <button class="hover:text-white"><EditIcon class="w-4 h-4" /></button>
                <button @click.stop="isMinimized = !isMinimized" class="hover:text-white">
                    <ChevronUpIcon v-if="isMinimized" class="w-4 h-4" />
                    <ChevronDownIcon v-else class="w-4 h-4" />
                </button>
            </div>
        </div>

        <!-- Content (Hidden when minimized) -->
        <div v-show="!isMinimized" class="flex-1 flex flex-col overflow-hidden bg-[#0f172a]">
            <!-- Search -->
            <div class="p-2 border-b border-white/10">
                <div class="relative">
                    <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search messages" 
                        class="w-full pl-8 pr-3 py-1.5 bg-white/5 border-none rounded-md text-sm text-white focus:bg-slate-800 transition-all outline-none placeholder:text-slate-500"
                    />
                </div>
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto custom-scrollbar">
                <div 
                    v-for="room in chatStore.myRooms" 
                    :key="room.id"
                    @click="openRoom(room.id)"
                    class="p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex gap-3"
                >
                    <!-- Avatar -->
                   <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold shrink-0 overflow-hidden border border-white/10">
                        {{ getOtherParticipantName(room).charAt(0) }}
                   </div>

                   <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline">
                            <h4 class="font-semibold text-white truncate text-sm">
                                {{ getOtherParticipantName(room) }}
                            </h4>
                            <span class="text-[10px] text-slate-500 whitespace-nowrap">
                                {{ formatDate(room.lastMessage?.createdAt) }}
                            </span>
                        </div>
                        <p class="text-xs text-slate-400 truncate mt-0.5">
                            {{ room.lastMessage?.content || 'No messages' }}
                        </p>
                   </div>
                </div>
                
                 <!-- Empty State -->
                <div v-if="chatStore.myRooms.length === 0" class="p-6 text-center text-slate-500 mt-4">
                    <p class="text-xs">No active conversations</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { 
    MoreHorizontal as MoreHorizontalIcon, 
    Edit as EditIcon, 
    ChevronUp as ChevronUpIcon,
    ChevronDown as ChevronDownIcon,
    Search as SearchIcon
} from 'lucide-vue-next';
import { format } from 'date-fns';
import type { ChatRoom } from '@/types';
import { useDraggable } from '@vueuse/core';

const chatStore = useChatStore();
const authStore = useAuthStore();

const isMinimized = ref(false);

const userAvatar = computed(() => {
    // Placeholder avatar
    return `https://ui-avatars.com/api/?name=${authStore.user?.name || 'Me'}&background=random`;
});

function openRoom(roomId: string) {
    chatStore.openDockedRoom(roomId);
}

function getOtherParticipantName(room: ChatRoom) {
     if (!authStore.user) return 'Unknown';
    const myFullId = String(authStore.user.id);
    const otherId = room.participants.find(id => id !== myFullId);
    return otherId && room.participantNames[otherId] ? room.participantNames[otherId] : 'User';
}

function formatDate(date: Date | undefined) {
    if (!date) return '';
    return format(new Date(date), 'MMM d');
}

const windowRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const isDocked = ref(true);

// Draggable Logic
const { x, y, isDragging } = useDraggable(windowRef, {
  initialValue: { x: 0, y: 0 },
  handle: headerRef,
  preventDefault: true,
  onStart: () => {
      if (isDocked.value && windowRef.value) {
          const rect = windowRef.value.getBoundingClientRect();
          x.value = rect.left;
          y.value = rect.top;
      }
  }
});

onMounted(() => {
    if (windowRef.value) {
        const rect = windowRef.value.getBoundingClientRect();
        x.value = rect.left;
        y.value = rect.top;
    }
});

const dragStyle = computed(() => {
    if (isDocked.value) return {};
    return {
        position: 'fixed',
        left: `${x.value}px`,
        top: `${y.value}px`,
        zIndex: 100
    };
});

// Robust Drag vs Click Detection
const dragStartPos = ref({ x: 0, y: 0 });
const isClick = ref(true);

function onPointerDown(e: PointerEvent) {
    dragStartPos.value = { x: e.clientX, y: e.clientY };
    isClick.value = true;
    
    // Add temporary listener to track movement
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
}

function onPointerMove(e: PointerEvent) {
    const dx = Math.abs(e.clientX - dragStartPos.value.x);
    const dy = Math.abs(e.clientY - dragStartPos.value.y);
    if (dx > 5 || dy > 5) { // Threshold of 5px
        isClick.value = false;
        if (isDocked.value) isDocked.value = false; // Undock on drag
    }
}

function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
}

function toggleMinimize() {
    if (!isClick.value) return; // Ignore if it was a drag
    isMinimized.value = !isMinimized.value;
}
</script>
