<template>
    <div class="flex flex-col h-full relative">
        <!-- Chat Header -->
        <div class="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white shrink-0 z-20">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {{ otherParticipantName.charAt(0) }}
                </div>
                <div>
                    <h2 class="font-bold text-gray-900">{{ otherParticipantName }}</h2>
                    <p class="text-xs text-green-600 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> 온라인
                    </p>
                </div>
            </div>

            <!-- Tabs Switcher -->
            <div class="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    @click="activeTab = 'CHAT'"
                    :class="['px-4 py-1.5 text-sm font-medium rounded-md transition-all', activeTab === 'CHAT' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                >
                    채팅
                </button>
                <button 
                    @click="activeTab = 'CONTRACT'"
                    :class="['px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5', activeTab === 'CONTRACT' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                >
                    <FileTextIcon class="w-3.5 h-3.5" /> 계약
                    <!-- Notification Dot if contract needs attention -->
                    <span v-if="contractNeedsAttention" class="w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
            </div>
            
            <!-- Buttons Removed -->
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 overflow-hidden relative bg-white">
            <!-- Tab: CHAT -->
            <div v-show="activeTab === 'CHAT'" class="h-full flex flex-col">
                <!-- Messages List -->
                <div class="flex-1 overflow-y-auto p-6" ref="messagesContainer">
                    <div v-for="msg in messages" :key="msg.id">
                        <MessageBubble 
                            :message="msg" 
                            :senderName="getSenderName(msg.senderId)" 
                        />
                    </div>
                </div>

                <!-- Input Area -->
                <div class="p-4 border-t border-gray-200 bg-white">
                    <div class="flex items-end gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                        <button class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <PaperclipIcon class="w-5 h-5" />
                        </button>
                        <textarea
                            v-model="newMessage"
                            @keydown.enter.prevent="sendMessage"
                            rows="1"
                            placeholder="메시지를 입력하세요..."
                            class="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-1 max-h-32 text-sm"
                            style="min-height: 40px;"
                        ></textarea>
                         <button 
                            @click="sendMessage"
                            :disabled="!newMessage.trim()"
                            class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <SendIcon class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Tab: CONTRACT -->
            <div v-show="activeTab === 'CONTRACT'" class="h-full">
                <ContractTab :roomId="roomId" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import MessageBubble from './MessageBubble.vue';
import ContractTab from './ContractTab.vue';
import { 
    FileText as FileTextIcon, 
    Phone as PhoneIcon, 
    Video as VideoIcon, 
    MoreHorizontal as MoreHorizontalIcon,
    Paperclip as PaperclipIcon,
    Send as SendIcon
} from 'lucide-vue-next';

const props = defineProps<{
    roomId: string;
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();

const activeTab = ref<'CHAT' | 'CONTRACT'>('CHAT');
const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

const currentRoom = computed(() => chatStore.rooms.find(r => r.id === props.roomId));
const messages = computed(() => chatStore.messages[props.roomId] || []);

const otherParticipantName = computed(() => {
    if (!currentRoom.value || !authStore.user) return 'Unknown';
    const myPrefix = authStore.user.role === 'EMPLOYER' ? 'e' : 'f';
    const myFullId = `${myPrefix}${authStore.user.id}`;
    const otherId = currentRoom.value.participants.find(id => id !== myFullId);
    return otherId ? currentRoom.value.participantNames[otherId] : '알 수 없음';
});

const contractNeedsAttention = computed(() => {
    // Logic to check if contract needs signature
    return false; // Implement based on contractStore
});

function getSenderName(senderId: string) {
    if (senderId === 'SYSTEM') return 'System';
    return currentRoom.value?.participantNames[senderId] || 'Unknown';
}

function sendMessage() {
    if (!newMessage.value.trim()) return;
    chatStore.sendMessage(newMessage.value);
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

// Scroll to bottom on mount and when messages change
onMounted(scrollToBottom);
watch(messages, scrollToBottom, { deep: true });
</script>
