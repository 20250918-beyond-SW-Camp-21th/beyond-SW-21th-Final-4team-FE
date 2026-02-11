import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import type { ChatRoom, ChatMessage } from '@/types';

export const useChatStore = defineStore('chat', () => {
    const authStore = useAuthStore();

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
    // Start Over with better chunk


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
        const myFullId = String(authStore.user.id);

        return rooms.value.filter(room => room.participants.includes(myFullId))
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
            const myFullId = String(authStore.user.id);

            // Reset unread count
            const roomIndex = rooms.value.findIndex(r => r.id === roomId);
            if (roomIndex !== -1) {
                rooms.value[roomIndex].unreadCount[myFullId] = 0;
            }
        }
    }

    function sendMessage(content: string, type: ChatMessage['type'] = 'TEXT', metadata?: any) {
        if (!currentRoomId.value || !authStore.user) return;

        const myFullId = String(authStore.user.id);

        const newMessage: ChatMessage = {
            id: `m-${Date.now()}`,
            roomId: currentRoomId.value,
            senderId: myFullId,
            content,
            type,
            metadata,
            createdAt: new Date(),
            readBy: [myFullId]
        };

        // Add to messages list
        if (!messages.value[currentRoomId.value]) {
            messages.value[currentRoomId.value] = [];
        }
        messages.value[currentRoomId.value].push(newMessage);

        // Update Room info
        const roomIndex = rooms.value.findIndex(r => r.id === currentRoomId.value);
        if (roomIndex !== -1) {
            rooms.value[roomIndex].lastMessage = newMessage;
            rooms.value[roomIndex].updatedAt = new Date();

            // Increment unread for others
            rooms.value[roomIndex].participants.forEach(p => {
                if (p !== myFullId) {
                    rooms.value[roomIndex].unreadCount[p] = (rooms.value[roomIndex].unreadCount[p] || 0) + 1;
                }
            });
        }
    }

    function createRoom(participants: string[], names: { [key: string]: string }, context: any) {
        // Check if room already exists
        const existingRoom = rooms.value.find(r =>
            r.participants.every(p => participants.includes(p)) &&
            participants.every(p => r.participants.includes(p)) &&
            // Optional: strict check including JobID if we want separate rooms per job
            r.relatedJobId === context.relatedJobId
        );

        if (existingRoom) {
            return existingRoom.id;
        }

        const newRoomId = `room-${Date.now()}`;
        const newRoom: ChatRoom = {
            id: newRoomId,
            participants,
            participantNames: names,
            unreadCount: {},
            ...context, // relatedJobId, relatedApplicationId etc.
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Initialize unread counts
        participants.forEach(p => newRoom.unreadCount[p] = 0);

        rooms.value.unshift(newRoom);
        messages.value[newRoomId] = [
            {
                id: `m0-${newRoomId}`,
                roomId: newRoomId,
                senderId: 'SYSTEM',
                content: '채팅방이 생성되었습니다.',
                type: 'SYSTEM',
                createdAt: new Date(),
                readBy: participants
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

    return {
        rooms,
        messages,
        currentRoomId,
        myRooms,
        currentMessages,
        currentRoom,
        selectRoom,
        sendMessage,
        createRoom,
        // Docking exports
        isRoomListOpen,
        openDockedRooms,
        toggleRoomList,
        openDockedRoom,
        closeDockedRoom,
        minimizeDockedRoom
    };
});
