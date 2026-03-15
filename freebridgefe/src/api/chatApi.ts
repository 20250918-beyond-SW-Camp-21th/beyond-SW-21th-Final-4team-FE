import apiClient from './axiosInstance';
import type { ChatRoom, ChatMessage } from '@/types';

// ─── Response Mapping Types ──────────────────────────────────────────────────

export interface BackendChatRoomResponse {
    roomId: string;
    participants: string[];
    participantNames: Record<string, string>;
    lastMessage?: BackendChatMessageResponse;
    unreadCount: Record<string, number>;
    participantPresence?: Record<string, boolean>;
    relatedJobId?: string;
    relatedApplicationId?: string;
    relatedProposalId?: string;
    contractId?: number;
    leftBy?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface BackendChatMessageResponse {
    messageId: string;
    roomId: string;
    senderId: string;
    content: string;
    type: string;
    metadata?: any;
    createdAt: string;
    readBy: string[];
}

export interface CursorPageResponse<T> {
    items?: T[];
    content?: T[];
    nextCursor?: string;
    hasNext: boolean;
}

// ─── Mapping Helpers ─────────────────────────────────────────────────────────

function mapToChatRoom(r: BackendChatRoomResponse): ChatRoom {
    return {
        id: r.roomId,
        participants: r.participants,
        participantNames: r.participantNames,
        lastMessage: r.lastMessage ? mapToChatMessage(r.lastMessage) : undefined,
        unreadCount: r.unreadCount ?? {},
        participantPresence: r.participantPresence ?? {},
        relatedJobId: r.relatedJobId,
        relatedApplicationId: r.relatedApplicationId,
        relatedProposalId: r.relatedProposalId,
        contractId: r.contractId,
        leftBy: r.leftBy,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt)
    };
}

function mapToChatMessage(m: BackendChatMessageResponse): ChatMessage {
    return {
        id: m.messageId,
        roomId: m.roomId,
        senderId: m.senderId,
        content: m.content,
        type: m.type as ChatMessage['type'],
        metadata: m.metadata,
        createdAt: new Date(m.createdAt),
        readBy: m.readBy ?? []
    };
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * 내 채팅방 목록 조회
 * GET /api/chat/rooms
 */
export async function getMyChatRooms(): Promise<ChatRoom[]> {
    const res = await apiClient.get<BackendChatRoomResponse[]>('/api/chat/rooms');
    return res.data.map(mapToChatRoom);
}

/**
 * 채팅방 이전 메시지 조회 (커서 기반 페이징)
 * GET /api/chat/rooms/{roomId}/messages?size=20&cursorDateStr=...
 */
export async function getChatMessages(
    roomId: string,
    cursorDateStr?: string,
    size = 20
): Promise<CursorPageResponse<ChatMessage>> {
    const params: Record<string, any> = { size };
    if (cursorDateStr) params.cursorDateStr = cursorDateStr;

    const res = await apiClient.get<CursorPageResponse<BackendChatMessageResponse>>(
        `/api/chat/rooms/${roomId}/messages`,
        { params }
    );
    const messageItems = res.data.items ?? res.data.content ?? [];

    return {
        content: messageItems.map(mapToChatMessage),
        nextCursor: res.data.nextCursor,
        hasNext: res.data.hasNext
    };
}

/**
 * 채팅방 생성
 * POST /api/chat/rooms
 */
export async function createChatRoom(body: {
    participants: string[];
    participantNames: Record<string, string>;
    relatedJobId?: string;
    relatedApplicationId?: string;
    relatedProposalId?: string;
}): Promise<ChatRoom> {
    const res = await apiClient.post<BackendChatRoomResponse>('/api/chat/rooms', body);
    return mapToChatRoom(res.data);
}

/**
 * 채팅방 나가기
 * POST /api/chat/rooms/{roomId}/leave
 */
export async function leaveChatRoom(roomId: string): Promise<ChatRoom> {
    const res = await apiClient.post<BackendChatRoomResponse>(`/api/chat/rooms/${roomId}/leave`);
    return mapToChatRoom(res.data);
}

