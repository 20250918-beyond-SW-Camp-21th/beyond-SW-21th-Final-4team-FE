<template>
    <div class="h-full bg-slate-900 border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar">
        <!-- Profile Section -->
        <div class="p-6 flex flex-col items-center text-center border-b border-white/5">
            <div class="relative mb-4">
                <div class="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-3xl font-bold border-4 border-slate-800 ring-2 ring-emerald-500/50">
                    {{ otherParticipantName.charAt(0) }}
                </div>
                <span class="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-slate-900 rounded-full"></span>
            </div>
            
            <h2 class="text-xl font-bold text-white mb-1">{{ otherParticipantName }}</h2>
            <p class="text-sm text-slate-400 mb-4">시니어 프론트엔드 개발자</p>
            
            <div class="flex gap-2 w-full">
                <button class="flex-1 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-white/5">
                    프로필
                </button>
                <button class="flex-1 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-lg shadow-emerald-900/20">
                    채용하기
                </button>
            </div>
        </div>

        <!-- Contract Project Summary -->
        <div class="p-6 border-b border-white/5">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-white uppercase tracking-wider">진행 중인 프로젝트</h3>
                <button class="text-xs text-blue-400 hover:text-blue-300">전체 보기</button>
            </div>
            
            <div class="bg-slate-800/50 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                <div class="flex justify-between items-start mb-2">
                    <div class="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <CodeIcon class="w-5 h-5" />
                    </div>
                    <span class="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        진행중
                    </span>
                </div>
                
                <h4 class="font-bold text-slate-200 mb-1 group-hover:text-white transition-colors">모바일 앱 디자인 개편</h4>
                <p class="text-xs text-slate-500 mb-4">마감일: 2024년 10월 24일</p>
                
                <div class="space-y-1.5">
                    <div class="flex justify-between text-xs text-slate-400">
                        <span>진행률</span>
                        <span>65%</span>
                    </div>
                    <div class="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-500 w-[65%] rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Shared Files -->
        <div class="p-6">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-4">공유된 파일</h3>
            <div class="space-y-3">
                <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div class="p-2 rounded bg-slate-800 text-slate-400 group-hover:text-emerald-400 transition-colors">
                        <FileTextIcon class="w-5 h-5" />
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <p class="text-sm text-slate-300 font-medium truncate group-hover:text-white">계약서_초안_v2.pdf</p>
                        <p class="text-xs text-slate-500">2.4 MB • 오늘</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div class="p-2 rounded bg-slate-800 text-slate-400 group-hover:text-blue-400 transition-colors">
                        <ImageIcon class="w-5 h-5" />
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <p class="text-sm text-slate-300 font-medium truncate group-hover:text-white">디자인_시스템.fig</p>
                        <p class="text-xs text-slate-500">14.2 MB • 어제</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { 
    Code as CodeIcon,
    FileText as FileTextIcon,
    Image as ImageIcon
} from 'lucide-vue-next';

const props = defineProps<{
    roomId: string;
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();

const currentRoom = computed(() => chatStore.rooms.find(r => r.id === props.roomId));

const otherParticipantName = computed(() => {
    if (!currentRoom.value || !authStore.user) return 'Unknown';
    const myFullId = String(authStore.user.id);
    const otherId = currentRoom.value.participants.find(id => id !== myFullId);
    return otherId ? currentRoom.value.participantNames[otherId] : '알 수 없음';
});
</script>
