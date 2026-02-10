<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
    ArrowLeft,
    Save,
    User,
    Calendar,
    Phone,
    Mail,
    MapPin,
    GraduationCap,
    Plus,
    Trash2,
    Briefcase,
    Award,
    Check
} from 'lucide-vue-next';
import {
    getResumeDetail,
    saveResumeDetail,
    type ResumeDetail,
    type Education,
    type Career,
    type Certification
} from '@/api/MyPage/resumeApi';
import { useAuthStore } from '@/stores/authStore';

const emit = defineEmits<{
    (e: 'back'): void;
}>();

const authStore = useAuthStore();

// --- State ---
const resumeData = ref<ResumeDetail>({
    id: 0,
    name: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    educations: [],
    careers: [],
    certifications: []
});

const isLoading = ref(true);

// --- Temporary State for Adding Items ---
const isAddingEducation = ref(false);
const newEducation = ref<Education>({
    id: 0,
    schoolType: '대학교',
    schoolName: '',
    major: '',
    status: '졸업',
    entranceDate: '',
    graduationDate: ''
});

const isAddingCareer = ref(false);
const newCareer = ref<Career>({
    id: 0,
    companyName: '',
    department: '',
    position: '',
    jobType: '',
    employmentType: '정규직',
    startDate: '',
    endDate: '',
    description: ''
});

const isAddingCertification = ref(false);
const newCertification = ref<Certification>({
    id: 0,
    name: '',
    issuer: '',
    acquisitionDate: ''
});

// --- Actions ---

onMounted(async () => {
    try {
        isLoading.value = true;
        resumeData.value = await getResumeDetail(authStore.user?.id || 1);
    } catch (e) {
        console.error(e);
        alert('이력서 데이터를 불러오는데 실패했습니다.');
    } finally {
        isLoading.value = false;
    }
});

const handleSave = async () => {
    try {
        const success = await saveResumeDetail(resumeData.value);
        if (success) {
            alert('이력서 정보가 저장되었습니다.');
        }
    } catch (e) {
        alert('저장 중 오류가 발생했습니다.');
    }
};

// --- Education Actions ---
const addEducation = () => {
    if (!newEducation.value.schoolName) return alert('학교명을 입력해주세요.');
    resumeData.value.educations.push({ ...newEducation.value, id: Date.now() });
    
    // Reset
    newEducation.value = {
        id: 0,
        schoolType: '대학교',
        schoolName: '',
        major: '',
        status: '졸업',
        entranceDate: '',
        graduationDate: ''
    };
    isAddingEducation.value = false;
};

const removeEducation = (index: number) => {
    if (confirm('삭제하시겠습니까?')) {
        resumeData.value.educations.splice(index, 1);
    }
};

// --- Career Actions ---
const addCareer = () => {
    if (!newCareer.value.companyName) return alert('회사명을 입력해주세요.');
    resumeData.value.careers.push({ ...newCareer.value, id: Date.now() });

    // Reset
    newCareer.value = {
        id: 0,
        companyName: '',
        department: '',
        position: '',
        jobType: '',
        employmentType: '정규직',
        startDate: '',
        endDate: '',
        description: ''
    };
    isAddingCareer.value = false;
};

const removeCareer = (index: number) => {
    if (confirm('삭제하시겠습니까?')) {
        resumeData.value.careers.splice(index, 1);
    }
};

// --- Certification Actions ---
const addCertification = () => {
    if (!newCertification.value.name) return alert('자격증명을 입력해주세요.');
    resumeData.value.certifications.push({ ...newCertification.value, id: Date.now() });

    // Reset
    newCertification.value = {
        id: 0,
        name: '',
        issuer: '',
        acquisitionDate: ''
    };
    isAddingCertification.value = false;
};

const removeCertification = (index: number) => {
    if (confirm('삭제하시겠습니까?')) {
        resumeData.value.certifications.splice(index, 1);
    }
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
                    <h1 class="text-2xl font-bold text-white">이력서 상세 관리</h1>
                    <p class="text-sm text-slate-400 mt-1">기본 정보와 상세 경력을 관리하세요.</p>
                </div>
            </div>
            <button
                @click="handleSave"
                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
                <Save class="w-4 h-4" />
                저장하기
            </button>
        </div>

        <div v-if="isLoading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>

        <div v-else class="space-y-6">
            <!-- 1. 기본 정보 (Basic Info) -->
            <div class="bg-white/5 rounded-2xl border border-white/10 p-8">
                <h2 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <User class="w-5 h-5 text-blue-400" />
                    기본 정보
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="text-xs text-slate-500 mb-1.5 block">이름</label>
                        <input
                            type="text"
                            v-model="resumeData.name"
                            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label class="text-xs text-slate-500 mb-1.5 block">생년월일</label>
                        <div class="relative">
                            <input
                                type="date"
                                v-model="resumeData.birthDate"
                                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors"
                            />
                            <!-- Custom Calendar Icon overlay could go here if needed -->
                        </div>
                    </div>
                    <div>
                        <label class="text-xs text-slate-500 mb-1.5 block">연락처</label>
                        <div class="relative">
                            <Phone class="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                            <input
                                type="tel"
                                v-model="resumeData.phone"
                                class="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors"
                                placeholder="010-0000-0000"
                            />
                        </div>
                    </div>
                    <div>
                        <label class="text-xs text-slate-500 mb-1.5 block">이메일</label>
                        <div class="relative">
                            <Mail class="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                            <input
                                type="email"
                                v-model="resumeData.email"
                                class="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                    </div>
                    <div class="md:col-span-2">
                        <label class="text-xs text-slate-500 mb-1.5 block">주소</label>
                        <div class="relative">
                            <MapPin class="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                            <input
                                type="text"
                                v-model="resumeData.address"
                                class="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. 학력 사항 (Education) -->
            <div class="bg-white/5 rounded-2xl border border-white/10 p-8">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-bold text-white flex items-center gap-2">
                        <GraduationCap class="w-5 h-5 text-green-400" />
                        학력 사항
                    </h2>
                    <button 
                        v-if="!isAddingEducation"
                        @click="isAddingEducation = true"
                        class="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-slate-300 transition-colors flex items-center gap-1"
                    >
                        <Plus class="w-3 h-3" /> 추가
                    </button>
                </div>

                <!-- Education List -->
                <div class="space-y-3 mb-4">
                    <div 
                        v-for="(edu, index) in resumeData.educations" 
                        :key="edu.id" 
                        class="bg-white/5 p-5 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-white/10 transition-colors"
                    >
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20">{{ edu.schoolType }}</span>
                                <span class="text-xs text-slate-500">{{ edu.status }}</span>
                            </div>
                            <h3 class="font-bold text-white text-lg">{{ edu.schoolName }}</h3>
                            <p class="text-sm text-slate-400">{{ edu.major }}</p>
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="text-sm text-slate-500 font-mono">{{ edu.entranceDate }} ~ {{ edu.graduationDate }}</span>
                            <button @click="removeEducation(index)" class="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Add Education Form -->
                <div v-if="isAddingEducation" class="bg-white/5 p-5 rounded-xl border border-green-500/30 animate-in fade-in slide-in-from-top-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">학교 구분</label>
                            <select v-model="newEducation.schoolType" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
                                <option value="고등학교">고등학교</option>
                                <option value="대학교">대학교</option>
                                <option value="대학원">대학원</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">학교명</label>
                            <input type="text" v-model="newEducation.schoolName" placeholder="학교명 입력" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        </div>
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">전공</label>
                            <input type="text" v-model="newEducation.major" placeholder="전공 입력" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        </div>
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">상태</label>
                            <select v-model="newEducation.status" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
                                <option value="졸업">졸업</option>
                                <option value="재학">재학</option>
                                <option value="수료">수료</option>
                                <option value="휴학">휴학</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="text-xs text-slate-500 mb-1 block">입학년월</label>
                                <input type="text" v-model="newEducation.entranceDate" placeholder="YYYY.MM" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                            </div>
                            <div>
                                <label class="text-xs text-slate-500 mb-1 block">졸업년월</label>
                                <input type="text" v-model="newEducation.graduationDate" placeholder="YYYY.MM" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button @click="isAddingEducation = false" class="px-3 py-1.5 text-xs text-slate-400 hover:text-white">취소</button>
                        <button @click="addEducation" class="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg font-bold">추가 완료</button>
                    </div>
                </div>
            </div>

            <!-- 3. 경력 사항 (Career) -->
            <div class="bg-white/5 rounded-2xl border border-white/10 p-8">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-bold text-white flex items-center gap-2">
                        <Briefcase class="w-5 h-5 text-orange-400" />
                        경력 사항
                    </h2>
                    <button 
                        v-if="!isAddingCareer"
                        @click="isAddingCareer = true"
                        class="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-slate-300 transition-colors flex items-center gap-1"
                    >
                        <Plus class="w-3 h-3" /> 추가
                    </button>
                </div>

                <div class="space-y-4 mb-4">
                    <div 
                        v-for="(career, index) in resumeData.careers" 
                        :key="career.id" 
                        class="relative pl-6 pb-4 border-l-2 border-white/10 last:border-0 last:pb-0 group"
                    >
                        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500 border-4 border-[#1e293b]"></div>
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-bold text-white text-lg mb-0.5">{{ career.companyName }}</h3>
                                <p class="text-sm text-orange-400 mb-2">{{ career.department }} / {{ career.position }} ({{ career.employmentType }})</p>
                                <p class="text-sm text-slate-300">{{ career.jobType }}</p>
                                <p class="text-xs text-slate-500 mt-2 leading-relaxed">{{ career.description }}</p>
                            </div>
                            <div class="flex flex-col items-end gap-2">
                                <span class="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">{{ career.startDate }} ~ {{ career.endDate }}</span>
                                <button @click="removeCareer(index)" class="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add Career Form -->
                <div v-if="isAddingCareer" class="bg-white/5 p-5 rounded-xl border border-orange-500/30 animate-in fade-in slide-in-from-top-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div class="col-span-1 md:col-span-2">
                            <label class="text-xs text-slate-500 mb-1 block">회사명</label>
                            <input type="text" v-model="newCareer.companyName" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        </div>
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">부서</label>
                            <input type="text" v-model="newCareer.department" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        </div>
                         <div>
                            <label class="text-xs text-slate-500 mb-1 block">직위/직책</label>
                            <input type="text" v-model="newCareer.position" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        </div>
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">고용 형태</label>
                            <select v-model="newCareer.employmentType" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
                                <option value="정규직">정규직</option>
                                <option value="계약직">계약직</option>
                                <option value="프리랜서">프리랜서</option>
                                <option value="인턴">인턴</option>
                            </select>
                        </div>
                         <div>
                            <label class="text-xs text-slate-500 mb-1 block">담당 업무</label>
                            <input type="text" v-model="newCareer.jobType" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="text-xs text-slate-500 mb-1 block">입사년월</label>
                                <input type="text" v-model="newCareer.startDate" placeholder="YYYY.MM" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                            </div>
                            <div>
                                <label class="text-xs text-slate-500 mb-1 block">퇴사년월</label>
                                <input type="text" v-model="newCareer.endDate" placeholder="YYYY.MM or 재직중" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                            </div>
                        </div>
                        <div class="col-span-1 md:col-span-2">
                             <label class="text-xs text-slate-500 mb-1 block">상세 설명</label>
                             <textarea v-model="newCareer.description" rows="3" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none"></textarea>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button @click="isAddingCareer = false" class="px-3 py-1.5 text-xs text-slate-400 hover:text-white">취소</button>
                        <button @click="addCareer" class="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs rounded-lg font-bold">추가 완료</button>
                    </div>
                </div>
            </div>

            <!-- 4. 자격증 (Certifications) -->
            <div class="bg-white/5 rounded-2xl border border-white/10 p-8">
               <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-bold text-white flex items-center gap-2">
                        <Award class="w-5 h-5 text-yellow-400" />
                        자격증
                    </h2>
                    <button 
                        v-if="!isAddingCertification"
                        @click="isAddingCertification = true"
                        class="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-slate-300 transition-colors flex items-center gap-1"
                    >
                        <Plus class="w-3 h-3" /> 추가
                    </button>
                </div>

                <div class="space-y-3 mb-4">
                    <div 
                        v-for="(cert, index) in resumeData.certifications" 
                        :key="cert.id" 
                        class="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10"
                    >
                        <div>
                            <h3 class="font-bold text-white">{{ cert.name }}</h3>
                            <p class="text-sm text-slate-400">{{ cert.issuer }}</p>
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="text-sm text-slate-500 font-mono">{{ cert.acquisitionDate }}</span>
                            <button @click="removeCertification(index)" class="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Add Certification Form -->
                <div v-if="isAddingCertification" class="bg-white/5 p-5 rounded-xl border border-yellow-500/30 animate-in fade-in slide-in-from-top-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">자격증명</label>
                            <input type="text" v-model="newCertification.name" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        </div>
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">발급기관</label>
                            <input type="text" v-model="newCertification.issuer" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        </div>
                        <div>
                            <label class="text-xs text-slate-500 mb-1 block">취득년월</label>
                            <input type="text" v-model="newCertification.acquisitionDate" placeholder="YYYY.MM" class="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        </div>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button @click="isAddingCertification = false" class="px-3 py-1.5 text-xs text-slate-400 hover:text-white">취소</button>
                        <button @click="addCertification" class="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded-lg font-bold">추가 완료</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
