import { Router } from "@angular/router";
import { BehaviorSubject, Subject } from "rxjs";
import { ChatPreview } from "src/app/models/ChatPreview";
import { Message } from "src/app/models/Message";

export class LocalStorageService {
  public static LOGIN: string = 'login';
  public static ID: string = 'current_user_id';
  public static EMAIL: string = 'current_user_email';
  public static OPEN_CHAT_ID: string = 'open_chat_id';
  public static SETTING_PROFILE_ID: string = 'setting_profile_user_id';

  private _chatPreviewSubject: BehaviorSubject<ChatPreview[]> = new BehaviorSubject<ChatPreview[]>([]);
  public chat_prewiew = this._chatPreviewSubject.asObservable();

  private _messagesSubject: BehaviorSubject<{ chatId: number, messages: Message[] }> = new BehaviorSubject<{ chatId: number, messages: Message[] }>({ chatId: 0, messages: [] });
  public messages = this._messagesSubject.asObservable();

  private _isForwardingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public forwarding = this._isForwardingSubject.asObservable();

  private _isOpenRightPanelSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isOpenRightPanel = this._isOpenRightPanelSubject.asObservable();

  private selectedEmogiSubject = new BehaviorSubject<any>(null);
  public selectedEmogi$ = this.selectedEmogiSubject.asObservable();

  public static get CURRENT_USER_ID(): number {
    return Number(localStorage.getItem(LocalStorageService.ID));
  }

  public GET_OPEN_CHAT_ID(router: Router): number {
    const chatIdMatches = router.url.match(/chats\/(\d+)/);
    return Number(chatIdMatches && chatIdMatches[1]);
  };

  public static get GET_SETTING_PROFILE_ID(): number { return Number(localStorage.getItem(LocalStorageService.SETTING_PROFILE_ID)); };

  updateChatPreviews(chatPreviews: ChatPreview[]) {
    this._chatPreviewSubject.next(chatPreviews);
  }

  updateMessages(openChatId: number, messages: Message[]) {
    this.sortMessages(messages);
      this._messagesSubject.next({ chatId: openChatId, messages: messages });
  }

  updateIsForwarding(isForwarding: boolean) {
    this._isForwardingSubject.next(isForwarding);
  }

  updateIsOpenRightPanel(isOpenRightPanel: boolean) {
    this._isOpenRightPanelSubject.next(isOpenRightPanel);
  }

  addMessage(message: Message, openChatId: number) {
    const currentMessages = this._messagesSubject.value;
    const existingMessageIndex = currentMessages.messages.findIndex(m => m.id === message.id);
    
    if (message.chat?.id === openChatId) {
      if (existingMessageIndex !== -1) {
      currentMessages.messages[existingMessageIndex] = message;
    } else {
      currentMessages.messages.push(message);
    }
    this.sortMessages(currentMessages.messages);
    this._messagesSubject.next(currentMessages);
    }
  }

  addMessages(messages: Message[], openChatId: number) {
    const currentMessages = this._messagesSubject.value;
    this.sortMessages(messages);
    const filteredMessages = messages.filter(message => message.chat?.id === openChatId);
    if (filteredMessages.length > 0) {
      currentMessages.messages.unshift(...filteredMessages);
      this.sortMessages(currentMessages.messages);
      this._messagesSubject.next(currentMessages);
    }
  }

  removeMessage(message: Message) {
    const currentMessages = this._messagesSubject.value;
    const existingMessageIndex = currentMessages.messages.findIndex(m => m.id === message.id);
    
    if (existingMessageIndex !== -1) {
      currentMessages.messages.forEach((msg) => {
        if (msg.replyMessage && msg.replyMessage.id === message.id) {
          msg.replyMessage.id = 0;
        }
      });
      currentMessages.messages.splice(existingMessageIndex, 1);
    }
    
    this._messagesSubject.next(currentMessages);
  }

  setSelectedEmogi(emogi: any) {
    this.selectedEmogiSubject.next(emogi);
  }
    
  private logoutEvent = new Subject<void>();
  logoutEvent$ = this.logoutEvent.asObservable();
  triggerLogout(callback: () => void) {
    this.logoutEvent.next();
    callback();
  }

  private sortMessages(messages: Message[]) {
    messages.sort((a, b) => {
      if (a.id === null && b.id === null) {
        return 0;
      } else if (a.id === null) {
        return 1;
      } else if (b.id === null) {
        return -1;
      } else {
        return a.id - b.id;
      }
    });
  }
}

const TypeBucket = {
  ATTACHMENTS_CHAT: 'attachmentschat',
  CHAT: 'chat',
  USER: 'user'
};