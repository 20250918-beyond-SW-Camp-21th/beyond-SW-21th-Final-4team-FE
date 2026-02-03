<script setup lang="ts">
import { ref } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  ArrowLeft,
  Camera,
  Briefcase,
  FileText,
  Calendar,
  Plus,
  Trash2,
  Code,
  GraduationCap,
  Edit2,
  Download,
  Award
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const authStore = useAuthStore();
const currentUser = authStore.user;

const isEditing = ref(false);
const newSkill = ref('');
const avatarPreview = ref<string | null>(null); // In real app, use user's avatar

// Mock Data initialized from user
const profileData = ref({
    name: currentUser?.name || '',
    title: 'Senior Frontend Developer',
    email: currentUser?.email || '',
    phone: '010-1234-5678',
    location: 'Seoul, Korea',
    intro: '안녕하세요. 5년차 프론트엔드 개발자입니다. React와 TypeScript를 주력으로 하며, 사용자 경험 중심의 UI/UX 구현에 강점이 있습니다.',
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Node.js', 'Next.js'],
    education: [
        { id: 1, period: '1987.03 - 1989.02', school: 'KAIST대학원(석사)', major: '컴퓨터공학' },
        { id: 2, period: '1983.03 - 1987.02', school: '연세대학교(4년)', major: '전자공학' },
    ],
    experience: [
        { id: 1, period: '2023.05 - 2023.12', company: 'LG전자', role: '프론트엔드 개발', description: 'React 기반 웹 애플리케이션 개발 및 유지보수' },
        { id: 2, period: '2023.02 - 2023.04', company: '에스원', role: '웹 고도화', description: 'UI/UX 개선 및 성능 최적화' },
    ],
    certifications: [
        { id: 1, name: '정보처리기사', issuer: '한국산업인력공단', date: '2020.08' },
    ]
});

const handleSave = () => {
    alert('이력서 정보가 저장되었습니다.');
    isEditing.value = false;
};

const handleAvatarChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            avatarPreview.value = e.target?.result as string;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

const addSkill = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.value.trim()) {
        if (!profileData.value.skills.includes(newSkill.value.trim())) {
            profileData.value.skills.push(newSkill.value.trim());
        }
        newSkill.value = '';
    }
};

const removeSkill = (skillToRemove: string) => {
    profileData.value.skills = profileData.value.skills.filter(s => s !== skillToRemove);
};
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 md:px-8 py-8 font-sans text-white">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
            <button
                @click="$emit('back')"
                class="p-2 hover:bg-white/5 rounded-lg transition-colors"
                v-motion
                :hover="{ scale: 1.1 }"
                :tap="{ scale: 0.9 }"
            >
                <ArrowLeft class="w-5 h-5 text-white/60" />
            </button>
            <div>
                <h1 class="text-2xl font-bold text-white">이력서 관리</h1>
                <p class="text-sm text-slate-400 mt-1">프로필 정보를 관리하고 이력서를 다운로드하세요</p>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <button
                @click="alert('PDF 다운로드 기능 (준비중)')"
                class="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10 flex items-center gap-2"
            >
                <Download class="w-4 h-4" />
                PDF 다운로드
            </button>
            <button
                v-if="isEditing"
                @click="handleSave"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
                <Save class="w-4 h-4" />
                저장하기
            </button>
            <button
                v-else
                @click="isEditing = true"
                class="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10 flex items-center gap-2"
            >
                <Edit2 class="w-4 h-4" />
                수정하기
            </button>
        </div>
    </div>

    <!-- Resume Content -->
    <div class="space-y-6">
        <!-- Basic Info Section -->
        <div
            class="bg-white/5 rounded-2xl border border-white/10 p-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
        >
            <div class="flex items-start gap-8 flex-col md:flex-row">
                <!-- Avatar -->
                <div class="relative group flex-shrink-0 mx-auto md:mx-0">
                    <div class="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5 relative">
                        <img v-if="avatarPreview" :src="avatarPreview" alt="Profile" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <User class="w-10 h-10 text-white/20" />
                        </div>
                        <label v-if="isEditing" class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <Camera class="w-5 h-5 text-white" />
                            <input type="file" class="hidden" accept="image/*" @change="handleAvatarChange" />
                        </label>
                    </div>
                </div>

                <!-- Basic Info -->
                <div class="flex-1 space-y-4 w-full">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">이름</label>
                            <input
                                v-if="isEditing"
                                type="text"
                                v-model="profileData.name"
                                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500/50"
                            />
                            <p v-else class="text-white font-medium">{{ profileData.name }}</p>
                        </div>
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">직무</label>
                            <input
                                v-if="isEditing"
                                type="text"
                                v-model="profileData.title"
                                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500/50"
                            />
                            <p v-else class="text-white font-medium">{{ profileData.title }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">이메일</label>
                            <div v-if="isEditing" class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                <Mail class="w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    v-model="profileData.email"
                                    class="bg-transparent border-none outline-none w-full text-white text-sm"
                                />
                            </div>
                            <p v-else class="text-white flex items-center gap-2">
                                <Mail class="w-4 h-4 text-slate-400" />
                                {{ profileData.email }}
                            </p>
                        </div>
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">연락처</label>
                            <div v-if="isEditing" class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                <Phone class="w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    v-model="profileData.phone"
                                    class="bg-transparent border-none outline-none w-full text-white text-sm"
                                />
                            </div>
                            <p v-else class="text-white flex items-center gap-2">
                                <Phone class="w-4 h-4 text-slate-400" />
                                {{ profileData.phone }}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label class="text-xs text-slate-500 mb-1 block">활동 지역</label>
                        <div v-if="isEditing" class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                            <MapPin class="w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                v-model="profileData.location"
                                class="bg-transparent border-none outline-none w-full text-white text-sm"
                            />
                        </div>
                        <p v-else class="text-white flex items-center gap-2">
                            <MapPin class="w-4 h-4 text-slate-400" />
                            {{ profileData.location }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Introduction -->
        <div
            class="bg-white/5 rounded-2xl border border-white/10 p-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
        >
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User class="w-5 h-5 text-blue-400" />
                자기소개
            </h2>
            <textarea
                v-if="isEditing"
                v-model="profileData.intro"
                class="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 resize-none"
                placeholder="본인의 강점과 경험을 자유롭게 작성해주세요."
            ></textarea>
            <p v-else class="text-slate-300 leading-relaxed">{{ profileData.intro }}</p>
        </div>

        <!-- Skills -->
        <div
            class="bg-white/5 rounded-2xl border border-white/10 p-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
        >
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Code class="w-5 h-5 text-purple-400" />
                보유 스킬
            </h2>
            <div class="flex flex-wrap gap-2 mb-4">
                <span
                    v-for="skill in profileData.skills"
                    :key="skill"
                    class="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/30 flex items-center gap-2"
                >
                    {{ skill }}
                    <button v-if="isEditing" @click="removeSkill(skill)" class="hover:text-white">
                        <Trash2 class="w-3 h-3" />
                    </button>
                </span>
            </div>
            <input
                v-if="isEditing"
                type="text"
                v-model="newSkill"
                @keydown="addSkill"
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-blue-500/50"
                placeholder="스킬을 입력하고 Enter를 누르세요"
            />
        </div>

        <!-- Experience -->
        <div
            class="bg-white/5 rounded-2xl border border-white/10 p-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
        >
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Briefcase class="w-5 h-5 text-orange-400" />
                경력
            </h2>
            <div class="space-y-4">
                <div v-for="exp in profileData.experience" :key="exp.id" class="border-l-2 border-blue-500/30 pl-6 pb-4 relative">
                    <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#1e293b]"></div>
                    <div class="flex items-start justify-between mb-2">
                        <div>
                            <h3 class="text-white font-bold">{{ exp.company }}</h3>
                            <p class="text-sm text-blue-400">{{ exp.role }}</p>
                        </div>
                        <span class="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">{{ exp.period }}</span>
                    </div>
                    <p class="text-sm text-slate-400">{{ exp.description }}</p>
                </div>
                <button
                    v-if="isEditing"
                     class="w-full py-3 border border-dashed border-white/20 rounded-lg text-white/40 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus class="w-4 h-4" /> 경력 추가
                </button>
            </div>
        </div>

        <!-- Education -->
        <div
            class="bg-white/5 rounded-2xl border border-white/10 p-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
        >
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <GraduationCap class="w-5 h-5 text-green-400" />
                학력
            </h2>
             <div class="space-y-3">
                <div v-for="edu in profileData.education" :key="edu.id" class="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/5">
                    <div>
                        <h3 class="font-medium text-white">{{ edu.school }}</h3>
                        <p class="text-sm text-slate-400">{{ edu.major }}</p>
                    </div>
                    <span class="text-sm text-slate-500">{{ edu.period }}</span>
                </div>
                 <button
                    v-if="isEditing"
                     class="w-full py-3 border border-dashed border-white/20 rounded-lg text-white/40 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus class="w-4 h-4" /> 학력 추가
                </button>
            </div>
        </div>

        <!-- Certifications -->
        <div
            class="bg-white/5 rounded-2xl border border-white/10 p-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
        >
             <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award class="w-5 h-5 text-yellow-400" />
                자격증
            </h2>
             <div class="space-y-3">
                <div v-for="cert in profileData.certifications" :key="cert.id" class="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/5">
                    <div>
                        <h3 class="font-medium text-white">{{ cert.name }}</h3>
                        <p class="text-sm text-slate-400">{{ cert.issuer }}</p>
                    </div>
                    <span class="text-sm text-slate-500">{{ cert.date }}</span>
                </div>
                <button
                    v-if="isEditing"
                     class="w-full py-3 border border-dashed border-white/20 rounded-lg text-white/40 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus class="w-4 h-4" /> 자격증 추가
                </button>
            </div>
        </div>
    </div>
  </div>
</template>
