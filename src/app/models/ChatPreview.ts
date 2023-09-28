export class ChatPreview {
    chatId: number | null;
    messageId: number | null;
    title: string;
    photo: string | null;
    senderId: number | null;
    lastMessage: string;
    dateLastMessage: string;
    stateMessage: string;
    unreadMessages: number;
  
    constructor() {
        this.chatId = null;
        this.messageId = null
        this.title = "";
        this.photo = null;
        this.senderId = null;
        this.lastMessage = "";
        this.dateLastMessage = "";
        this.stateMessage = "";
        this.unreadMessages = 0;
    }
}