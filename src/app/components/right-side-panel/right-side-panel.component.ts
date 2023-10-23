import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Attachment } from 'src/app/models/Attachment';
import { Chat } from 'src/app/models/Chat';
import { ChatPreview } from 'src/app/models/ChatPreview';
import { Profile } from 'src/app/models/Profile';
import { User } from 'src/app/models/User';
import { BaseServiceService } from 'src/app/services/base-service.service';
import { ChatCreationDialogComponent } from '../chat-creation-dialog/chat-creation-dialog.component';
import { LocalStorageService } from '../storage/localStorageService';
import { ViewingImagesComponent } from '../viewing-images/viewing-images.component';

@Component({
  selector: 'app-right-side-panel',
  templateUrl: './right-side-panel.component.html',
  styleUrls: ['./right-side-panel.component.scss']
})
export class RightSidePanelComponent implements OnInit, OnDestroy, AfterViewChecked {
  currentUserId: number = LocalStorageService.CURRENT_USER_ID;
  @Input() currentChat: Chat = new Chat(null, '', '', []);
  @Input() profile: Profile = new Profile(0);

  @Output() blurredBackgroundRemoveEmit = new EventEmitter();
  @ViewChild('attachment', { static: false }) attachmentChat!: ElementRef;
  @ViewChild('attachmentContainer', { static: false }) attachmentContainer!: ElementRef;

  private isOpenRightChatSubscription!: Subscription;
  // isOpenRightPanel: boolean = false;


  constructor(private baseService: BaseServiceService, 
              private localStorage: LocalStorageService, 
              private router: Router,
              public dialog: MatDialog) {}

  ngOnInit(): void {
     this.isOpenRightChatSubscription = this.localStorage.isOpenRightPanel.subscribe(
      (isOpen: boolean) => {
        if (isOpen) {
          this.getAttachments();
        }
        // this.isOpenRightPanel = isOpen;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.isOpenRightChatSubscription) {
      this.isOpenRightChatSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked(): void {
    // if (this.isOpenRightPanel) {
    //   this.getAttachments();
    // }
  }

  @ViewChild('attachmentContainer', { static: false }) scrollContainer!: ElementRef;
  onScroll(event: Event) {
    const container = this.scrollContainer.nativeElement;
    container.addEventListener('scroll', (event: any) => {
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 0 && !this.loading) {
        this.getAttachments();
      }
    });
  }

  page: number = 1;
  size: number | null = null;
  loading: boolean = false;
  getAttachments() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    if (this.currentChat.id) {
      this.baseService.getAttachmentsChat(this.currentUserId, this.currentChat.id, this.page, this.size).subscribe((attachment: Attachment[]) => {
        if (attachment) {
        if (!this.currentChat.attachments) {
          this.currentChat.attachments = [];
        }
        this.currentChat.attachments.push(...attachment);
        this.currentChat.attachments.sort((a, b) => {
          if (b.id === null) return -1;
          if (a.id === null) return 1;
          return b.id - a.id;
      });
        ++this.page;
        this.loading = false;
        }});
    }
    // this.localStorage.updateIsOpenRightPanel(false);
  }

  closeRightMenu() {
    const rightMenu = document.getElementById('rightMenu');
    const menuChat = document.getElementById('menuChat');

    if (rightMenu && menuChat) {
      this.blurredBackgroundRemoveEmit.emit();
      setTimeout(() => {
        rightMenu.style.display = 'none';
      }, 500);
      menuChat.style.transform = 'translateX(100%)';
    }
    this.localStorage.updateIsOpenRightPanel(false);
    this.page = 1;
  }

  getNumberParticipantsOrEmail(): string {
    if (this.currentChat.type === 'GROUP') {
      const numberParticipants = this.currentChat.participants.length;
      if (numberParticipants === 1) {
        return numberParticipants + ' участник:';
      } else if(numberParticipants > 1 && numberParticipants < 5) {
        return numberParticipants + ' участника:';
      } else if(numberParticipants > 4) {
        return numberParticipants + ' участников:';
      }
    } else {
        if (this.currentChat.participants) {
          const userWithEmail = this.currentChat.participants.find(user => user.id != this.currentUserId)?.email;
        if (userWithEmail) {
          return userWithEmail;
        } 
      }
    }
    return '';
  }

  isAdmin(): boolean {
    if (this.currentChat.type === 'GROUP' && 
    this.currentChat.participants.find((user: User) => user.type === 'ADMIN')?.id === this.currentUserId) {
      return true;
    } else {
      return false;
    }
  }

  deleteParticipant(deletedUser: User) {
    if (this.currentChat.id && deletedUser.id) {
      this.baseService.deleteParticipantFromChat(LocalStorageService.CURRENT_USER_ID, this.currentChat.id, deletedUser.id)
      .subscribe();

      const isExist = this.currentChat.participants.findIndex(participant => participant.id === deletedUser.id);
      if (isExist !== -1) {
        this.currentChat.participants.splice(isExist, 1);
      }
    }
  }

  deleteChat(chat: Chat) {
    if (chat.id) {
      this.baseService.deleteChat(LocalStorageService.CURRENT_USER_ID, chat.id)
      .subscribe();

      this.closeChat();

      setTimeout(() => {
        this.updateChatPreviews(LocalStorageService.CURRENT_USER_ID);
      }, 200)
    }
  }

  updateChatPreviews(userId: number) {
    this.baseService.getChatPreviews(userId).subscribe((chatPreview: ChatPreview[]) => {
      this.localStorage.updateChatPreviews(chatPreview);
    });
  }

  closeChat() {
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

    blurredBackgroundRemove() {
      const blurredBackground = document.getElementById('blurredBackground');
      if (blurredBackground) {
        blurredBackground.style.display = 'none';
      }
    }

    addParticipantInChat() {
      let chat = new Chat(this.currentChat.id, '', 'add_participant', []);

      const dialogCreationChat = 
      this.dialog.open(ChatCreationDialogComponent, {
        width: '400px',
        height: '430px',
        data: chat
      });

      dialogCreationChat.afterClosed().subscribe((result: User) => {
        if (result) {
          const isExist = this.currentChat.participants.findIndex(participant => participant.id === result.id);
          if (isExist === -1) {
            if (result.id && this.currentChat.id) {
              this.baseService.addParticipant(LocalStorageService.CURRENT_USER_ID, this.currentChat.id, result.id)
              .subscribe((user: User) => {
                this.currentChat.participants.push(result);
              });  
            }
          }   
        }     
      });
    }

    uploadPhotoChat() {
      const fileInput = document.getElementById('fileInputChat') as HTMLInputElement;

      fileInput?.click();
          
      fileInput.addEventListener('change', (event: Event) => {
        const target = event.target as HTMLInputElement;
      
        const file = target.files;
        if (file && file.length > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target && typeof event.target.result === 'string') {
                const base64File = event.target.result;
                this.currentChat.photo = base64File;

                if (this.currentChat.id) {
                  this.baseService.updatePhotoChat(this.currentUserId, this.currentChat.id, base64File).subscribe((chat: Chat) => {
                      this.currentChat = chat;
                  });
                }
              }
            };
            reader.readAsDataURL(file[0]);
        }
      });
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
