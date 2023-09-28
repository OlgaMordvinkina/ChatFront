import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Stomp } from '@stomp/stompjs';
import { Subscription, tap } from 'rxjs';
import { Chat } from 'src/app/models/Chat';
import { ChatPreview } from 'src/app/models/ChatPreview';
import { NewChat } from 'src/app/models/NewChat';
import { BaseServiceService } from 'src/app/services/base-service.service';
import { ChatCreationDialogComponent } from '../chat-creation-dialog/chat-creation-dialog.component';
import { LocalStorageService } from '../storage/localStorageService';
import * as SockJS from 'sockjs-client';
import { ApiUrls } from 'src/app/services/ApiUrls';
import { Message } from 'src/app/models/Message';
@Component({
  selector: 'app-chat-preview',
  templateUrl: './chat-preview.component.html',
  styleUrls: ['./chat-preview.component.scss']
})
export class ChatPreviewComponent implements OnInit, AfterContentInit, OnDestroy {
  typePrivateChat: string = 'PRIVATE';
  typeGroupChat: string = 'GROUP';
  currentUserId: number;
  chatsPreview: ChatPreview[] = [];
  private chatPreviewSubscription!: Subscription;
  private isForwardingSubscription!: Subscription;
  private logoutSubscription!: Subscription;
  isForwarding: boolean = false;
  stompClient: any;

  constructor(private baseService: BaseServiceService, 
              private router: Router, 
              public dialog: MatDialog,
              private localStorage: LocalStorageService) {
    this.currentUserId = LocalStorageService.CURRENT_USER_ID;
    this.updateChatPreviews(this.currentUserId);

    this.connect();
  }
  
  ngOnInit(): void {
    const format = /\/chats\/\d+/;
    const path = location.pathname;
    if (format.test(path)) {
      const matches = path.match(format);
      if (matches) {
        this.openChat(parseInt(matches[1]));
      }
    }

    this.getChatPreview();
    this.getIsForwarMessages();

    this.logoutSubscription = this.localStorage.logoutEvent$.subscribe(() => {
      this.logout();
    });
  }

  ngOnDestroy() {
    this.chatPreviewSubscription.unsubscribe();
    this.isForwardingSubscription.unsubscribe();
    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
    }
  }

  ngAfterContentInit(): void {}

  logout() {
    this.currentUserId = 0;
    this.chatsPreview = [];
  }

  getChatPreview() {
    this.chatPreviewSubscription = this.localStorage.chat_prewiew.subscribe(
      (chatPreviews: ChatPreview[]) => {
        this.chatsPreview = chatPreviews;
      }
    );
  }

  getIsForwarMessages() {
    this.isForwardingSubscription = this.localStorage.forwarding.subscribe(
      (is: boolean) => {
        this.isForwarding = is;
      }
    );
  }

  isWebSocketConnected: boolean = false;
  connect() {
    if (!this.isWebSocketConnected) {
      const sockJS = new SockJS(ApiUrls.WEBSOCKET);
      this.stompClient = Stomp.over(sockJS);
  
      this.stompClient.connect({}, () => {
        this.isWebSocketConnected = true;

        this.stompClient.subscribe(ApiUrls.SUBSCRIBE_MESSAGE(this.currentUserId), (msg: any) => {
          const message: Message = Message.convertToObjFromJSON(msg.body);
          this.updatePrewiews(message);
          this.addMessage(message);
          this.removeMessage(message);
        });
  
        this.stompClient.subscribe(ApiUrls.SUBSCRIBE_MESSAGE_STATE(this.currentUserId), (msg: any) => {
          const chatId = Number(msg.body);
          this.baseService.getChatPreviews(this.currentUserId).subscribe((previews: ChatPreview[]) => {
            this.chatsPreview = previews;
            this.localStorage.updateChatPreviews(previews);
          });
        });
      });
    }
  }

  updatePrewiews(message: Message) {
    const findIndex = this.chatsPreview.findIndex((chat) => chat.chatId === message.chat?.id);
    if (findIndex !== -1) {

      const chat: ChatPreview = this.chatsPreview[findIndex];
      if (
        (message.typeMessage === TypeMessage.CREATE) || 
        (message.typeMessage === TypeMessage.UPDATE && chat.messageId === message.id)
      ) {
        if (message.typeMessage === TypeMessage.CREATE) {
          this.playAudio();
        }

        chat.lastMessage = message.text;
        if (message.sender) {
          chat.senderId = message.sender.id
        }
        if (message.createDate) {
          chat.dateLastMessage = Message.dateTimeFormatter(message.createDate);
        }
        
        chat.unreadMessages++;
        if (message.chat?.id === this.localStorage.GET_OPEN_CHAT_ID(this.router)) {
          chat.unreadMessages = 0;
          this.localStorage.updateChatPreviews(this.chatsPreview);
        }
      } else if (message.typeMessage === TypeMessage.DELETE && chat.messageId === message.id) {
        this.updateChatPreviews(LocalStorageService.CURRENT_USER_ID);
      }

    }
  }

  playAudio() {
    let currentSource: AudioBufferSourceNode | null = null;
    
    const playSound = () => {
      const audioContext = new AudioContext();
      const urlSound = this.getSound();
      fetch(urlSound)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
 
        if (currentSource !== null) {
          currentSource.stop();
        }
        currentSource = source;
      })
      .catch(error => {
      console.error(error);
      });
    };
    
    playSound();
  }

  getSound(): string {
    const settingId = LocalStorageService.GET_SETTING_PROFILE_ID;
    return `assets/sounds/message-sound-${settingId}.mp3`;
  }

  addMessage(message: Message) {
    this.localStorage.addMessage(message, this.localStorage.GET_OPEN_CHAT_ID(this.router));
  }

  removeMessage(message: Message) {
    if (message.typeMessage === TypeMessage.DELETE) {
      this.localStorage.removeMessage(message);
    }
  }

  createChat(type: string): Chat {
    let chat = new Chat(null, '', type, []);
    const dialogCreationChat = 
    this.dialog.open(ChatCreationDialogComponent, {
      width: '400px',
      height: '430px',
      data: chat
    });

    dialogCreationChat.afterClosed().subscribe((newChat: NewChat) => {
      newChat.type = type;
        if (newChat) {
          this.baseService.createChat(LocalStorageService.CURRENT_USER_ID, newChat).subscribe((result: Chat) => {
            chat = result;
            this.openChat(result.id);
          });

          setTimeout(() => {
            this.updateChatPreviews(LocalStorageService.CURRENT_USER_ID);
          }, 200);
        }
    });
    
    return chat;
  }  

  updateChatPreviews(userId: number) {
    this.baseService.getChatPreviews(userId).subscribe((chatsPreviews: ChatPreview[]) => {
      this.chatsPreview = chatsPreviews;
      this.localStorage.updateChatPreviews(chatsPreviews);
    });
  }

  getStateMessage(chat: ChatPreview): string {
    const stateMessage = document.getElementById('stateMessage' + chat.chatId);
    if (chat.senderId != this.currentUserId && stateMessage) {
      stateMessage.style.display = 'none';
      return '';
    } else {
      if (chat.stateMessage === StateMessage.SENT) {
        return 'assets/sent-message-icon.svg';
      } else if (chat.stateMessage === StateMessage.READ) {
        return 'assets/read-message-icon.svg';
      } else {
        return 'assets/send-error-message-icon.svg';
      }
    }
  }

  openChat(chatId: number | null) {
    localStorage.setItem(LocalStorageService.OPEN_CHAT_ID, JSON.stringify(chatId));

    const chat = document.getElementById('chat');
    const mainScreen = document.getElementById('mainScreen');
    if (chat) {
      chat.style.display = 'grid';
    }
    if (mainScreen) {
      mainScreen.style.display = 'none';
    }
    if (chatId) {
      this.router.navigate([`/chats/${chatId}`]);
    }

    const chatOpen = this.chatsPreview.find(item => item.chatId === chatId);
    if (chatOpen && chatOpen.unreadMessages) {
      chatOpen.unreadMessages = 0;
      this.localStorage.updateChatPreviews(this.chatsPreview);
    }
  }

}

const StateMessage = {
  READ: 'READ',
  SENT: 'SENT',
  SEND_ERROR: 'SEND_ERROR'
};

const TypeMessage = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE'
};
