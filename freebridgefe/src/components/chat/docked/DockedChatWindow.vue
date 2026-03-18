<template>
    <div 
        ref="windowRef"
        :style="dragStyle"
        class="w-80 bg-[#0f172a] border border-white/10 rounded-t-lg shadow-lg flex flex-col"
        :class="[
            minimized ? 'h-12' : 'h-[400px]',
            isDragging ? 'shadow-2xl' : 'transition-all duration-300'
        ]"
    >
        <!-- Header -->
        <div 
            ref="headerRef"
            @pointerdown="onPointerDown"
            @click="toggleMinimize"
            class="px-3 h-12 flex items-center justify-between border-b border-white/10 cursor-move hover:bg-white/5 bg-[#0f172a] rounded-t-lg shrink-0 z-20"
            :class="minimized ? 'bg-[#0f172a]' : 'bg-[#0f172a]'"
        >
            <div class="flex items-center gap-2">
                <div class="relative">
                     <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0 border border-white/10">
                        {{ otherParticipantName.charAt(0) }}
                    </div>
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></span>
                </div>
                <div>
                    <h3 class="font-bold text-white text-sm truncate max-w-[120px]">{{ otherParticipantName }}</h3>
                    <p v-if="!minimized" class="text-[10px] text-emerald-500">Active now</p>
                </div>
            </div>
            <div class="flex items-center gap-1 text-slate-400">
                <button @click.stop="toggleMinimize" class="p-1 hover:bg-white/10 rounded">
                    <MinusIcon class="w-4 h-4" />
                </button>
                <button @click.stop="closeWindow" class="p-1 hover:bg-white/10 rounded hover:text-red-400">
                    <XIcon class="w-4 h-4" />
                </button>
            </div>
        </div>

        <!-- Content -->
        <div v-show="!minimized" class="flex-1 flex flex-col overflow-hidden bg-slate-900">
            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-3 custom-scrollbar" ref="messagesContainer">
                 <div
                    v-if="nonSystemMessages.length === 0"
                    class="h-full min-h-[120px] flex items-center justify-center text-slate-400 text-xs"
                >
                    새로운 대화를 시작해보세요.
                </div>
                <div
                    v-else-if="isReadOnly"
                    class="mb-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300"
                >
                    상대방이 채팅방을 나갔습니다. 이 채팅은 읽기 전용입니다.
                </div>
                 <div v-for="msg in messages" :key="msg.id" class="mb-3">
                    <div 
                        :class="['flex flex-col', isMyMessage(msg) ? 'items-end' : 'items-start']"
                    >
                        <div 
                            :class="[
                                'max-w-[85%] px-3 py-2 rounded-lg text-sm relative group',
                                isMyMessage(msg) 
                                    ? 'bg-emerald-600 text-white rounded-br-none' 
                                    : 'bg-[#1e293b] text-slate-100 border border-white/10 rounded-bl-none'
                            ]"
                        >
                            <template v-if="msg.type === 'FILE' && getFileUrl(msg)">
                                <a
                                    :href="getFileUrl(msg)"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="underline underline-offset-2"
                                >
                                    {{ getFileName(msg) }}
                                </a>
                            </template>
                            <template v-else-if="msg.type === 'FILE'">
                                {{ getFileName(msg) }}
                            </template>
                            <template v-else>
                                {{ msg.content }}
                            </template>
                            <span class="text-[9px] opacity-70 block text-right mt-1">
                                {{ formatTime(msg.createdAt) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Input -->
            <div class="p-2 border-t border-white/10 bg-[#0f172a]">
                <div class="flex items-end gap-2 bg-[#1e293b] p-1.5 rounded-lg border border-white/10">
                    <textarea 
                        v-model="newMessage"
                        @compositionstart="isComposing = true"
                        @compositionend="handleCompositionEnd"
                        @keydown.enter.exact.prevent="handleMessageEnter"
                        rows="1"
                        class="flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm max-h-20 text-white placeholder-slate-500"
                        placeholder="Write a message..."
                         style="min-height: 32px;"
                        :disabled="isReadOnly"
                    ></textarea>
                    <button 
                        @click="sendMessage"
                        :disabled="!newMessage.trim() || isReadOnly"
                        class="p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <SendIcon class="w-3 h-3" />
                    </button>
                </div>
                <div class="flex justify-between items-center mt-1 px-1">
                    <div class="flex gap-2">
                        <button class="text-slate-500 hover:text-slate-300"><ImageIcon class="w-4 h-4" /></button>
                        <button class="text-slate-500 hover:text-slate-300"><PaperclipIcon class="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { 
    X as XIcon, 
    Minus as MinusIcon, 
    Video as VideoIcon, 
    Phone as PhoneIcon,
    Image as ImageIcon,
    Paperclip as PaperclipIcon,
    Send as SendIcon
} from 'lucide-vue-next';
import { format } from 'date-fns';
import type { ChatMessage } from '@/types';

const props = defineProps<{
    roomId: string;
    minimized: boolean;
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();
const newMessage = ref('');
const isComposing = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const room = computed(() => chatStore.rooms.find(r => r.id === props.roomId));
const messages = computed(() => chatStore.messages[props.roomId] || []);
const nonSystemMessages = computed(() => messages.value.filter((msg) => msg.type !== 'SYSTEM'));
const isReadOnly = computed(() => chatStore.isRoomReadOnly(props.roomId));

const otherParticipantName = computed(() => {
    if (!room.value) return '알 수 없음';
    return chatStore.getOtherParticipantName(room.value);
});

function isMyMessage(msg: ChatMessage) {
    if (!authStore.user) return false;
    return chatStore.getMyParticipantIds().includes(msg.senderId);
}

function formatTime(date: Date) {
    return format(new Date(date), 'h:mm a');
}

function getFileUrl(message: ChatMessage) {
    const url = message.metadata?.fileUrl;
    return typeof url === 'string' && url.trim() ? url : '';
}

function getFileName(message: ChatMessage) {
    const fileName = message.metadata?.fileName;
    if (typeof fileName === 'string' && fileName.trim()) {
        return fileName;
    }
    return message.content || '파일';
}

const windowRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const isDocked = ref(true);

// Draggable Logic
import { useDraggable } from '@vueuse/core';

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
    // Initial sync just in case, though onStart handles the critical moment
    if (windowRef.value) {
        const rect = windowRef.value.getBoundingClientRect();
        x.value = rect.left;
        y.value = rect.top;
    }
});

const wasDragged = ref(false);

watch(isDragging, (newVal) => {
    if (newVal) {
        if (isDocked.value) isDocked.value = false;
        wasDragged.value = true;
    }
});

const dragStyle = computed(() => {
    if (isDocked.value) return {};
    return {
        position: 'fixed',
        left: `${x.value}px`,
        top: `${y.value}px`,
        zIndex: 100 // Ensure it's on top when dragged
    };
});

function toggleMinimize() {
    if (wasDragged.value) {
        wasDragged.value = false;
        return;
    }
    chatStore.minimizeDockedRoom(props.roomId, !props.minimized);
}

function closeWindow() {
    chatStore.closeDockedRoom(props.roomId);
}

function handleCompositionEnd() {
    isComposing.value = false;
}

function handleMessageEnter(event: KeyboardEvent) {
    if (event.isComposing || isComposing.value) {
        return;
    }
    sendMessage();
}

function sendMessage() {
    const content = newMessage.value.trim();
    if (!content) return;

    chatStore.sendMessage(content, 'TEXT', undefined, props.roomId);
    newMessage.value = '';
    scrollToBottom();
}

function scrollToBottom() {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
}

onMounted(scrollToBottom);
watch(messages, scrollToBottom, { deep: true });
</script>
