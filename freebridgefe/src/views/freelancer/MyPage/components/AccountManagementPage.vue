<script setup lang="ts">
import { ref } from 'vue';
import { useMotion } from '@vueuse/motion';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Lock,
    Bell,
    Shield,
    Save,
    Eye,
    EyeOff,
    Smartphone,
    Key,
    AlertCircle
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';

import { updateAccountInfo, changePassword } from '@/api/MyPage/accountApi';

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const authStore = useAuthStore();
const currentUser = authStore.user;

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
    sms: false,
    push: true,
    marketing: false,
});

const twoFactorEnabled = ref(false);

const handleSaveAccountInfo = async () => {
    try {
        const success = await updateAccountInfo(accountInfo.value);
        if (success) {
            alert('계정 정보가 저장되었습니다.');
            // authStore 업데이트 로직이 필요하다면 추가
            if (currentUser) {
                currentUser.name = accountInfo.value.name;
                // currentUser.phone = accountInfo.value.phone; // 타입에 phone이 있다면
            }
        } else {
            alert('저장에 실패했습니다.');
        }
    } catch (e) {
        alert('오류가 발생했습니다.');
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
    
    try {
        const success = await changePassword({
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
    }
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 md:px-8 py-8 font-sans text-white">
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
            <h1 class="text-2xl font-bold text-white">내 계정 관리</h1>
            <p class="text-sm text-slate-400 mt-1">계정 정보 및 보안 설정을 관리하세요</p>
        </div>
    </div>

    <div class="space-y-6">
        <!-- Account Information -->
        <div
            class="bg-white/5 rounded-2xl border border-white/10 p-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
        >
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-bold text-white flex items-center gap-2">
                    <User class="w-5 h-5 text-blue-400" />
                    기본 정보
                </h2>
                <button
                    @click="handleSaveAccountInfo"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                >
                    <Save class="w-4 h-4" />
                    저장
                </button>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="text-xs text-slate-500 mb-2 block">이름</label>
                    <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                        <User class="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            v-model="accountInfo.name"
                            class="bg-transparent border-none outline-none w-full text-white text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label class="text-xs text-slate-500 mb-2 block">이메일</label>
                    <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                        <Mail class="w-4 h-4 text-slate-400" />
                        <input
                            type="email"
                            v-model="accountInfo.email"
                            class="bg-transparent border-none outline-none w-full text-white text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label class="text-xs text-slate-500 mb-2 block">휴대폰 번호</label>
                    <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                        <Phone class="w-4 h-4 text-slate-400" />
                        <input
                            type="tel"
                            v-model="accountInfo.phone"
                            class="bg-transparent border-none outline-none w-full text-white text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Password Change -->
        <div
            class="bg-white/5 rounded-2xl border border-white/10 p-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
        >
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-bold text-white flex items-center gap-2">
                    <Lock class="w-5 h-5 text-purple-400" />
                    비밀번호 변경
                </h2>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="text-xs text-slate-500 mb-2 block">현재 비밀번호</label>
                    <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                        <Key class="w-4 h-4 text-slate-400" />
                        <input
                            :type="showPasswords.current ? 'text' : 'password'"
                            v-model="passwordData.currentPassword"
                            class="bg-transparent border-none outline-none w-full text-white text-sm"
                            placeholder="현재 비밀번호를 입력하세요"
                        />
                        <button
                            @click="showPasswords.current = !showPasswords.current"
                            class="text-slate-400 hover:text-white transition-colors"
                        >
                            <component :is="showPasswords.current ? EyeOff : Eye" class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div>
                    <label class="text-xs text-slate-500 mb-2 block">새 비밀번호</label>
                    <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                        <Lock class="w-4 h-4 text-slate-400" />
                        <input
                             :type="showPasswords.new ? 'text' : 'password'"
                            v-model="passwordData.newPassword"
                            class="bg-transparent border-none outline-none w-full text-white text-sm"
                            placeholder="새 비밀번호 (최소 8자)"
                        />
                        <button
                            @click="showPasswords.new = !showPasswords.new"
                            class="text-slate-400 hover:text-white transition-colors"
                        >
                             <component :is="showPasswords.new ? EyeOff : Eye" class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div>
                    <label class="text-xs text-slate-500 mb-2 block">새 비밀번호 확인</label>
                    <div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                        <Lock class="w-4 h-4 text-slate-400" />
                        <input
                             :type="showPasswords.confirm ? 'text' : 'password'"
                            v-model="passwordData.confirmPassword"
                            class="bg-transparent border-none outline-none w-full text-white text-sm"
                            placeholder="새 비밀번호를 다시 입력하세요"
                        />
                        <button
                            @click="showPasswords.confirm = !showPasswords.confirm"
                            class="text-slate-400 hover:text-white transition-colors"
                        >
                             <component :is="showPasswords.confirm ? EyeOff : Eye" class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <button
                    @click="handleChangePassword"
                    class="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors"
                >
                    비밀번호 변경
                </button>
            </div>
        </div>

        <!-- Notification Settings -->
        <div
            class="bg-white/5 rounded-2xl border border-white/10 p-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
        >
            <h2 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Bell class="w-5 h-5 text-yellow-400" />
                알림 설정
            </h2>

            <div class="space-y-4">
                 <div
                    v-for="(item, key) in {
                        email: { label: '이메일 알림', desc: '프로젝트 제안 및 중요 공지를 이메일로 받습니다' },
                        sms: { label: 'SMS 알림', desc: '긴급 알림을 문자로 받습니다' },
                        push: { label: '푸시 알림', desc: '브라우저 푸시 알림을 받습니다' },
                        marketing: { label: '마케팅 정보 수신', desc: '프로모션 및 이벤트 정보를 받습니다' }
                    }"
                    :key="key"
                    class="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                >
                    <div class="flex-1">
                        <h3 class="font-semibold text-white text-sm mb-1">{{ item.label }}</h3>
                        <p class="text-xs text-slate-400">{{ item.desc }}</p>
                    </div>
                    <button
                        @click="notifications[key as keyof typeof notifications] = !notifications[key as keyof typeof notifications]"
                        class="relative w-12 h-6 rounded-full transition-colors"
                        :class="notifications[key as keyof typeof notifications] ? 'bg-blue-500' : 'bg-slate-600'"
                    >
                        <div
                            class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform"
                            :class="notifications[key as keyof typeof notifications] ? 'translate-x-6' : ''"
                        />
                    </button>
                </div>
            </div>
        </div>

        <!-- Security Settings -->
        <div
            class="bg-white/5 rounded-2xl border border-white/10 p-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
        >
            <h2 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Shield class="w-5 h-5 text-green-400" />
                보안 설정
            </h2>

             <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <Smartphone class="w-4 h-4 text-green-400" />
                            <h3 class="font-semibold text-white text-sm">2단계 인증 (2FA)</h3>
                        </div>
                        <p class="text-xs text-slate-400">로그인 시 추가 보안 인증을 요구합니다</p>
                    </div>
                    <button
                        @click="twoFactorEnabled = !twoFactorEnabled"
                        class="relative w-12 h-6 rounded-full transition-colors"
                        :class="twoFactorEnabled ? 'bg-green-500' : 'bg-slate-600'"
                    >
                        <div
                            class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform"
                            :class="twoFactorEnabled ? 'translate-x-6' : ''"
                        />
                    </button>
                </div>

                <div class="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div class="flex items-start gap-3">
                        <AlertCircle class="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 class="font-semibold text-orange-300 text-sm mb-1">계정 보안 팁</h3>
                            <ul class="text-xs text-orange-200/80 space-y-1">
                                <li>• 정기적으로 비밀번호를 변경하세요</li>
                                <li>• 다른 사이트와 동일한 비밀번호를 사용하지 마세요</li>
                                <li>• 2단계 인증을 활성화하여 계정을 보호하세요</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
