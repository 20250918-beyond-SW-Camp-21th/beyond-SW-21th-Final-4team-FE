<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Lock,
    Bell,
    Eye,
    EyeOff,
    Key,
    Save,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { getAccountInfo, updateAccountInfo, changeFreelancerPassword } from '@/api/MyPage/accountApi';

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const authStore = useAuthStore();
const currentUser = authStore.user;

const verificationPassword = ref('');
const verificationError = ref('');
const isVerifying = ref(false);
const isProfileVerified = ref(false);

const accountInfo = ref({
    id: currentUser?.id || 1,
    name: currentUser?.name || '김프론트',
    email: currentUser?.email || 'frontend@example.com',
    phone: '010-1234-5678',
});

const passwordData = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
});

const showPasswords = ref({
    current: false,
    new: false,
    confirm: false,
});

const notifications = ref({
    email: true,
    push: true,
    marketing: false,
});

const isSavingInfo = ref(false);
const isChangingPassword = ref(false);

onMounted(async () => {
    try {
        const info = await getAccountInfo();
        accountInfo.value = { ...accountInfo.value, ...info };
    } catch (error) {
        console.error('Failed to fetch account info:', error);
    }
});

const handleVerifyIdentity = async () => {
    verificationError.value = '';
    const currentPassword = authStore.user?.password;

    if (!verificationPassword.value.trim()) {
        verificationError.value = '비밀번호를 입력해 주세요.';
        return;
    }

    // For demo purposes, if no password in store (guest), allow any non-empty password or match specific mock
    if (!currentPassword) {
         // Fallback for guest mode or testing without full auth
         isVerifying.value = true;
         await new Promise((resolve) => setTimeout(resolve, 600));
         isProfileVerified.value = true;
         isVerifying.value = false;
         return;
    }

    try {
        isVerifying.value = true;
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (verificationPassword.value !== currentPassword) {
            verificationError.value = '비밀번호가 올바르지 않습니다.';
            isProfileVerified.value = false;
            return;
        }

        isProfileVerified.value = true;
        verificationPassword.value = '';
    } finally {
        isVerifying.value = false;
    }
};

const handleSaveAccountInfo = async () => {
    if (!isProfileVerified.value) {
        alert('비밀번호 확인 후 내 정보를 수정할 수 있습니다.');
        return;
    }
    isSavingInfo.value = true;
    try {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
        const success = await updateAccountInfo(accountInfo.value);
        if (success) {
            alert('계정 정보가 저장되었습니다.');
            if (currentUser) {
                currentUser.name = accountInfo.value.name;
            }
        } else {
            alert('저장에 실패했습니다.');
        }
    } catch (e) {
        alert('오류가 발생했습니다.');
    } finally {
        isSavingInfo.value = false;
    }
};

const handleChangePassword = async () => {
    if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return;
    }
    if (passwordData.value.newPassword.length < 8) {
        alert('비밀번호는 최소 8자 이상이어야 합니다.');
        return;
    }
    
    isChangingPassword.value = true;
    try {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
        const success = await changeFreelancerPassword({
            current: passwordData.value.currentPassword,
            new: passwordData.value.newPassword,
            confirm: passwordData.value.confirmPassword
        });
        
        if (success) {
            alert('비밀번호가 변경되었습니다.');
            passwordData.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
        } else {
            alert('비밀번호 변경에 실패했습니다.');
        }
    } catch (e) {
        alert('오류가 발생했습니다.');
    } finally {
        isChangingPassword.value = false;
    }
};

const resetProfileVerification = () => {
    isProfileVerified.value = false;
    verificationPassword.value = '';
    verificationError.value = '';
};
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 md:px-8 py-10 font-sans text-white">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-10">
        <button
            @click="$emit('back')"
            class="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
            <ArrowLeft class="w-6 h-6 text-white/80" />
        </button>
        <div>
            <h1 class="text-3xl font-bold text-white tracking-tight">내 계정 관리</h1>
            <p class="text-base text-slate-400 mt-1">계정 정보 및 보안 설정을 안전하게 관리하세요.</p>
        </div>
    </div>

    <!-- Identity Verification (Shown when not verified) -->
    <div v-if="!isProfileVerified" class="max-w-md mx-auto mt-20" v-motion :initial="{ opacity: 0, scale: 0.95 }" :enter="{ opacity: 1, scale: 1 }">
        <div class="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md text-center shadow-2xl">
            <div class="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck class="w-10 h-10 text-blue-400" />
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">본인 확인</h2>
            <p class="text-slate-400 mb-8 text-sm leading-relaxed">
                개인정보 보호를 위해 비밀번호를 입력해 주세요.<br>
                인증 후 정보를 수정할 수 있습니다.
            </p>

            <div class="space-y-4 text-left">
                <div class="space-y-2">
                    <label class="text-xs text-slate-500 font-bold ml-1">비밀번호</label>
                    <div class="relative">
                        <Key class="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                        <input
                            type="password"
                            v-model="verificationPassword"
                            class="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 focus:bg-[#1e293b] transition-all"
                            placeholder="비밀번호 입력"
                            @keyup.enter="handleVerifyIdentity"
                        />
                    </div>
                </div>
                
                <p v-if="verificationError" class="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle class="w-3.5 h-3.5" />
                    {{ verificationError }}
                </p>

                <button
                    @click="handleVerifyIdentity"
                    :disabled="isVerifying"
                    class="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 mt-4"
                >
                    <Loader2 v-if="isVerifying" class="w-4 h-4 animate-spin" />
                    <span>{{ isVerifying ? '확인 중...' : '인증하기' }}</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Account Management Content (Shown when verified) -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
        
        <!-- Left Column: Basic Info -->
        <div class="lg:col-span-7 space-y-8">
            <!-- Basic Info Card -->
            <section class="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-xl font-bold text-white flex items-center gap-2">
                        <div class="p-2 bg-blue-500/10 rounded-lg">
                            <User class="w-5 h-5 text-blue-400" />
                        </div>
                        기본 정보
                    </h2>
                     <button
                        @click="handleSaveAccountInfo"
                        :disabled="isSavingInfo"
                        class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        <Loader2 v-if="isSavingInfo" class="w-3.5 h-3.5 animate-spin" />
                        <Save v-else class="w-3.5 h-3.5" />
                        저장
                    </button>
                </div>

                <div class="space-y-5">
                    <div class="space-y-2">
                        <label class="text-xs text-slate-400 font-bold ml-1">이름</label>
                        <div class="relative">
                            <User class="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                            <input
                                type="text"
                                v-model="accountInfo.name"
                                class="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 focus:bg-[#1e293b] transition-all"
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-xs text-slate-400 font-bold ml-1">이메일</label>
                        <div class="relative">
                            <Mail class="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                            <input
                                type="email"
                                v-model="accountInfo.email"
                                class="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 focus:bg-[#1e293b] transition-all"
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-xs text-slate-400 font-bold ml-1">휴대폰 번호</label>
                        <div class="relative">
                             <Phone class="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                            <input
                                type="tel"
                                v-model="accountInfo.phone"
                                class="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 focus:bg-[#1e293b] transition-all"
                            />
                        </div>
                    </div>
                </div>
            </section>

             <!-- Notification Settings -->
            <section class="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <div class="p-2 bg-yellow-500/10 rounded-lg">
                        <Bell class="w-5 h-5 text-yellow-400" />
                    </div>
                    알림 설정
                </h2>

                <div class="space-y-4">
                     <div
                        v-for="(item, key) in {
                            email: { label: '이메일 알림', desc: '프로젝트 제안 및 중요 공지를 이메일로 받습니다' },
                            push: { label: '푸시 알림', desc: '브라우저 푸시 알림을 받습니다' },
                            marketing: { label: '마케팅 정보 수신', desc: '프로모션 및 이벤트 정보를 받습니다' }
                        }"
                        :key="key"
                        class="flex items-center justify-between p-4 bg-[#1e293b]/30 rounded-2xl border border-white/5 hover:bg-[#1e293b]/50 transition-colors"
                    >
                        <div class="flex-1 pr-4">
                            <h3 class="font-bold text-white text-sm mb-1">{{ item.label }}</h3>
                            <p class="text-xs text-slate-400">{{ item.desc }}</p>
                        </div>
                        <button
                            @click="notifications[key as keyof typeof notifications] = !notifications[key as keyof typeof notifications]"
                            class="relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none"
                            :class="notifications[key as keyof typeof notifications] ? 'bg-blue-500' : 'bg-slate-700'"
                        >
                            <div
                                class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md"
                                :class="notifications[key as keyof typeof notifications] ? 'translate-x-5' : ''"
                            />
                        </button>
                    </div>
                </div>
            </section>
        </div>

        <!-- Right Column: Password & Security -->
        <div class="lg:col-span-5 space-y-8">
            <!-- Password Change -->
            <section class="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm h-full flex flex-col">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-xl font-bold text-white flex items-center gap-2">
                        <div class="p-2 bg-purple-500/10 rounded-lg">
                            <Lock class="w-5 h-5 text-purple-400" />
                        </div>
                        비밀번호 변경
                    </h2>
                </div>

                <div class="space-y-5 flex-1">
                    <div class="space-y-2">
                        <label class="text-xs text-slate-400 font-bold ml-1">현재 비밀번호</label>
                        <div class="relative">
                            <Key class="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                            <input
                                :type="showPasswords.current ? 'text' : 'password'"
                                v-model="passwordData.currentPassword"
                                class="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-white text-sm outline-none focus:border-purple-500/50 focus:bg-[#1e293b] transition-all"
                                placeholder="현재 비밀번호 입력"
                            />
                            <button
                                @click="showPasswords.current = !showPasswords.current"
                                class="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors"
                            >
                                <component :is="showPasswords.current ? EyeOff : Eye" class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div class="w-full h-px bg-white/5 my-2"></div>

                    <div class="space-y-2">
                        <label class="text-xs text-slate-400 font-bold ml-1">새 비밀번호</label>
                        <div class="relative">
                            <Lock class="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                            <input
                                :type="showPasswords.new ? 'text' : 'password'"
                                v-model="passwordData.newPassword"
                                class="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-white text-sm outline-none focus:border-purple-500/50 focus:bg-[#1e293b] transition-all"
                                placeholder="새 비밀번호 (8자 이상)"
                            />
                            <button
                                @click="showPasswords.new = !showPasswords.new"
                                class="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors"
                            >
                                <component :is="showPasswords.new ? EyeOff : Eye" class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-xs text-slate-400 font-bold ml-1">새 비밀번호 확인</label>
                        <div class="relative">
                            <CheckCircle2 class="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                            <input
                                :type="showPasswords.confirm ? 'text' : 'password'"
                                v-model="passwordData.confirmPassword"
                                class="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-white text-sm outline-none focus:border-purple-500/50 focus:bg-[#1e293b] transition-all"
                                placeholder="새 비밀번호 다시 입력"
                            />
                            <button
                                @click="showPasswords.confirm = !showPasswords.confirm"
                                class="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors"
                            >
                                <component :is="showPasswords.confirm ? EyeOff : Eye" class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div class="pt-6 mt-auto">
                        <button
                            @click="handleChangePassword"
                            :disabled="isChangingPassword"
                            class="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                        >
                            <Loader2 v-if="isChangingPassword" class="w-4 h-4 animate-spin" />
                            {{ isChangingPassword ? '변경 중...' : '비밀번호 변경하기' }}
                        </button>
                    </div>
                </div>
            </section>

             <button
                @click="resetProfileVerification"
                class="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white text-sm font-bold transition-all"
            >
                인증 상태 초기화 (로그아웃 효과)
            </button>
        </div>
    </div>
  </div>
</template>
