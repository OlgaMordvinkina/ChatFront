
export class ApiUrls {
    public static get WEBSOCKET(): string { return "/api/ws"; };
    public static SUBSCRIBE_MESSAGE(currentUserId: number): string { return `/api/user/${currentUserId}/messages`; };
    public static SUBSCRIBE_MESSAGE_STATE(currentUserId: number): string { return `/api/user/${currentUserId}/messages/state`; };

    public static GET_CHAT_PREVIEW(userId: number): string { return `/api/users/${userId}/chats/previews`; };
    public static GET_CHAT(userId: number, chatId: number): string { return `/api/users/${userId}/chats/${chatId}`; };
    public static CREATE_CHAT(userId: number): string { return `/api/users/${userId}/chats`; };
    public static DELETE_CHAT(userId: number, chatId: number): string { return `/api/users/${userId}/chats/${chatId}`; };
    public static UPDATE_PHOTO_CHAT(userId: number, chatId: number): string { return `/api/users/${userId}/chats/${chatId}`; };

    public static GET_MESSAGE(userId: number, chatId: number): string { return `/api/users/${userId}/chats/${chatId}/messages`; };
    public static CREATE_MESSAGE(userId: number, chatId: number): string { return `/api/users/${userId}/chats/${chatId}/messages`; };
    public static UPDATE_MESSAGE(userId: number, chatId: number): string { return `/api/users/${userId}/chats/${chatId}/messages`; };
    public static DELETE_MESSAGE(userId: number, chatId: number, messageId: number): string { return `/api/users/${userId}/chats/${chatId}/messages/${messageId}`; };
    public static SEARCH_MESSAGE_ALL_CHATS(userId: number, desired: string): string { return `/api/users/${userId}/chats/messages/search?desired=${desired}`; };
    public static SEARCH_MESSAGE_THIS_CHAT(userId: number, chatId: number, desired: string): string { return `/api/users/${userId}/chats/${chatId}/messages/search?desired=${desired}`; };
    public static UPDATE_STATE_MESSAGES(userId: number, chatId: number): string { return `api/users/${userId}/chats/${chatId}/messages/state` };

    public static ADD_PARTICIPANT(userId: number, chatId: number, participantUserId: number): string { return `/api/users/${userId}/chats/${chatId}/participant?participantUserId=${participantUserId}`; };
    public static DELETE_PARTICIPANT_FROM_CHAT(userId: number, chatId: number, deletedUserId: number): string { return `/api/users/${userId}/chats/${chatId}/participants/exclude?deletedUserId=${deletedUserId}`; };

    public static get LOGIN_USER(): string { return `/api/login`; };
    public static get LOGOUT_USER(): string { return `/api/logout`; };
    public static GET_USER_BY_EMAIL(email: string): string { return `/api/users?email=${email}`; };
    public static SEARCH_USER(userId: number, desired: string): string { return `/api/users/${userId}/search?desired=${desired}`; };
    public static get CREATE_USER(): string { return `/api/registration`; };
    public static UPDATE_USER(userId: number): string { return `/api/users/${userId}`; };
    
    public static GET_PROFILE(userId: number): string { return `/api/user/${userId}/profile`; };
    public static UPDATE_PROFILE(userId: number): string { return `/api/user/${userId}/profile`; };
    public static UPDATE_ONLINE_DATE(userId: number): string { return `/api/user/${userId}/profile/online`; };
}