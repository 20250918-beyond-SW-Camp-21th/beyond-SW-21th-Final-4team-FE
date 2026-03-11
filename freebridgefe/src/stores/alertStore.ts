import { defineStore } from 'pinia';
import { ref } from 'vue';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertPayload {
  title?: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
}

export const useAlertStore = defineStore('alert', () => {
  const isOpen = ref(false);
  const title = ref('알림');
  const message = ref('');
  const type = ref<AlertType>('info');
  const confirmText = ref('확인');

  const open = (payload: AlertPayload) => {
    title.value = payload.title ?? '알림';
    message.value = payload.message;
    type.value = payload.type ?? 'info';
    confirmText.value = payload.confirmText ?? '확인';
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  return {
    isOpen,
    title,
    message,
    type,
    confirmText,
    open,
    close,
  };
});
