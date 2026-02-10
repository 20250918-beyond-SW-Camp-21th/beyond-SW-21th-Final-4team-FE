<script setup lang="ts">
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { Building2, ArrowRight, Mail, Phone, Link, MapPin, Globe } from 'lucide-vue-next';
import AnimatedBackground from '../auth/components/AnimatedBackground.vue';
import { onMounted } from 'vue';

const store = useOnboardingStore();
const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
    // Reset step to 1
    store.setStep(1);
    
    // Pre-fill specific fields if available
    // For Employer, we don't automatically fill company_name with user name to avoid confusion.
});


const handleFinish = async () => {
    // Validate all required fields across both steps
    if (!store.employerData.company_name || !store.employerData.email || !store.employerData.phone) {
        alert('기본 정보(기업명, 이메일, 전화번호)를 입력해주세요.');
        store.setStep(1);
        return;
    }
    if (!store.employerData.industry || !store.employerData.location) {
        alert('상세 정보(업종, 위치)를 입력해주세요.');
        return;
    }

    const success = await store.submitEmployerOnboarding();
    if (success) {
        alert('온보딩이 완료되었습니다. Freebridge 이용 가이드로 이동합니다.');
        router.push('/guide'); // Redirect to Guide as requested
    }
};

const nextStep = () => {
    if (store.currentStep === 1) {
         if (!store.employerData.company_name || !store.employerData.email || !store.employerData.phone) {
             alert('필수 정보를 입력해주세요.');
             return;
         }
    }
    store.nextStep();
};
</script>

<template>
  <div class="min-h-screen bg-black text-white flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
    <!-- Animated Background -->
    <AnimatedBackground />

    <!-- Glassmorphism Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

    <div 
        class="max-w-2xl w-full space-y-8 bg-white/5 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] relative z-10"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
    >
        <!-- Header -->
        <div class="text-center">
            <h2 class="mt-2 text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                기업 프로필 등록
            </h2>
            <p class="mt-3 text-lg text-white/60">
                {{ store.currentStep === 1 ? '기본 정보를 입력하고 인재를 찾으세요.' : '상세 정보를 입력하여 기업의 매력을 어필하세요.' }}
            </p>
        </div>

        <!-- Progress Indicator -->
        <div class="flex justify-center items-center gap-3 mb-8">
            <div class="h-1.5 w-16 rounded-full transition-all duration-500 ease-out" 
                 :class="store.currentStep >= 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10'"></div>
            <div class="h-1.5 w-16 rounded-full transition-all duration-500 ease-out" 
                 :class="store.currentStep >= 2 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10'"></div>
        </div>

        <!-- Step 1: Basic Info -->
        <div v-if="store.currentStep === 1" class="space-y-6">
            <div v-motion :initial="{ opacity: 0, x: 20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 100 } }">
                <label class="block text-sm font-medium text-white/80 mb-2">기업명 <span class="text-red-400">*</span></label>
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400">
                        <Building2 class="h-5 w-5 text-white/40" />
                    </div>
                    <input 
                        type="text" 
                        :value="store.employerData.company_name"
                        @input="e => store.updateEmployerData({ company_name: (e.target as HTMLInputElement).value })"
                        class="pl-12 block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent sm:text-sm py-4 text-white placeholder:text-white/30 transition-all duration-300 hover:bg-white/10"
                        placeholder="(주)프리브릿지"
                    />
                    <div class="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none group-hover:ring-white/20 transition-all"></div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-6" v-motion :initial="{ opacity: 0, x: 20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 200 } }">
                <div>
                    <label class="block text-sm font-medium text-white/80 mb-2">대표 이메일 <span class="text-red-400">*</span></label>
                    <div class="relative group">
                         <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400">
                            <Mail class="h-5 w-5 text-white/40" />
                        </div>
                        <input 
                            type="email" 
                            :value="store.employerData.email"
                            @input="e => store.updateEmployerData({ email: (e.target as HTMLInputElement).value })"
                            class="pl-12 block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent sm:text-sm py-4 px-4 text-white placeholder:text-white/30 transition-all duration-300 hover:bg-white/10"
                            placeholder="contact@company.com"
                        />
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-white/80 mb-2">대표 전화번호 <span class="text-red-400">*</span></label>
                    <div class="relative group">
                         <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400">
                            <Phone class="h-5 w-5 text-white/40" />
                        </div>
                        <input 
                            type="tel" 
                            :value="store.employerData.phone"
                            @input="e => store.updateEmployerData({ phone: (e.target as HTMLInputElement).value })"
                            class="pl-12 block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent sm:text-sm py-4 px-4 text-white placeholder:text-white/30 transition-all duration-300 hover:bg-white/10"
                            placeholder="02-1234-5678"
                        />
                    </div>
                </div>
            </div>

            <div v-motion :initial="{ opacity: 0, x: 20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 300 } }">
                <label class="block text-sm font-medium text-white/80 mb-2">기업 로고 URL</label>
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400">
                        <Link class="h-5 w-5 text-white/40" />
                    </div>
                    <input 
                        type="url" 
                        :value="store.employerData.logo_url"
                        @input="e => store.updateEmployerData({ logo_url: (e.target as HTMLInputElement).value })"
                        class="pl-12 block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent sm:text-sm py-4 px-4 text-white placeholder:text-white/30 transition-all duration-300 hover:bg-white/10"
                        placeholder="https://example.com/logo.png"
                    />
                </div>
            </div>

            <div v-motion :initial="{ opacity: 0, x: 20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 400 } }">
                <label class="block text-sm font-medium text-white/80 mb-2">기업 소개</label>
                <div class="relative group">
                    <textarea 
                        :value="store.employerData.description"
                        @input="e => store.updateEmployerData({ description: (e.target as HTMLTextAreaElement).value })"
                        rows="3"
                        class="block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent sm:text-sm py-4 px-4 resize-none text-white placeholder:text-white/30 transition-all duration-300 hover:bg-white/10"
                        placeholder="기업의 비전과 미션을 소개해주세요."
                    ></textarea>
                </div>
            </div>

            <button 
                @click="nextStep" 
                class="group w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
                <span class="mr-2">다음 단계로</span>
                <ArrowRight class="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        <!-- Step 2: Details -->
        <div v-else-if="store.currentStep === 2" class="space-y-6">
            <div class="grid grid-cols-2 gap-6" v-motion :initial="{ opacity: 0, x: 20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 100 } }">
                <div>
                    <label class="block text-sm font-medium text-white/80 mb-2">업종 (Industry) <span class="text-red-400">*</span></label>
                    <div class="relative group">
                         <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400">
                            <Building2 class="h-5 w-5 text-white/40" />
                        </div>
                        <input 
                            type="text" 
                            :value="store.employerData.industry"
                            @input="e => store.updateEmployerData({ industry: (e.target as HTMLInputElement).value })"
                            class="pl-12 block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent sm:text-sm py-4 px-4 text-white placeholder:text-white/30 transition-all duration-300 hover:bg-white/10"
                            placeholder="예: IT, 금융"
                        />
                    </div>
                </div>
                 <div>
                    <label class="block text-sm font-medium text-white/80 mb-2">기업 규모 <span class="text-red-400">*</span></label>
                    <div class="relative group">
                        <select 
                            :value="store.employerData.size"
                            @change="e => store.updateEmployerData({ size: (e.target as HTMLSelectElement).value as any })"
                            class="block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent sm:text-sm py-4 px-4 text-white transition-all duration-300 hover:bg-white/10 [&>option]:bg-[#1a1a1a]"
                        >
                            <option value="SIZE_1_TO_10">1-10명</option>
                            <option value="SIZE_10_TO_50">10-50명</option>
                            <option value="SIZE_50_TO_100">50-100명</option>
                            <option value="SIZE_100_TO_500">100-500명</option>
                            <option value="SIZE_500_PLUS">500명 이상</option>
                        </select>
                    </div>
                </div>
            </div>

            <div v-motion :initial="{ opacity: 0, x: 20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 200 } }">
                <label class="block text-sm font-medium text-white/80 mb-2">기업 위치 <span class="text-red-400">*</span></label>
                <div class="relative group">
                     <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400">
                        <MapPin class="h-5 w-5 text-white/40" />
                    </div>
                    <input 
                        type="text" 
                        :value="store.employerData.location"
                        @input="e => store.updateEmployerData({ location: (e.target as HTMLInputElement).value })"
                        class="pl-12 block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent sm:text-sm py-4 px-4 text-white placeholder:text-white/30 transition-all duration-300 hover:bg-white/10"
                        placeholder="서울시 강남구..."
                    />
                </div>
            </div>

            <div v-motion :initial="{ opacity: 0, x: 20 }" :enter="{ opacity: 1, x: 0, transition: { delay: 300 } }">
                <label class="block text-sm font-medium text-white/80 mb-2">웹사이트 URL</label>
                <div class="relative group">
                     <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400">
                        <Globe class="h-5 w-5 text-white/40" />
                    </div>
                    <input 
                        type="url" 
                        :value="store.employerData.website"
                        @input="e => store.updateEmployerData({ website: (e.target as HTMLInputElement).value })"
                        class="pl-12 block w-full bg-white/5 border border-white/10 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent sm:text-sm py-4 px-4 text-white placeholder:text-white/30 transition-all duration-300 hover:bg-white/10"
                        placeholder="https://company.com"
                    />
                </div>
            </div>

            <div class="flex gap-4 mt-8 pt-4 border-t border-white/5">
                 <button @click="store.prevStep" class="flex-1 py-4 px-6 border border-white/10 rounded-2xl text-lg font-bold text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 transition-all active:scale-[0.98]">
                    이전
                </button>
                <button 
                    @click="handleFinish" 
                    class="group flex-1 py-4 px-6 border border-transparent rounded-2xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span class="flex items-center justify-center gap-2">
                        완료하기
                        <ArrowRight class="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
            </div>
        </div>
    </div>
  </div>
</template>


