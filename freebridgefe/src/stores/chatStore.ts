import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import type { ChatRoom, ChatMessage } from '@/types';

export const useChatStore = defineStore('chat', () => {
    const authStore = useAuthStore();

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

    // Mock Data
    const rooms = ref<ChatRoom[]>([
        {
            id: 'room1',
            participants: ['e1', 'f1'],
            participantNames: {
                'e1': '스타트업 A',
                'f1': '김프론트'
            },
            lastMessage: {
                id: 'm1',
                roomId: 'room1',
                senderId: 'e1',
                content: '안녕하세요, 지원서 잘 보았습니다. 채팅으로 이야기 나누고 싶습니다.',
                type: 'TEXT',
                createdAt: new Date(Date.now() - 1000000),
                readBy: ['e1', 'f1']
            },
            unreadCount: { 'e1': 0, 'f1': 0 },
            relatedJobId: 'job1',
            relatedApplicationId: 'app1',
            contractId: 1,
            createdAt: new Date(Date.now() - 2000000),
            updatedAt: new Date(Date.now() - 1000000)
        },
        {
            id: 'room2',
            participants: ['e1', 'f3'],
            participantNames: {
                'e1': '스타트업 A',
                'f3': '박풀스택'
            },
            lastMessage: {
                id: 'm2',
                roomId: 'room2',
                senderId: 'f3',
                content: '제안 주셔서 감사합니다. 긍정적으로 검토하겠습니다.',
                type: 'TEXT',
                createdAt: new Date(Date.now() - 500000),
                readBy: ['f3']
            },
            unreadCount: { 'e1': 1, 'f3': 0 },
            relatedJobId: 'job2',
            createdAt: new Date(Date.now() - 1000000),
            updatedAt: new Date(Date.now() - 500000)
        }
    ]);
    const messages = ref<{ [roomId: string]: ChatMessage[] }>({
        'room1': [
            {
                id: 'm0-1',
                roomId: 'room1',
                senderId: 'SYSTEM',
                content: '채팅방이 생성되었습니다.',
                type: 'SYSTEM',
                createdAt: new Date(Date.now() - 2000000),
                readBy: ['e1', 'f1']
            },
            {
                id: 'm1',
                roomId: 'room1',
                senderId: 'e1',
                content: '안녕하세요, 지원서 잘 보았습니다. 채팅으로 이야기 나누고 싶습니다.',
                type: 'TEXT',
                createdAt: new Date(Date.now() - 1000000),
                readBy: ['e1', 'f1']
            },
            {
                id: 'm-sys-1',
                roomId: 'room1',
                senderId: 'e1',
                content: '프로젝트 계약 요청',
                type: 'CONTRACT_ALERT',
                metadata: {
                    contractId: 101,
                    status: 'WAITING_SIGNATURE'
                },
                createdAt: new Date(Date.now() - 900000),
                readBy: ['e1', 'f1']
            }
        ],
        'room2': [
            {
                id: 'm0-2',
                roomId: 'room2',
                senderId: 'SYSTEM',
                content: '제안이 수락되어 채팅방이 생성되었습니다.',
                type: 'SYSTEM',
                createdAt: new Date(Date.now() - 1000000),
                readBy: ['e1', 'f3']
            },
            {
                id: 'm2',
                roomId: 'room2',
                senderId: 'f3',
                content: '제안 주셔서 감사합니다. 긍정적으로 검토하겠습니다.',
                type: 'TEXT',
                createdAt: new Date(Date.now() - 500000),
                readBy: ['f3']
            }
        ]
    });

    const currentRoomId = ref<string | null>(null);

    // Getters
    const myRooms = computed(() => {
        if (!authStore.user) return [];
        const myIds = getMyParticipantIds();

        return rooms.value.filter(room => room.participants.some((id) => myIds.includes(String(id))))
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    });

    const currentMessages = computed(() => {
        if (!currentRoomId.value) return [];
        return messages.value[currentRoomId.value] || [];
    });

    const currentRoom = computed(() => {
        return rooms.value.find(r => r.id === currentRoomId.value);
    });

    // Actions
    function selectRoom(roomId: string) {
        currentRoomId.value = roomId;
        // Mark as read logic would go here
        if (authStore.user) {
            const myIds = getMyParticipantIds();

            // Reset unread count
            const roomIndex = rooms.value.findIndex(r => r.id === roomId);
            if (roomIndex !== -1) {
                myIds.forEach((id) => {
                    if (id in rooms.value[roomIndex].unreadCount) {
                        rooms.value[roomIndex].unreadCount[id] = 0;
                    }
                });
            }
        }
    }

    function sendMessage(content: string, type: ChatMessage['type'] = 'TEXT', metadata?: any, roomId?: string, senderIdOverride?: string) {

        const targetRoomId = roomId ?? currentRoomId.value;
        if (!targetRoomId) return;

        // If no user is logged in, only allow sending if it's a system message override
        if (!authStore.user && !senderIdOverride) return;

        const senderId = senderIdOverride || getCurrentChatParticipantId() || String(authStore.user?.id);

        const newMessage: ChatMessage = {
            id: `m-${Date.now()}`,
            roomId: targetRoomId,
            senderId: senderId,
            content,
            type,
            metadata,
            createdAt: new Date(),
            readBy: [] // System messages might be read by everyone instantly, but let's stick to standard
        };

        // If it's a real user, add them to readBy
        if (authStore.user && getMyParticipantIds().includes(senderId)) {
            newMessage.readBy.push(senderId);
        }

        // Add to messages list
        if (!messages.value[targetRoomId]) {
            messages.value[targetRoomId] = [];
        }
        messages.value[targetRoomId].push(newMessage);

        // Update Room info
        const roomIndex = rooms.value.findIndex(r => r.id === targetRoomId);
        if (roomIndex !== -1) {
            rooms.value[roomIndex].lastMessage = newMessage;
            rooms.value[roomIndex].updatedAt = new Date();

            // Increment unread for others (skip if system message?)
            // Usually system messages also increment unread count for participants
            rooms.value[roomIndex].participants.forEach(p => {
                if (p !== senderId) {
                    rooms.value[roomIndex].unreadCount[p] = (rooms.value[roomIndex].unreadCount[p] || 0) + 1;
                }
            });
        }
    }

    function sendSystemMessage(roomId: string, content: string, type: ChatMessage['type'] = 'SYSTEM') {
        sendMessage(content, type, undefined, roomId, 'SYSTEM');
    }

    function createRoom(participants: string[], names: { [key: string]: string }, context: any) {
        const myIds = getMyParticipantIds();
        const myNormalizedId = getCurrentChatParticipantId();
        const normalizedParticipants = Array.from(
            new Set(
                participants.map((participantId) => {
                    const id = String(participantId);
                    if (myNormalizedId && myIds.includes(id)) {
                        return myNormalizedId;
                    }
                    return id;
                })
            )
        );
        const normalizedNames = Object.entries(names).reduce<{ [key: string]: string }>((acc, [id, name]) => {
            const normalizedId = myNormalizedId && myIds.includes(String(id)) ? myNormalizedId : String(id);
            acc[normalizedId] = name;
            return acc;
        }, {});

        // Check if room already exists
        const existingRoom = rooms.value.find(r =>
            r.participants.every(p => normalizedParticipants.includes(p)) &&
            normalizedParticipants.every(p => r.participants.includes(p)) &&
            // Optional: strict check including JobID if we want separate rooms per job
            r.relatedJobId !== undefined && context.relatedJobId !== undefined &&
            r.relatedJobId === context.relatedJobId
        );

        if (existingRoom) {
            return existingRoom.id;
        }

        const newRoomId = `room-${Date.now()}`;
        const newRoom: ChatRoom = {
            ...context, // Apply context first (so it doesn't override critical fields)
            id: newRoomId,
            participants: normalizedParticipants,
            participantNames: normalizedNames,
            unreadCount: {},
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Initialize unread counts
        normalizedParticipants.forEach(p => {
            newRoom.unreadCount[p] = 0;
        });

        rooms.value.unshift(newRoom);
        messages.value[newRoomId] = [
            {
                id: `m0-${newRoomId}`,
                roomId: newRoomId,
                senderId: 'SYSTEM',
                content: '채팅방이 생성되었습니다.',
                type: 'SYSTEM',
                createdAt: new Date(),
                readBy: normalizedParticipants
            }
        ];

        return newRoomId;
    }

    // Docking Chat State
    const isRoomListOpen = ref(false);
    const openDockedRooms = ref<{ roomId: string; minimized: boolean }[]>([]);

    function toggleRoomList() {
        isRoomListOpen.value = !isRoomListOpen.value;
    }

    function openDockedRoom(roomId: string) {
        const existing = openDockedRooms.value.find(r => r.roomId === roomId);
        if (existing) {
            existing.minimized = false;
        } else {
            // Maximum 3 docked windows for example
            if (openDockedRooms.value.length >= 3) {
                openDockedRooms.value.shift(); // Remove oldest
            }
            openDockedRooms.value.push({ roomId, minimized: false });
        }
        selectRoom(roomId);
    }

    function closeDockedRoom(roomId: string) {
        openDockedRooms.value = openDockedRooms.value.filter(r => r.roomId !== roomId);
    }

    function minimizeDockedRoom(roomId: string, minimized: boolean) {
        const room = openDockedRooms.value.find(r => r.roomId === roomId);
        if (room) {
            room.minimized = minimized;
        }
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
        myRooms,
        currentMessages,
        currentRoom,
        selectRoom,
        sendMessage,
        sendSystemMessage,
        createRoom,
        getCurrentChatParticipantId,
        getMyParticipantIds,
        getOtherParticipantId,
        // Docking exports
        isRoomListOpen,
        openDockedRooms,
        toggleRoomList,
        openDockedRoom,
        closeDockedRoom,
        minimizeDockedRoom,
        resetChatUIState,
        resetDockedUIState
    };
});
