import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Chat } from 'src/app/models/Chat';
import { ChatPreview } from 'src/app/models/ChatPreview';
import { Message } from 'src/app/models/Message';
import { Profile } from 'src/app/models/Profile';
import { User } from 'src/app/models/User';
import { BaseServiceService } from 'src/app/services/base-service.service';
import { EmogiDialogComponent } from '../emogi-dialog/emogi-dialog.component';
import { LocalStorageService } from '../storage/localStorageService';
import { ViewingImagesComponent } from '../viewing-images/viewing-images.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy, AfterViewInit {
  currentUserId!: number;
  currentChat: Chat = new Chat(null, '', '', []);
  chatId!: number;
  messages: { chatId: number, messages: Message[] } = { chatId: 0, messages: [] };
  foundMessages: Message[] = [];
  newMsg: Message = new Message();
  searchText = '';
  oldSearchText = '';
  newMessage = '';
  editableMessage!: Message;
  clickX: number = 0;
  clickY: number = 0
  activeMessageId: number | null = null;
  isOptionsVisible: boolean = false;
  profile: Profile = new Profile(0);
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  isUpdate: boolean = false;
  private messagesSubscription!: Subscription;
  private logoutSubscription!: Subscription;
  private emogiSubscription!: Subscription;

  constructor(private baseService: BaseServiceService, 
              private activateRoute: ActivatedRoute,
              private localStorage: LocalStorageService,
              public dialog: MatDialog,
              private router: Router,
              private el: ElementRef) {
                  this.currentUserId = LocalStorageService.CURRENT_USER_ID;
                  this.activateRoute.params.subscribe(params => {
                    this.openChat().then(() => {
                      setTimeout(() => {
                        this.scrollToBottomFast();
                      }, 100);
                      
                      if (!this.currentChat.id) {
                        this.close();
                      }
                    });
                  });
    this.scrollToBottomFast();
  }

  ngOnInit(): void {
    this.getMessages();
    this.logoutSubscription = this.localStorage.logoutEvent$.subscribe(() => {
      this.logout();
    });
  }

  ngAfterViewChecked(): void {
    if (this.searchText !== '' && this.searchText !== this.oldSearchText) {
      this.searchMessageInChat();
    }
  }

  ngOnDestroy() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
    }
    if (this.emogiSubscription) {
      this.emogiSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.onScroll();
  }

  async openChat() {
    this.initializerOpenChatId();

    if (LocalStorageService.CURRENT_USER_ID !== 0, this.chatId) {
      await this.baseService.getChat(LocalStorageService.CURRENT_USER_ID, this.chatId)
      .toPromise()
      .then((chat: Chat | undefined) => {
        this.currentChat = chat!;
          if (this.currentChat?.participants && this.currentChat?.participants.length > 0) {
            this.currentChat.participants.sort((a, b) => {
              if (a.type === 'ADMIN') return -1;
              if (b.type === 'ADMIN') return 1;
              return 0;
          });
        }
        this.initializerProfile();
        this.baseService.updateStateMessages(LocalStorageService.CURRENT_USER_ID, this.localStorage.GET_OPEN_CHAT_ID(this.router)).subscribe();
        this.messages = {chatId: 0, messages: []};

        setTimeout(async() => {
          await this.baseService.getMessages(LocalStorageService.CURRENT_USER_ID, this.chatId, null).toPromise().then((messages: Message[] | undefined) => {
            this.localStorage.updateMessages(this.chatId, messages!);
            if (this.currentChat.id && messages) {
              this.messages = {chatId: this.currentChat.id, messages: messages! };
              // this.localStorage.addMessages(messages, this.currentChat.id);
            }
          });
        }, 100);
      })
      .catch((error) => {
        console.log(error);
        this.close();
      });
    }
    
    if (this.newMsg.forwardedFrom) {
      this.createMessage();
      this.newMsg.forwardedFrom = null;
      this.localStorage.updateIsForwarding(false);
    }
    this.scrollToBottomFast();

    this.newMessage = '';
  }

  page: number = 2;
  loading: boolean = false; 
  getMessagePages() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.baseService.getMessages(LocalStorageService.CURRENT_USER_ID, this.chatId, this.page).toPromise().then((messages: Message[] | undefined) => {
      if (messages?.length === 0) {
        return;
      }
      this.localStorage.addMessages(messages!, this.chatId);
      ++this.page;
      this.loading = false;

    });

    setTimeout(() => {
      this.scroll();
    }, 150);
  }

  prevScrollHeight: number = 0;
  @ViewChild('messageContainer', { static: false }) scrollContainer!: ElementRef;
  onScroll() {
    const container = this.scrollContainer.nativeElement;
    container.addEventListener('scroll', (event: any) => {
      if (container.scrollTop <= 200) {
        this.prevScrollHeight = container.scrollHeight;
        this.getMessagePages();
      }
    });
  }

  scroll() {
    const container = this.scrollContainer.nativeElement;
    container.scrollTop = container.scrollHeight - this.prevScrollHeight;
  }

  initializerProfile() {
    if (this.currentChat.type === 'PRIVATE') {
      const id = this.currentChat.participants.find(it=> it.id !== this.currentUserId)?.id;
      if (id) {
        this.baseService.getProfile(id).subscribe((profile: Profile) => 
          this.profile = profile
        );
      }
    }
  }

  uploadAttachments() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      
    fileInput?.click();
        
    const handleChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
  
      const files = target.files;
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target && typeof event.target.result === 'string') {
              const base64File = event.target.result;
              this.newMsg.attachments.push({ id: this.newMsg.attachments.length + 1, file: base64File });
            }
          };
          reader.readAsDataURL(file);
        }
      }
        
      fileInput.removeEventListener('change', handleChange);
    };
      
    fileInput.addEventListener('change', handleChange);
  }

  triggerFileInputClick() {
    var fileInput = document.getElementById('fileInput');
    fileInput?.click();
  }

  logout() {
    this.currentUserId = 0;
    this.currentChat = new Chat(null, '', '', []);
    this.chatId = 0;
    this.messages = { chatId: 0, messages: [] }
    this.foundMessages = [];
    this.newMsg = new Message();
    this.searchText = '';
    this.oldSearchText = '';
    this.newMessage = '';
  }

  initializerOpenChatId() {
    const chatIdMatches = this.router.url.match(/chats\/(\d+)/);
    const chatId = chatIdMatches && chatIdMatches[1];

    if (chatId) {
      this.chatId = parseInt(chatId);
      localStorage.setItem(LocalStorageService.OPEN_CHAT_ID, chatId);
    }
  }

  close() {
    const chat = document.getElementById('chat');
      const profileMenu = document.getElementById('profileMenu');
      const rightMenu = document.getElementById('rightMenu');
      const mainScreen = document.getElementById('mainScreen');

      this.blurredBackgroundRemove();
      if (chat) {
        chat.style.display = 'none';
      }
      if (profileMenu) {
      profileMenu.style.display = 'none';
      }
      if (rightMenu) {
      rightMenu.style.display = 'none';
      }
      if (mainScreen) {
      mainScreen.style.display = 'flex';
      }

      const baseUrl = '';
      const currentUrl = this.router.url;
      if (currentUrl !== baseUrl) {
        this.router.navigateByUrl(baseUrl);
      }
  }

  getMessages() {
    this.messagesSubscription = this.localStorage.messages.subscribe(
      ({ chatId, messages }) => {
        if (this.currentChat.id) {
          this.messages = { chatId: this.currentChat.id, messages: messages };
        }
      }
    );
  }

  getOnlineDate(): Date | string {
    const participant = this.currentChat.participants.find(item => item.id !== LocalStorageService.CURRENT_USER_ID);
    if (participant && participant.onlineDate) {
      return User.dateTimeFormatter(participant.onlineDate);
    }
    return 'Был(а) в сети недавно';
  }

  blurredBackgroundAdd() {
    const blurredBackground = document.getElementById('blurredBackground');
    if (blurredBackground) {
      blurredBackground.style.display = 'grid';
      blurredBackground.style.opacity = '1';
    }
  }

  blurredBackgroundRemove() {
    const blurredBackground = document.getElementById('blurredBackground');
    if (blurredBackground) {
      blurredBackground.style.display = 'none';
    }
  }

  openRightMenu() {
    const rightMenu = document.getElementById('rightMenu');
    const menuChat = document.getElementById('menuChat');

    if (rightMenu && menuChat) {
      this.localStorage.updateIsOpenRightPanel(true);
      rightMenu.style.display = 'grid';
      this.blurredBackgroundAdd();
      setTimeout(() => {
        menuChat.style.transform = 'translateX(0)';
      }, 0);
    }
  }
  

  sendMessage(): Message {
    if (!this.isUpdate) {
      return this.createMessage();
    } else {
      return this.updateMessage();
    }
  }

  createMessage(): Message {
    this.newMessage = this.newMessage.replace(/\s+/g, ' ');
    if ((this.newMessage !== '' || this.newMsg.forwardedFrom || this.newMsg.attachments.length > 0) && this.currentChat.id) {
      this.newMsg.sender = new Profile(this.currentUserId);
      this.newMsg.chat = new Chat(this.currentChat.id, '',null, []);
      this.newMsg.text = this.newMessage;

      this.baseService.createMessage(LocalStorageService.CURRENT_USER_ID, this.currentChat.id, this.newMsg).subscribe((result: Message) => {
        // this.newMsg = result;
        this.openChat();
        this.newMessage = '';
        this.newMsg.forwardedFrom = null;
        setTimeout(() => {
          this.scrollToBottomSmoothly();
        }, 200);
      });
    this.newMsg.attachments.splice(0, this.newMsg.attachments.length);
    this.newMsg = new Message();
    }
    setTimeout(() => {
      this.updateChatPreviews(LocalStorageService.CURRENT_USER_ID);
      // this.scrollToBottomFast();
    }, 200);
    this.removeReplyToMessage();
    this.newMsg.forwardedFrom = null;
    return this.newMsg;
  }

  updateMessage(): Message {
    this.isUpdate = false;
    this.editableMessage.text = this.newMessage;
    if (this.currentChat.id) {
      this.baseService.updateMessage(LocalStorageService.CURRENT_USER_ID, this.currentChat.id, this.editableMessage)
      .subscribe((result: Message) => {
        this.editableMessage = result;
        this.newMessage = '';
      });
    }
    setTimeout(() => {
      this.updateChatPreviews(LocalStorageService.CURRENT_USER_ID);
    }, 200)
    return this.editableMessage;
  }

  updateChatPreviews(userId: number) {
    this.baseService.getChatPreviews(userId).subscribe((chatPreview: ChatPreview[]) => {
      this.localStorage.updateChatPreviews(chatPreview);
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.isValidMessage!) {
      if (event.key === "Enter" && this.newMessage && document.activeElement === event.target && this.isValidMessage()) {
        this.sendMessage();
      }
    }
    
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    const isModalSearch = document.getElementById('modal_search')?.contains(<Node>event.target);
    const isSearchInChat = document.getElementById('searchInChat')?.contains(<Node>event.target);
    if (!isModalSearch && !isSearchInChat) {
      this.searchText = '';
    }
  }

  searchMessageInChat() {
    if (this.searchText != '' && this.currentChat.id) {
      this.baseService
        .searchMessagesThisChat(LocalStorageService.CURRENT_USER_ID, this.currentChat.id, this.searchText)
        .subscribe((result: Message[]) => {
          this.foundMessages = result;
          this.oldSearchText = this.searchText;
        });
    }
  }

  goToMessage(messageId: number | null) {
    this.searchText = '';
    const message = document.querySelector('#message' + messageId) as HTMLElement;
    const chatContainer = document.querySelector('.chat-container') as HTMLElement;
  
    if (message && chatContainer) {
      chatContainer.scrollTop = message.offsetTop - chatContainer.offsetTop;
      message.classList.add('highlight');
  
      setTimeout(() => {
        message.classList.remove('highlight');
      }, 500);
    }
  }

  goToReplyMessage(message: Message | null) {
    if (message?.replyMessage?.id) {
      this.goToMessage(message.replyMessage.id);
    }
  }

  handleContextMenu(event: MouseEvent, message: Message) {
    this.activeMessageId = message.id;
    this.isOptionsVisible = true;
    const block = document.getElementById('message'+message.id);
    if (block) {
      const blockBounding = block.getBoundingClientRect();
      this.clickX = event.clientX - blockBounding.left;
      this.clickY = event.clientY - blockBounding.top;
    }
    event.preventDefault();
  }

  @HostListener('document:click', ['$event'])
  closeContextMenu(event: MouseEvent) {
    const isModalSearch = document.getElementById('message-options')?.contains(<Node>event.target);
    if (!isModalSearch) {
      this.activeMessageId = null;
    }
  }

  editMessage(message: Message) {
    this.activeMessageId = null;
    this.newMessage = message.text;
    this.editableMessage = message;
    this.isUpdate = true;
    if (message.replyMessage) {
      this.replyMessage = message.replyMessage; 
    }
  }

  deleteMessage(message: Message) {
    this.activeMessageId = null;
    if (message.chat?.id && message.id) {
      this.localStorage.removeMessage(message);
      this.baseService.deleteMessage(LocalStorageService.CURRENT_USER_ID, message.chat?.id, message.id).subscribe();

      const isExist = this.messages.messages.findIndex(msg => msg.id === message.id);
      if (isExist !== -1) {
        this.messages.messages.splice(isExist, 1);
      }
    }
    setTimeout(() => {
      this.updateChatPreviews(LocalStorageService.CURRENT_USER_ID);
    }, 200)
  }

  replyMessage: Message = new Message();

  replyToMessage(message: Message) {
    this.activeMessageId = null;
    this.replyMessage = message;

    const replyMessage = new Message();
    replyMessage.id = message.id;

    this.newMsg.replyMessage = replyMessage;
  }

  removeReplyToMessage() {
    this.replyMessage = new Message();
  }

  forwardMessage(message: Message) {
    this.activeMessageId = null;
    this.newMsg.forwardedFrom = [];
    this.addForwardMessage(message);
  }

  addForwardMessage(message: Message) {
    if (this.newMsg.forwardedFrom) {
      const msgBlock = document.getElementById('message'+message.id);
      const width = 2;
      const index = this.newMsg.forwardedFrom.findIndex(it => it.id === message.id);
      if (index === -1) {
        this.newMsg.forwardedFrom.push(message);
        if (msgBlock) {
          msgBlock.style.padding = '6px 12px';
          msgBlock.style.border = width+'px solid #787878';
        }
        if (this.newMsg.forwardedFrom.length !== 0) {
          this.localStorage.updateIsForwarding(true);
        }
      } else {
        this.newMsg.forwardedFrom.splice(index, 1);
        if (msgBlock) {
          msgBlock.style.border = 'none';
          msgBlock.style.padding = '8px 14px';
        }
        if (this.newMsg.forwardedFrom.length === 0) {
          this.newMsg.forwardedFrom = null;
          this.localStorage.updateIsForwarding(false);
        }
      }
    }
  }
  
  isForward(message: Message): boolean {
    if (this.newMsg.forwardedFrom) {
      const result = this.newMsg.forwardedFrom.find(it => it.id === message.id);
      if (result) {
        return true;
      }
    }
    return false;    
  }

  copyMessage(message: Message) {
    this.activeMessageId = null;
    const textarea = document.createElement('textarea');
    const selectedText = window.getSelection()?.toString();
    if (selectedText) {
      textarea.value = selectedText;
    } else if (message && message.text) {
      textarea.value = message.text;
    }
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  getNumberParticipants(): string {
    if (this.currentChat.type === 'GROUP') {
      const numberParticipants = this.currentChat.participants.length;
      if (numberParticipants === 1) {
        return numberParticipants + ' участник';
      } else if(numberParticipants > 1 && numberParticipants < 5) {
        return numberParticipants + ' участника';
      } else if(numberParticipants > 4) {
        return numberParticipants + ' участников';
      }
    }
    return '';  
  }

  scrollToBottomFast(): void {
    setTimeout(() => {
      const chatContainer = document.getElementById('chatsContent');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 200);
  }

  scrollToBottomSmoothly(): void {
      try {
        if (this.messageContainer) {
          setTimeout(() => {
          this.messageContainer.nativeElement.style.scrollBehavior = 'smooth';
          this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
          }, 200);
        }
      } catch(err) {
        console.log(err);
      }
    }

  equals(senderId: number | undefined): boolean {
    let fool = senderId === LocalStorageService.CURRENT_USER_ID;
    return fool;
  }

  isValidMessage() {
    return this.newMessage.trim().replace(/\n/g, '') !== '' || this.newMsg.attachments.length > 0;
  }

  openDialogEmogi() {
    const dialogEmogi = 
    this.dialog.open(EmogiDialogComponent, {
      position: {
        right: '40px',
        bottom: '70px'
      },
      panelClass: 'emogiDialogContainer'
    });
    
    const subscribe = this.localStorage.selectedEmogi$.subscribe((emogi) => {
      if (emogi) {
        this.newMessage = `${this.newMessage}${emogi}`;
      }
    });
    dialogEmogi.afterClosed().subscribe((emogi: any) => {
        this.localStorage.setSelectedEmogi(null);
        subscribe.unsubscribe();
    });
  }

  formatDate(dateString: Date | null): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string');
    }
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  removeAttachment(id: number) {
    const index = this.newMsg.attachments.findIndex(it => it.id === id);
    this.newMsg.attachments.splice(index, 1);
  }

  openDialogViewingImages(photo: String | null) {
    if (photo) {
      const dialogCreationChat = 
      this.dialog.open(ViewingImagesComponent, {
        data: photo
      });
    }
  }

}
