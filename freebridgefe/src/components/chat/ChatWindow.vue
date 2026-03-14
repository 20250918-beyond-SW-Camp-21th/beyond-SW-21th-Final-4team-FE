<template>
    <div class="flex flex-col h-full relative">
        <!-- Chat Header -->
        <div class="h-20 px-6 flex items-center justify-between bg-[#0f172a]/95 backdrop-blur-sm border-b border-white/5 shrink-0 z-20">
            <div class="flex items-center gap-4">
                <div class="relative">
                    <div class="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-lg font-bold border border-white/10 ring-2 ring-slate-900">
                        {{ otherParticipantName.charAt(0) }}
                    </div>
                </div>
                <div>
                    <h2 class="font-bold text-lg text-white leading-tight">{{ otherParticipantName }}</h2>
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
                 <button
                    @click="handleLeaveRoom"
                    class="w-10 h-10 rounded-full bg-[#111827] text-slate-300 hover:text-white hover:bg-[#0f172a] transition-colors border border-white/5 flex items-center justify-center"
                    title="대화 나가기"
                 >
                    <LogOutIcon class="w-5 h-5" />
                 </button>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 min-h-0 overflow-hidden relative bg-slate-900">
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
                    <div
                        v-else-if="isReadOnly"
                        class="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300"
                    >
                        상대방이 채팅방을 나갔습니다. 이 채팅은 읽기 전용입니다.
                    </div>
                    <div v-for="msg in messages" :key="msg.id">
                        <MessageBubble 
                            :message="msg" 
                            :senderName="getSenderName(msg.senderId)" 
                        />
                    </div>
                </div>

                <!-- Floating Input Area (Instagram Style) -->
                <div class="p-4 bg-slate-900/95 backdrop-blur-sm border-t border-white/5 shrink-0">
                    <div class="max-w-4xl mx-auto flex items-center gap-2">
                        <!-- Quick Actions (Left) -->
                        <label
                            class="p-2.5 rounded-full bg-slate-800 text-slate-400 transition-colors"
                            :class="isReadOnly ? 'cursor-not-allowed opacity-50 pointer-events-none' : 'hover:text-white hover:bg-slate-700 cursor-pointer'"
                        >
                            <PlusIcon class="w-6 h-6" />
                            <input
                                type="file"
                                class="hidden"
                                :disabled="isReadOnly"
                                @change="handleFileUpload"
                            />
                        </label>

                        <!-- Input Container (Pill) -->
                        <div class="flex-1 relative bg-slate-800 rounded-full border border-white/5 transition-colors flex items-center px-4 py-1.5 focus-within:bg-slate-700/50">
                            <textarea
                                :value="newMessage"
                                @input="(e) => newMessage = (e.target as HTMLInputElement).value"
                                @keydown.enter.exact.prevent="sendMessage"
                                rows="1"
                                placeholder="메시지를 입력하세요..."
                                class="flex-1 bg-transparent border-none focus:ring-0 outline-none resize-none py-2.5 h-[44px] max-h-[44px] min-h-[44px] overflow-y-auto text-white placeholder-slate-500 leading-relaxed custom-scrollbar text-[15px]"
                                :disabled="isReadOnly"
                            ></textarea>
                            
                            <!-- Business Action Icons inside Pill -->
                            <div class="flex items-center gap-1.5 ml-2" v-if="!newMessage.trim()"></div>
                            
                            <!-- Send Button (Show only when typing) -->
                            <button 
                                v-else
                                @click="sendMessage"
                                :disabled="isReadOnly"
                                class="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 transform active:scale-95 ml-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores/chatStore';
import { useContractStore } from '@/stores/contractStore';
import { useAuthStore } from '@/stores/authStore';
import MessageBubble from './MessageBubble.vue';
import ContractTab from './ContractTab.vue';
import { 
    FileText as FileTextIcon,
    LogOut as LogOutIcon,
    Send as SendIcon,
    Plus as PlusIcon
} from 'lucide-vue-next';

const props = defineProps<{
    roomId: string;
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();
const contractStore = useContractStore();
const router = useRouter();

const activeTab = ref<'CHAT' | 'CONTRACT'>('CHAT');
const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

const currentRoom = computed(() => chatStore.rooms.find(r => r.id === props.roomId));
const messages = computed(() => chatStore.messages[props.roomId] || []);
const nonSystemMessages = computed(() => messages.value.filter((msg) => msg.type !== 'SYSTEM'));
const isReadOnly = computed(() => chatStore.isRoomReadOnly(props.roomId));
const otherParticipantId = computed(() => {
    if (!currentRoom.value) return null;
    return chatStore.getOtherParticipantId(currentRoom.value) || null;
});

const otherParticipantName = computed(() => {
    if (!currentRoom.value) return '알 수 없음';
    return chatStore.getOtherParticipantName(currentRoom.value);
});

function parseParticipantNumericId(participantId: string | null) {
    if (!participantId) return null;
    const matchedParticipant = String(participantId).match(/^[efa](\d+)$/i);
    if (matchedParticipant) {
        return Number(matchedParticipant[1]);
    }
    const numericId = Number(participantId);
    return Number.isFinite(numericId) ? numericId : null;
}

const roomContract = computed(() => {
    const linkedContract = contractStore.findContractByAnyId(currentRoom.value?.contractId);
    if (linkedContract) return linkedContract;
    if (!authStore.user || !otherParticipantId.value) return null;

    const myUserId = Number(authStore.user.id);
    const counterpartId = parseParticipantNumericId(otherParticipantId.value);
    if (!Number.isFinite(myUserId) || !Number.isFinite(counterpartId)) return null;

    const employerId = authStore.user.role === 'EMPLOYER' ? myUserId : counterpartId;
    const freelancerId = authStore.user.role === 'FREELANCER' ? myUserId : counterpartId;

    return contractStore.findContractByParticipants(employerId, freelancerId);
});

const contractNeedsAttention = computed(() => {
    if (!authStore.user) return false;
    const contract = roomContract.value;
    if (!contract || contract.status !== 'WAITING_SIGNATURE') return false;
    if (authStore.user.role === 'EMPLOYER') {
        return !contract.employerSignedDate;
    }
    return !contract.freelancerSignedDate;
});

const shouldLoadContracts = computed(() => {
    if (!currentRoom.value) return false;
    if (activeTab.value === 'CONTRACT') return true;
    if (currentRoom.value.contractId) return true;
    return messages.value.some((message) => message.type === 'CONTRACT_ALERT');
});

const shouldRefreshContracts = computed(() => {
    if (!shouldLoadContracts.value) return false;
    if (!contractStore.hasFetchedContracts) return true;
    if (currentRoom.value?.contractId && !contractStore.findContractByAnyId(currentRoom.value.contractId)) {
        return true;
    }

    return messages.value.some((message) => {
        if (message.type !== 'CONTRACT_ALERT') return false;
        const contractId = message.metadata?.contractId;
        return !!contractId && !contractStore.findContractByAnyId(contractId);
    });
});

function handleLeaveRoom() {
    if (!props.roomId) return;
    if (!confirm('이 채팅방에서 나가시겠습니까?')) return;
    chatStore.leaveRoom(props.roomId);
    router.push('/chat');
}

function getSenderName(senderId: string) {
    if (senderId === 'SYSTEM') return 'System';
    if (!currentRoom.value) return '알 수 없음';
    return chatStore.getParticipantName(currentRoom.value, senderId) || '알 수 없음';
}

function sendMessage() {
    if (!newMessage.value.trim()) return;
    chatStore.sendMessage(newMessage.value, 'TEXT', undefined, props.roomId);
    newMessage.value = '';
    scrollToBottom();
}

function handleFileUpload(event: Event) {
    if (isReadOnly.value) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    chatStore.sendMessage(
        file.name,
        'FILE',
        { fileName: file.name, fileSize: file.size, fileType: file.type },
        props.roomId
    );

    input.value = '';
    scrollToBottom();
}

function scrollToBottom() {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
}

async function fetchContractsForChat() {
    try {
        await contractStore.fetchContracts();
    } catch (error) {
        console.error('Failed to refresh contracts for chat:', error);
    }
}

async function ensureContractsLoadedForChat() {
    if (!shouldLoadContracts.value) return;
    try {
        if (shouldRefreshContracts.value) {
            await fetchContractsForChat();
            return;
        }
        await contractStore.ensureContractsLoaded();
    } catch (error) {
        console.error('Failed to load contracts for chat:', error);
    }
}

// Scroll to bottom on mount and when messages change
onMounted(() => {
    scrollToBottom();
    void ensureContractsLoadedForChat();
});
watch(messages, scrollToBottom, { deep: true });
watch(shouldRefreshContracts, (nextShouldRefreshContracts) => {
    if (!nextShouldRefreshContracts) return;
    void fetchContractsForChat();
}, { immediate: true });

watch(
    () => props.roomId,
    () => {
        activeTab.value = 'CHAT';
    }
);
</script>
