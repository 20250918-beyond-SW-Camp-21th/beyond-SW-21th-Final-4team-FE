<template>
    <div class="flex flex-col h-full relative">
        <!-- Chat Header -->
        <div class="h-20 px-6 flex items-center justify-between bg-[#0f172a]/95 backdrop-blur-sm border-b border-white/5 shrink-0 z-20">
            <div class="flex items-center gap-4">
                <div class="relative">
                    <div class="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-lg font-bold border border-white/10 ring-2 ring-slate-900">
                        {{ otherParticipantName.charAt(0) }}
                    </div>
                    <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                    <h2 class="font-bold text-lg text-white leading-tight">{{ otherParticipantName }}</h2>
                    <p class="text-xs text-emerald-500 flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit mt-0.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 온라인
                    </p>
                </div>
            </div>

            <!-- Tabs Switcher (Pill Style) -->
            <div class="flex bg-slate-900 p-1 rounded-full border border-white/5">
                <button 
                    @click="activeTab = 'CHAT'"
                    :class="['px-5 py-2 text-sm font-medium rounded-full transition-all', activeTab === 'CHAT' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200']"
                >
                    채팅
                </button>
                <button 
                    @click="activeTab = 'CONTRACT'"
                    :class="['px-5 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-2', activeTab === 'CONTRACT' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200']"
                >
                    <FileTextIcon class="w-4 h-4" /> 계약
                    <span v-if="contractNeedsAttention" class="w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
            </div>
            
            <div class="flex gap-2">
                 <button class="p-2.5 rounded-full bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border border-white/5">
                    <PhoneIcon class="w-5 h-5" />
                 </button>
                 <button class="p-2.5 rounded-full bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border border-white/5">
                    <VideoIcon class="w-5 h-5" />
                 </button>
                 <button class="p-2.5 rounded-full bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border border-white/5">
                    <MoreHorizontalIcon class="w-5 h-5" />
                 </button>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 overflow-hidden relative bg-slate-900">
            <!-- Tab: CHAT -->
            <div v-show="activeTab === 'CHAT'" class="h-full flex flex-col min-h-0">
                <!-- Messages List -->
                <div class="flex-1 min-h-0 overflow-y-auto p-6" ref="messagesContainer">
                    <div
                        v-if="nonSystemMessages.length === 0"
                        class="h-full min-h-[220px] flex items-center justify-center text-slate-400 text-sm"
                    >
                        새로운 대화를 시작해보세요.
                    </div>
                    <div v-for="msg in messages" :key="msg.id">
                        <MessageBubble 
                            :message="msg" 
                            :senderName="getSenderName(msg.senderId)" 
                        />
                    </div>
                </div>

                <!-- Floating Input Area (Instagram Style) -->
                <div class="p-4 bg-slate-900">
                    <div class="max-w-4xl mx-auto flex items-center gap-2">
                        <!-- Quick Actions (Left) -->
                        <button class="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                            <PlusIcon class="w-6 h-6" />
                        </button>

                        <!-- Input Container (Pill) -->
                        <div class="flex-1 relative bg-slate-800 rounded-full border border-white/5 transition-colors flex items-center px-4 py-1.5 focus-within:bg-slate-700/50">
                            <textarea
                                :value="newMessage"
                                @input="(e) => newMessage = (e.target as HTMLInputElement).value"
                                @keydown.enter.exact.prevent="sendMessage"
                                rows="1"
                                placeholder="메시지를 입력하세요..."
                                class="flex-1 bg-transparent border-none focus:ring-0 outline-none resize-none py-2.5 max-h-32 min-h-[44px] text-white placeholder-slate-500 leading-relaxed custom-scrollbar text-[15px]"
                            ></textarea>
                            
                            <!-- Business Action Icons inside Pill -->
                            <div class="flex items-center gap-1.5 ml-2" v-if="!newMessage.trim()">
                                <button class="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors" title="Request Contract">
                                    <FileTextIcon class="w-5 h-5" />
                                </button>
                                <button class="p-1.5 text-slate-400 hover:text-blue-400 transition-colors" title="Schedule Briefing">
                                    <CalendarIcon class="w-5 h-5" />
                                </button>
                                <button class="p-1.5 text-slate-400 hover:text-yellow-400 transition-colors" title="Discuss Settlement">
                                    <DollarSignIcon class="w-5 h-5" />
                                </button>
                            </div>
                            
                            <!-- Send Button (Show only when typing) -->
                            <button 
                                v-else
                                @click="sendMessage"
                                class="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 transform active:scale-95 ml-1 flex items-center justify-center"
                            >
                                <SendIcon class="w-4 h-4" />
                            </button>
                        </div>
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
import { useContractStore } from '@/stores/contractStore';
import { useAuthStore } from '@/stores/authStore';
import MessageBubble from './MessageBubble.vue';
import ContractTab from './ContractTab.vue';
import { 
    FileText as FileTextIcon, 
    Phone as PhoneIcon, 
    Video as VideoIcon, 
    MoreHorizontal as MoreHorizontalIcon,
    Paperclip as PaperclipIcon,
    Send as SendIcon,
    Calendar as CalendarIcon,
    DollarSign as DollarSignIcon,
    Plus as PlusIcon
} from 'lucide-vue-next';

const props = defineProps<{
    roomId: string;
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();
const contractStore = useContractStore();

const activeTab = ref<'CHAT' | 'CONTRACT'>('CHAT');
const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

const currentRoom = computed(() => chatStore.rooms.find(r => r.id === props.roomId));
const messages = computed(() => chatStore.messages[props.roomId] || []);
const nonSystemMessages = computed(() => messages.value.filter((msg) => msg.type !== 'SYSTEM'));

const otherParticipantName = computed(() => {
    if (!currentRoom.value || !authStore.user) return 'Unknown';
    const otherId = chatStore.getOtherParticipantId(currentRoom.value);
    return otherId ? (currentRoom.value.participantNames[otherId] || '알 수 없음') : '알 수 없음';
});

const contractNeedsAttention = computed(() => {
    if (!currentRoom.value || !authStore.user) return false;
    const contractId = currentRoom.value.contractId;
    if (!contractId) return false;
    const contract = contractStore.contracts.find((c) => c.id === contractId);
    if (!contract || contract.status !== 'WAITING_SIGNATURE') return false;
    if (authStore.user.role === 'EMPLOYER') {
        return !contract.employerSignedDate;
    }
    return !contract.freelancerSignedDate;
});

function getSenderName(senderId: string) {
    if (senderId === 'SYSTEM') return 'System';
    return currentRoom.value?.participantNames[senderId] || 'Unknown';
}

function sendMessage() {
    if (!newMessage.value.trim()) return;
    chatStore.sendMessage(newMessage.value, 'TEXT', undefined, props.roomId);
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

watch(
    () => props.roomId,
    () => {
        activeTab.value = 'CHAT';
    }
);
</script>
