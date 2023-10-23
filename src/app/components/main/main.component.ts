import { AfterViewChecked, Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Chat } from 'src/app/models/Chat';
import { Message } from 'src/app/models/Message';
import { NewChat } from 'src/app/models/NewChat';
import { Profile } from 'src/app/models/Profile';
import { BaseServiceService } from 'src/app/services/base-service.service';
import { LocalStorageService } from '../storage/localStorageService';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, AfterViewChecked, OnDestroy {
  currentUserId: number = LocalStorageService.CURRENT_USER_ID; 
  searchText = '';
  oldSearchText = '';
  foundMessages: Message[] = [];
  private isForwardingSubscription!: Subscription;
  isForwarding: boolean = false;

  @Output() currentChatEvent = new EventEmitter<Chat>();

  constructor(private baseService: BaseServiceService,
              private router: Router,
              private localStorage: LocalStorageService) {}
  
  ngOnInit(): void {
    this.getIsForwarMessages();
  }

  ngAfterViewChecked(): void {
    if (this.searchText !== '' && this.searchText !== this.oldSearchText) {
      this.searchMessageInChat();
    }
  }

  ngOnDestroy() {
    this.isForwardingSubscription.unsubscribe();
  }

  getIsForwarMessages() {
    this.isForwardingSubscription = this.localStorage.forwarding.subscribe(
      (is: boolean) => {
        this.isForwarding = is;
      }
    );
  }

  createChat(userId: number, newChat: NewChat): Chat | any {
    let chat: Chat | any;
    this.baseService.createChat(userId, newChat).subscribe((el: Chat) => {
      chat = el;
    });
    return chat;
  }

  @HostListener('document:keydown', ['$event'])
  closeChat(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.close();
      this.localStorage.updateIsForwarding(false);
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

  openLeftMenu() {
    const profileMenu = document.getElementById('profileMenu');
    const settingsProfile = document.getElementById('settingsProfile');

    if (profileMenu && settingsProfile) {
        profileMenu.style.display = 'grid';
        this.blurredBackgroundAdd();
        setTimeout(() => {
          settingsProfile.style.transform = 'translateX(0)';
        }, 0);
    }
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

  searchMessageInChat() {
    if (this.searchText != '') {
      this.baseService
        .searchMessagesAllChats(LocalStorageService.CURRENT_USER_ID, this.searchText)
        .subscribe((result: Message[]) => {
          this.foundMessages = result;
          this.oldSearchText = this.searchText;
        });
    }
  }

  goToMessage(chatId: number | null | undefined, messageId: number | null) {
    this.searchText = '';
    if (chatId) {
      this.openChat(chatId).then(() => {
        setTimeout(() => {
          const message = document.querySelector('#chat .chat-container #message' + messageId) as HTMLElement;
          const chatContainer = document.querySelector('#chat .chat-container') as HTMLElement;
          if (message && chatContainer) {
            chatContainer.scrollTop = message.offsetTop - chatContainer.offsetTop;
            setTimeout(() => {
              message.classList.add('highlight');
            }, 200);
            setTimeout(() => {
              message.classList.remove('highlight');
            }, 700);
          }
        }, 300);
        
      });
    }
  }

  openChat(chatId: number | null): Promise<void>  {
    return new Promise<void>((resolve, reject) => {
      if (chatId) {
        this.router.navigate([`/chats/${chatId}`]);
      }
      resolve();
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    const isModalSearch = document.getElementById('modal_search')?.contains(<Node>event.target);
    const isSearchInChat = document.getElementById('searchInChat')?.contains(<Node>event.target);

      this.baseService.updateOnlineDate(this.currentUserId).subscribe((profile: Profile) => {});
  }
}
