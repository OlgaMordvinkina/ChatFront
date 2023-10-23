import { AfterViewChecked, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Chat } from 'src/app/models/Chat';
import { ChatPreview } from 'src/app/models/ChatPreview';
import { Message } from 'src/app/models/Message';
import { NewChat } from 'src/app/models/NewChat';
import { User } from 'src/app/models/User';
import { BaseServiceService } from 'src/app/services/base-service.service';
import { LocalStorageService } from '../storage/localStorageService';

@Component({
  selector: 'app-chat-creation-dialog',
  templateUrl: './chat-creation-dialog.component.html',
  styleUrls: ['./chat-creation-dialog.component.scss']
})
export class ChatCreationDialogComponent implements OnInit, AfterViewChecked {
  newChat: NewChat;
  desired: string = '';
  oldDesired: string = '';
  users: User[] = [];
  userForCreationPrivateChat: User;
  currentChat: Chat = new Chat(null, '', '', []);
  messages: Message[] = [];
  defineTitle: boolean = false;

  constructor(public dialogRef: MatDialogRef<ChatCreationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Chat,
    private baseService: BaseServiceService,
    private router: Router) {
    this.newChat = new NewChat(null, '', '', []);
    this.userForCreationPrivateChat = new User();
  }

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    if (this.desired !== this.oldDesired) {
      this.searchUser();
    }
  }

  isActive(): boolean {
    let privat = this.userForCreationPrivateChat.id === null;
    let group = this.newChat.participants.length === 0;
    if (privat && group) {
      return false;
    } else {
      return true;
    }
  }

  chooseUser(user: User) {
    const participant = document.getElementById('participant'+user.id);
    if (participant) {
      participant.style.backgroundColor = '#0e0e0e';
    }

    if (this.data.type === 'PRIVATE' || this.data.type === 'add_participant') {
      const old = document.getElementById('participant'+this.userForCreationPrivateChat.id);
      if (old) {
        old.style.backgroundColor = '#353535';
      }
      if (this.userForCreationPrivateChat.id !== user.id && user.id) {
        this.userForCreationPrivateChat = user;
        this.newChat.participants = [];
        this.newChat.participants.push(user.id);
      } else {
        this.userForCreationPrivateChat = new User();
        this.newChat.participants = [];
      }
    } else if (this.data.type === 'GROUP') {
      if (user.id && !this.deleteUserFromSelectedMember(user.id)) {
        this.newChat.participants.push(user.id);
      }
    }
  }

  deleteUserFromSelectedMember(selectedUserId: number): boolean {
    const index = this.newChat.participants.findIndex(userId => userId === selectedUserId);
    if (index !== -1) {
      this.newChat.participants.splice(index, 1);
      const old = document.getElementById('participant'+selectedUserId);
      if (old) {
        old.style.backgroundColor = '#353535';
      }
      return true;
    }
    return false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  searchUser() {
    if (this.desired != '') {
      this.baseService.searchUser(LocalStorageService.CURRENT_USER_ID, this.desired)
      .subscribe((findUsers: User[]) => {
        this.users = findUsers;
        this.oldDesired = this.desired;
      });
    }
  }


  send() {
    this.defineTitle = false;
  }

  openChat(chatId: number) {
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

    this.baseService.getChat(LocalStorageService.CURRENT_USER_ID, chatId).subscribe((chat: Chat) => {
      this.currentChat = chat;
    });

    this.baseService.getMessages(LocalStorageService.CURRENT_USER_ID, chatId, null).subscribe((messages: Message[]) => {
      this.messages = messages;
    });
  }

  defineTitleChat() {
    this.desired = '';
    this.users = [];
    this.defineTitle = true;
  }
}
