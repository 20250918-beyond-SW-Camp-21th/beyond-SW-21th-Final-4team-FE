<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMotion } from '@vueuse/motion';
import { ArrowLeft, Award, GraduationCap, CheckCircle, Info, Save, Loader2 } from 'lucide-vue-next';
import { 
    type GradeLevel, 
    type EducationType, 
    type CertificationType, 
    type EducationOption,
    type CertificationOption,
    type GradeCriteriaItem,
    getEducationOptions,
    getCertificationOptions,
    getGradeCriteria,
    calculateGrade,
    saveGrade
} from '@/api/MyPage/gradeApi';

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const selectedType = ref<'education' | 'certification'>('education');
const education = ref<EducationType>('전문학사'); // Default to first option or handle empty
const yearsOfExperience = ref<number>(0);
const certification = ref<CertificationType>('산업기사'); // Default
const certYears = ref<number>(0);
const calculatedGrade = ref<GradeLevel>('');

const educationOptions = ref<EducationOption[]>([]);
const certificationOptions = ref<CertificationOption[]>([]);
const criteriaList = ref<GradeCriteriaItem[]>([]);

const isLoading = ref(false);
const isSaving = ref(false);

onMounted(async () => {
    try {
        const [eduOpts, certOpts, criteria] = await Promise.all([
            getEducationOptions(),
            getCertificationOptions(),
            getGradeCriteria()
        ]);
        educationOptions.value = eduOpts;
        certificationOptions.value = certOpts;
        criteriaList.value = criteria;
        
        // Initialize defaults if available
        if (eduOpts.length > 0) education.value = eduOpts[0].value;
        if (certOpts.length > 0) certification.value = certOpts[0].value;
    } catch (error) {
        console.error('Failed to load initial data', error);
    }
});

const handleCalculate = async () => {
    if (selectedType.value === 'education' && !education.value) return;
    if (selectedType.value === 'certification' && !certification.value) return;

    isLoading.value = true;
    calculatedGrade.value = ''; // Reset result
    
    try {
        const result = await calculateGrade({
            type: selectedType.value,
            education: selectedType.value === 'education' ? education.value : undefined,
            certification: selectedType.value === 'certification' ? certification.value : undefined,
            yearsOfExperience: selectedType.value === 'education' ? yearsOfExperience.value : certYears.value
        });
        calculatedGrade.value = result;
    } catch (error) {
        console.error('Calculation failed', error);
    } finally {
        isLoading.value = false;
    }
};

const handleSave = async () => {
    if (!calculatedGrade.value) return;

    isSaving.value = true;
    try {
        await saveGrade({
            type: selectedType.value,
            education: selectedType.value === 'education' ? education.value : undefined,
            certification: selectedType.value === 'certification' ? certification.value : undefined,
            yearsOfExperience: selectedType.value === 'education' ? yearsOfExperience.value : certYears.value,
            grade: calculatedGrade.value
        });
        alert('등급 정보가 성공적으로 저장되었습니다.');
    } catch (error) {
        console.error('Save failed', error);
        alert('저장에 실패했습니다.');
    } finally {
        isSaving.value = false;
    }
};

const getGradeColor = (grade: GradeLevel) => {
    switch (grade) {
        case '특급': return 'from-purple-600 to-pink-600';
        case '고급': return 'from-blue-500 to-cyan-500';
        case '중급': return 'from-green-500 to-emerald-500';
        case '초급': return 'from-slate-500 to-slate-600';
        default: return 'from-slate-700 to-slate-800';
    }
};

const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
        case '특급': return 'bg-purple-600';
        case '고급': return 'bg-blue-500';
        case '중급': return 'bg-green-500';
        case '초급': return 'bg-slate-500';
        default: return 'bg-slate-700';
    }
};
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 md:px-8 py-8 font-sans text-white">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
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
            <h1 class="text-2xl font-bold text-white">회원 등급 조회</h1>
            <p class="text-sm text-slate-400 mt-1">학력/경력 또는 자격증 정보를 입력하여 등급을 확인하세요</p>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Input Form -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Type Selection -->
            <div
                class="bg-white/5 rounded-2xl border border-white/10 p-6"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0 }"
            >
                <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award class="w-5 h-5 text-yellow-400" />
                    등급 산정 방식 선택
                </h2>
                <div class="grid grid-cols-2 gap-4">
                    <button
                        @click="selectedType = 'education'; calculatedGrade = ''"
                        class="p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center"
                        :class="selectedType === 'education'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'"
                    >
                        <GraduationCap
                            class="w-8 h-8 mb-2"
                            :class="selectedType === 'education' ? 'text-blue-400' : 'text-slate-400'"
                        />
                        <div
                            class="font-semibold"
                            :class="selectedType === 'education' ? 'text-blue-300' : 'text-slate-300'"
                        >
                            학경력자
                        </div>
                        <div class="text-xs text-slate-500 mt-1">학력 + 경력</div>
                    </button>
                    <button
                        @click="selectedType = 'certification'; calculatedGrade = ''"
                        class="p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center"
                        :class="selectedType === 'certification'
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'"
                    >
                        <Award
                            class="w-8 h-8 mb-2"
                            :class="selectedType === 'certification' ? 'text-green-400' : 'text-slate-400'"
                        />
                        <div
                            class="font-semibold"
                            :class="selectedType === 'certification' ? 'text-green-300' : 'text-slate-300'"
                        >
                            자격자
                        </div>
                        <div class="text-xs text-slate-500 mt-1">자격증 + 경력</div>
                    </button>
                </div>
            </div>

            <!-- Education Form -->
            <div
                v-if="selectedType === 'education'"
                class="bg-white/5 rounded-2xl border border-white/10 p-6"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0 }"
            >
                <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <GraduationCap class="w-5 h-5 text-blue-400" />
                    학력 및 경력 정보
                </h2>

                <div class="space-y-4">
                     <div>
                        <label class="text-sm text-slate-400 mb-2 block">최종 학력</label>
                        <select
                            v-model="education"
                            @change="calculatedGrade = ''"
                            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="" disabled>선택하세요</option>
                            <option 
                                v-for="opt in educationOptions" 
                                :key="opt.value" 
                                :value="opt.value" 
                                class="text-black"
                            >
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="text-sm text-slate-400 mb-2 block">경력 연수 (년)</label>
                        <input
                            type="number"
                            min="0"
                            v-model.number="yearsOfExperience"
                            @input="calculatedGrade = ''"
                            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                            placeholder="경력 연수를 입력하세요"
                        />
                    </div>
                </div>
            </div>

            <!-- Certification Form -->
            <div
                v-if="selectedType === 'certification'"
                class="bg-white/5 rounded-2xl border border-white/10 p-6"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0 }"
            >
                <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award class="w-5 h-5 text-green-400" />
                    자격증 및 경력 정보
                </h2>

                 <div class="space-y-4">
                     <div>
                        <label class="text-sm text-slate-400 mb-2 block">자격증</label>
                        <select
                            v-model="certification"
                            @change="calculatedGrade = ''"
                            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-green-500 transition-colors"
                        >
                             <option value="" disabled>선택하세요</option>
                             <option 
                                v-for="opt in certificationOptions" 
                                :key="opt.value" 
                                :value="opt.value" 
                                class="text-black"
                            >
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="text-sm text-slate-400 mb-2 block">경력 연수 (년)</label>
                        <input
                            type="number"
                            min="0"
                            v-model.number="certYears"
                            @input="calculatedGrade = ''"
                            class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-green-500 transition-colors"
                            placeholder="경력 연수를 입력하세요"
                        />
                    </div>
                </div>
            </div>

            <button
                @click="handleCalculate"
                :disabled="(selectedType === 'education' ? !education : !certification) || isLoading"
                class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
                v-motion
                :hover="{ scale: 1.02 }"
                :tap="{ scale: 0.98 }"
            >
                <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
                <span v-else>등급 계산하기</span>
            </button>
        </div>

         <!-- Right Column - Result & Guide -->
        <div class="space-y-6">
             <div
                class="rounded-2xl p-6 text-center min-h-[200px] flex flex-col items-center justify-center transition-colors duration-500"
                :class="`bg-gradient-to-br ${getGradeColor(calculatedGrade)}`"
                v-motion
                :initial="{ opacity: 0, scale: 0.9 }"
                :enter="{ opacity: 1, scale: 1 }"
            >
                <template v-if="calculatedGrade">
                    <CheckCircle class="w-12 h-12 text-white mb-4" />
                    <div class="text-sm text-white/80 mb-2">귀하의 등급은</div>
                    <div class="text-5xl font-bold text-white mb-2">{{ calculatedGrade }}</div>
                    <div class="text-sm text-white/80 mb-6">입니다</div>
                    
                    <div class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-left">
                        <Info class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 class="text-red-400 font-bold text-sm mb-1">허위 정보 입력 시 주의사항</h4>
                            <p class="text-xs text-red-300/80 leading-relaxed">
                                해당 등급은 입력하신 정보를 바탕으로 산정됩니다. 
                                실제 정보와 다를 경우 <span class="text-red-400 font-bold decoration-wavy underline">고용주와의 법적 분쟁 및 손해배상 청구</span>의 대상이 될 수 있습니다.
                            </p>
                        </div>
                    </div>

                     <button
                        @click="handleSave"
                        :disabled="isSaving"
                        class="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-semibold transition-colors flex items-center gap-2 mx-auto"
                    >
                        <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
                        <Save v-else class="w-4 h-4" />
                        등급 정보 저장
                    </button>
                </template>
                <template v-else>
                     <Award class="w-12 h-12 text-white/40 mb-4" />
                    <div class="text-white/60">정보를 입력하고</div>
                    <div class="text-white/60">등급을 계산해보세요</div>
                </template>
            </div>

             <div
                class="bg-white/5 rounded-2xl border border-white/10 p-6"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            >
                <h3 class="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Info class="w-4 h-4 text-blue-400" />
                    등급 안내
                </h3>
                  <div class="space-y-2">
                    <div v-for="grade in ['특급', '고급', '중급', '초급']" :key="grade" class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full" :class="getGradeBadgeColor(grade)"></div>
                        <span class="text-xs text-slate-300">{{ grade }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Criteria Table -->
    <div
        class="mt-8 bg-white/5 rounded-2xl border border-white/10 p-6"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
    >
        <h2 class="text-lg font-bold text-white mb-4">등급 산정 기준표</h2>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-white/10">
                        <th class="text-left py-3 px-4 text-slate-300 font-semibold">등급</th>
                        <th class="text-left py-3 px-4 text-slate-300 font-semibold">학경력자</th>
                        <th class="text-left py-3 px-4 text-slate-300 font-semibold">자격자</th>
                    </tr>
                </thead>
                <tbody>
                     <tr v-for="item in criteriaList" :key="item.grade" class="border-b border-white/10 hover:bg-white/5">
                        <td class="py-3 px-4">
                            <span :class="`inline-block px-3 py-1 ${item.color} text-white rounded-full text-xs font-bold`">{{ item.grade }}</span>
                        </td>
                        <td class="py-3 px-4 text-slate-300 text-xs">{{ item.edu }}</td>
                        <td class="py-3 px-4 text-slate-300 text-xs">{{ item.cert }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  </div>
</template>
