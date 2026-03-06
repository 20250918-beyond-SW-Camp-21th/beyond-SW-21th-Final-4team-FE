import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/stores/authStore';
import type { ChatRoom, ChatMessage } from '@/types';
import { getMyChatRooms, getChatMessages, createChatRoom as apiCreateRoom } from '@/api/chatApi';
import { getAccessToken } from '@/api/axiosInstance';

export const useChatStore = defineStore('chat', () => {
    const authStore = useAuthStore();

    // ── 참가자 ID 유틸 ─────────────────────────────────────────────────────
    function getCurrentChatParticipantId(): string | null {
        if (!authStore.user) return null;

        const rawId = String(authStore.user.id);
        if (/^[ef]\d+$/i.test(rawId)) {
            return rawId;
        }

        const prefix = authStore.user.role === 'EMPLOYER' ? 'e' : 'f';
        return `${prefix}${rawId}`;
    }

    function getMyParticipantIds(): string[] {
        if (!authStore.user) return [];

        const rawId = String(authStore.user.id);
        const normalizedId = getCurrentChatParticipantId();

        return Array.from(new Set([rawId, normalizedId].filter(Boolean) as string[]));
    }

    function getOtherParticipantId(room: ChatRoom): string | undefined {
        const myIds = getMyParticipantIds();
        return room.participants.find((id) => !myIds.includes(String(id)));
    }

    // ── 상태 ───────────────────────────────────────────────────────────────
    const rooms = ref<ChatRoom[]>([]);
    const messages = ref<{ [roomId: string]: ChatMessage[] }>({});
    const currentRoomId = ref<string | null>(null);
    const isLoadingRooms = ref(false);
    const isLoadingMessages = ref(false);

    // ── STOMP WebSocket ────────────────────────────────────────────────────
    let stompClient: Client | null = null;
    const subscriptions: Record<string, { unsubscribe: () => void }> = {};

    function connectWebSocket() {
        const token = getAccessToken(); // axiosInstance의 토큰 키 사용
        if (!token) return;

        stompClient = new Client({
            webSocketFactory: () =>
                new SockJS(
                    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/ws/chat`
                ),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('[STOMP] Connected');
                if (currentRoomId.value) {
                    subscribeToRoom(currentRoomId.value);
                }
            },
            onStompError: (frame) => {
                console.error('[STOMP] Error:', frame.headers['message']);
            }
        });

        stompClient.activate();
    }

    function subscribeToRoom(roomId: string) {
        if (!stompClient || !stompClient.connected) return;
        if (subscriptions[roomId]) return; // 이미 구독 중

        const sub = stompClient.subscribe(`/topic/chat/room/${roomId}`, (stompMessage) => {
            try {
                const raw = JSON.parse(stompMessage.body);
                const msg: ChatMessage = {
                    id: raw.messageId || raw.id || `ws-${Date.now()}`,
                    roomId: raw.roomId,
                    senderId: raw.senderId,
                    content: raw.content,
                    type: raw.type,
                    metadata: raw.metadata,
                    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
                    readBy: raw.readBy ?? []
                };

                if (!messages.value[roomId]) {
                    messages.value[roomId] = [];
                }

                // 낙관적 메시지를 실제 서버 메시지로 교체 (content 동일 + optimistic ID인 경우)
                const optimisticIdx = messages.value[roomId].findIndex(
                    (m) => m.id.startsWith('m-optimistic-') && m.content === msg.content && m.senderId === msg.senderId
                );
                if (optimisticIdx !== -1) {
                    messages.value[roomId][optimisticIdx] = msg;
                } else {
                    // 일반 중복 방지 (id 기반)
                    const exists = messages.value[roomId].some((m) => m.id === msg.id);
                    if (!exists) {
                        messages.value[roomId].push(msg);
                    }
                }

                // 방 목록 lastMessage, updatedAt 갱신
                const roomIndex = rooms.value.findIndex((r) => r.id === roomId);
                if (roomIndex !== -1) {
                    rooms.value[roomIndex].lastMessage = msg;
                    rooms.value[roomIndex].updatedAt = msg.createdAt;

                    // 현재 방이 아닌 경우 unreadCount 증가
                    if (currentRoomId.value !== roomId) {
                        const myIds = getMyParticipantIds();
                        rooms.value[roomIndex].participants.forEach((p) => {
                            if (!myIds.includes(p)) return;
                            rooms.value[roomIndex].unreadCount[p] =
                                (rooms.value[roomIndex].unreadCount[p] || 0) + 1;
                        });
                    }
                }
            } catch (e) {
                console.error('[STOMP] Failed to parse message:', e);
            }
        });

        subscriptions[roomId] = sub;
    }

    function unsubscribeFromRoom(roomId: string) {
        if (subscriptions[roomId]) {
            subscriptions[roomId].unsubscribe();
            delete subscriptions[roomId];
        }
    }

    function disconnectWebSocket() {
        if (stompClient) {
            stompClient.deactivate();
            stompClient = null;
        }
        Object.keys(subscriptions).forEach((id) => unsubscribeFromRoom(id));
    }

    // ── REST: 채팅방 목록 조회 ──────────────────────────────────────────────
    async function fetchRooms() {
        if (!authStore.isAuthenticated) return;
        isLoadingRooms.value = true;
        try {
            const fetchedRooms = await getMyChatRooms();
            rooms.value = fetchedRooms;
        } catch (e) {
            console.error('[Chat] Failed to fetch rooms:', e);
        } finally {
            isLoadingRooms.value = false;
        }
    }

    // ── REST: 이전 메시지 조회 ──────────────────────────────────────────────
    async function fetchMessages(roomId: string, cursorDateStr?: string) {
        isLoadingMessages.value = true;
        try {
            const result = await getChatMessages(roomId, cursorDateStr, 30);
            if (!messages.value[roomId]) {
                messages.value[roomId] = [];
            }
            if (cursorDateStr) {
                messages.value[roomId] = [...result.content, ...messages.value[roomId]];
            } else {
                messages.value[roomId] = result.content;
            }
            return result;
        } catch (e) {
            console.error('[Chat] Failed to fetch messages:', e);
            return null;
        } finally {
            isLoadingMessages.value = false;
        }
    }

    // ── Getters ────────────────────────────────────────────────────────────
    function normalizeIdForRoom(room: ChatRoom, id: string): string {
        const raw = String(id);
        if (/^[ef]\d+$/i.test(raw)) return raw.toLowerCase();
        const possibleEmployer = `e${raw}`;
        const possibleFreelancer = `f${raw}`;
        if (room.participantNames[possibleEmployer]) return possibleEmployer;
        if (room.participantNames[possibleFreelancer]) return possibleFreelancer;
        return raw;
    }

    const myRooms = computed(() => {
        if (!authStore.user) return [];
        const myIds = getMyParticipantIds();

        return rooms.value
            .filter((room) => {
                const normalizedMyIds = myIds.map((id) => normalizeIdForRoom(room, id));
                const isParticipant = room.participants
                    .map((id) => normalizeIdForRoom(room, String(id)))
                    .some((id) => normalizedMyIds.includes(id));
                const hasLeft = (room.leftBy || [])
                    .map((id) => normalizeIdForRoom(room, String(id)))
                    .some((id) => normalizedMyIds.includes(id));
                return isParticipant && !hasLeft;
            })
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    });

    const currentMessages = computed(() => {
        if (!currentRoomId.value) return [];
        return messages.value[currentRoomId.value] || [];
    });

    const currentRoom = computed(() => {
        return rooms.value.find((r) => r.id === currentRoomId.value);
    });

    // ── 방 선택: 메시지 로드 + WebSocket 구독 ──────────────────────────────
    function selectRoom(roomId: string) {
        currentRoomId.value = roomId;

        if (authStore.user) {
            const myIds = getMyParticipantIds();
            const roomIndex = rooms.value.findIndex((r) => r.id === roomId);
            if (roomIndex !== -1) {
                myIds.forEach((id) => {
                    if (id in rooms.value[roomIndex].unreadCount) {
                        rooms.value[roomIndex].unreadCount[id] = 0;
                    }
                });
            }
        }

        if (!messages.value[roomId] || messages.value[roomId].length === 0) {
            fetchMessages(roomId);
        }

        subscribeToRoom(roomId);
    }

    // ── 메시지 전송 (STOMP → 로컬 Fallback) ────────────────────────────────
    function sendMessage(
        content: string,
        type: ChatMessage['type'] = 'TEXT',
        metadata?: any,
        roomId?: string,
        senderIdOverride?: string
    ) {
        const targetRoomId = roomId ?? currentRoomId.value;
        if (!targetRoomId) return;

        if (type !== 'SYSTEM' && isRoomReadOnly(targetRoomId)) return;
        if (!authStore.user && !senderIdOverride) return;

        const senderId = senderIdOverride || getCurrentChatParticipantId() || String(authStore.user?.id);

        // SYSTEM 메시지(퇴장 알림 등)는 STOMP 브로드캐스트 대신 로컬 상태에 즉시 추가
        // → leaveRoom이 unsubscribeFromRoom을 바로 호출하기 때문에 서버 브로드캐스트를 수신하지 못함
        const isSystemType = type === 'SYSTEM' || type === 'CONTRACT_ALERT';

        if (stompClient && stompClient.connected && !isSystemType) {
            // 일반 텍스트 메시지: STOMP로 전송 (서버가 브로드캐스트해서 subscribeToRoom 콜백으로 수신)
            stompClient.publish({
                destination: '/app/chat/message',
                body: JSON.stringify({ roomId: targetRoomId, content, type, metadata })
            });
            // 낙관적 UI: 보낸 사람 화면에 즉시 표시 (중복 방지는 subscribeToRoom에서 id 체크)
            const optimisticMsg: ChatMessage = {
                id: `m-optimistic-${Date.now()}`,
                roomId: targetRoomId,
                senderId,
                content,
                type,
                metadata,
                createdAt: new Date(),
                readBy: [senderId]
            };
            if (!messages.value[targetRoomId]) messages.value[targetRoomId] = [];
            messages.value[targetRoomId].push(optimisticMsg);
        } else {
            // SYSTEM 메시지이거나 WebSocket 미연결 시: 로컬 상태에 직접 추가
            const newMessage: ChatMessage = {
                id: `m-local-${Date.now()}`,
                roomId: targetRoomId,
                senderId,
                content,
                type,
                metadata,
                createdAt: new Date(),
                readBy: authStore.user ? [senderId] : []
            };

            if (!messages.value[targetRoomId]) {
                messages.value[targetRoomId] = [];
            }
            messages.value[targetRoomId].push(newMessage);

            const roomIndex = rooms.value.findIndex((r) => r.id === targetRoomId);
            if (roomIndex !== -1) {
                rooms.value[roomIndex].lastMessage = newMessage;
                rooms.value[roomIndex].updatedAt = new Date();

                rooms.value[roomIndex].participants.forEach((p) => {
                    if (p !== senderId) {
                        rooms.value[roomIndex].unreadCount[p] =
                            (rooms.value[roomIndex].unreadCount[p] || 0) + 1;
                    }
                });
            }
        }
    }

    function sendSystemMessage(roomId: string, content: string, type: ChatMessage['type'] = 'SYSTEM') {
        sendMessage(content, type, undefined, roomId, 'SYSTEM');
    }

    // ── 채팅방 생성 (REST API) ──────────────────────────────────────────────
    async function createRoom(
        participants: string[],
        names: { [key: string]: string },
        context: any
    ) {
        const myIds = getMyParticipantIds();
        const myNormalizedId = getCurrentChatParticipantId();
        const normalizedParticipants = Array.from(
            new Set(
                participants.map((id) => {
                    const sid = String(id);
                    if (myNormalizedId && myIds.includes(sid)) return myNormalizedId;
                    return sid;
                })
            )
        );

        const existingRoom = rooms.value.find(
            (r) =>
                r.participants.every((p) => normalizedParticipants.includes(p)) &&
                normalizedParticipants.every((p) => r.participants.includes(p)) &&
                r.relatedJobId !== undefined &&
                context.relatedJobId !== undefined &&
                r.relatedJobId === context.relatedJobId
        );
        if (existingRoom) return existingRoom.id;

        try {
            const newRoom = await apiCreateRoom({
                participants: normalizedParticipants,
                participantNames: names,
                relatedJobId: context.relatedJobId,
                relatedApplicationId: context.relatedApplicationId,
                relatedProposalId: context.relatedProposalId
            });
            rooms.value.unshift(newRoom);
            messages.value[newRoom.id] = [];
            return newRoom.id;
        } catch (e) {
            console.error('[Chat] Failed to create room:', e);
            throw e;
        }
    }

    // ── 방 관련 유틸 ───────────────────────────────────────────────────────
    function isRoomReadOnly(roomId: string): boolean {
        const room = rooms.value.find((r) => r.id === roomId);
        if (!room || !authStore.user) return false;

        const myIds = getMyParticipantIds().map((id) => normalizeIdForRoom(room, id));
        const leftBy = (room.leftBy || []).map((id) => normalizeIdForRoom(room, String(id)));
        return leftBy.some((id) => !myIds.includes(id));
    }

    function leaveRoom(roomId: string) {
        const roomIndex = rooms.value.findIndex((room) => room.id === roomId);
        if (roomIndex === -1) return;

        const room = rooms.value[roomIndex];
        const myIds = getMyParticipantIds();
        const leaverName = authStore.user?.name || '상대방';

        sendSystemMessage(roomId, `${leaverName}님이 채팅방을 나갔습니다.`, 'SYSTEM');

        const currentLeftBy = room.leftBy || [];
        const primaryId = getCurrentChatParticipantId();
        const leftBy = Array.from(
            new Set([
                ...currentLeftBy.map((id) => normalizeIdForRoom(room, String(id))),
                ...(primaryId ? [normalizeIdForRoom(room, primaryId)] : []),
                ...myIds.map((id) => normalizeIdForRoom(room, String(id)))
            ])
        );

        const participantIds = Array.from(
            new Set(room.participants.map((id) => normalizeIdForRoom(room, String(id))))
        );
        const hasEveryoneLeft = participantIds.every((id) => leftBy.includes(id));

        if (hasEveryoneLeft) {
            rooms.value = rooms.value.filter((r) => r.id !== roomId);
            if (messages.value[roomId]) delete messages.value[roomId];
        } else {
            rooms.value[roomIndex] = { ...room, leftBy, updatedAt: new Date() };
        }

        unsubscribeFromRoom(roomId);

        if (currentRoomId.value === roomId) currentRoomId.value = null;
        openDockedRooms.value = openDockedRooms.value.filter((r) => r.roomId !== roomId);
    }

    function updateRoomContract(roomId: string, contractId: number | null) {
        const roomIndex = rooms.value.findIndex((r) => r.id === roomId);
        if (roomIndex === -1) return;
        rooms.value[roomIndex] = {
            ...rooms.value[roomIndex],
            contractId: contractId ?? undefined
        };
    }

    // ── Docking Chat State ─────────────────────────────────────────────────
    const isRoomListOpen = ref(false);
    const openDockedRooms = ref<{ roomId: string; minimized: boolean }[]>([]);

    function toggleRoomList() {
        isRoomListOpen.value = !isRoomListOpen.value;
    }

    function openDockedRoom(roomId: string) {
        const existing = openDockedRooms.value.find((r) => r.roomId === roomId);
        if (existing) {
            existing.minimized = false;
        } else {
            if (openDockedRooms.value.length >= 3) {
                openDockedRooms.value.shift();
            }
            openDockedRooms.value.push({ roomId, minimized: false });
        }
        selectRoom(roomId);
    }

    function closeDockedRoom(roomId: string) {
        openDockedRooms.value = openDockedRooms.value.filter((r) => r.roomId !== roomId);
    }

    function minimizeDockedRoom(roomId: string, minimized: boolean) {
        const room = openDockedRooms.value.find((r) => r.roomId === roomId);
        if (room) room.minimized = minimized;
    }

    function resetChatUIState() {
        currentRoomId.value = null;
        isRoomListOpen.value = false;
        openDockedRooms.value = [];
    }

    function resetDockedUIState() {
        isRoomListOpen.value = false;
        openDockedRooms.value = [];
    }

    return {
        rooms,
        messages,
        currentRoomId,
        isLoadingRooms,
        isLoadingMessages,
        myRooms,
        currentMessages,
        currentRoom,
        selectRoom,
        sendMessage,
        sendSystemMessage,
        createRoom,
        fetchRooms,
        fetchMessages,
        connectWebSocket,
        disconnectWebSocket,
        subscribeToRoom,
        getCurrentChatParticipantId,
        getMyParticipantIds,
        getOtherParticipantId,
        isRoomListOpen,
        openDockedRooms,
        toggleRoomList,
        openDockedRoom,
        closeDockedRoom,
        minimizeDockedRoom,
        resetChatUIState,
        resetDockedUIState,
        leaveRoom,
        isRoomReadOnly,
        updateRoomContract
    };
});
