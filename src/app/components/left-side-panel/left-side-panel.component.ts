import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Profile } from 'src/app/models/Profile';
import { User } from 'src/app/models/User';
import { UserRegister } from 'src/app/models/UserRegister';
import { BaseServiceService } from 'src/app/services/base-service.service';
import { SettingEditDialogComponent } from '../setting-edit-dialog/setting-edit-dialog.component';
import { LocalStorageService } from '../storage/localStorageService';
import { ViewingImagesComponent } from '../viewing-images/viewing-images.component';

@Component({
  selector: 'app-left-side-panel',
  templateUrl: './left-side-panel.component.html',
  styleUrls: ['./left-side-panel.component.scss']
})
export class LeftSidePanelComponent implements OnInit {
  @Output() blurredBackgroundRemoveEmit = new EventEmitter();
  currentProfile: Profile = new Profile(LocalStorageService.CURRENT_USER_ID);
  currentUser: User = new User();

  constructor(private baseService: BaseServiceService, 
              public dialog: MatDialog, 
              private router: Router,
              private localStorage: LocalStorageService) {
    this.userDefinition();
  }

  ngOnInit(): void {
  }

  userDefinition() {
    const email = localStorage.getItem(LocalStorageService.EMAIL);
    if (email) {
      this.baseService.getUserByEmail(email).subscribe((user: User) => {
        this.currentUser = user;
        if (user.id) {
          localStorage.setItem(LocalStorageService.ID, JSON.stringify(user.id));

          this.baseService.getProfile(user.id).subscribe((profile: Profile) => {
            this.currentProfile = profile;
            localStorage.setItem(LocalStorageService.SETTING_PROFILE_ID, JSON.stringify(profile.setting.id))
          });
        }
      });
    }
  }

  closeLeftMenu() {
    const profileMenu = document.getElementById('profileMenu');
    const settingsProfile = document.getElementById('settingsProfile');

    if (profileMenu && settingsProfile) {
      this.blurredBackgroundRemoveEmit.emit();
      setTimeout(() => {
        profileMenu.style.display = 'none';
      }, 500);
      settingsProfile.style.transform = 'translateX(-100%)';
    }
  }

  logoutFromProfile() {
    this.localStorage.updateChatPreviews([]);
    this.localStorage.updateMessages(0, []);

    this.localStorage.triggerLogout(() => {
        localStorage.removeItem(LocalStorageService.LOGIN);
        localStorage.removeItem(LocalStorageService.ID);
        localStorage.removeItem(LocalStorageService.EMAIL);
        localStorage.removeItem(LocalStorageService.OPEN_CHAT_ID);
        localStorage.removeItem(LocalStorageService.SETTING_PROFILE_ID);
        localStorage.clear();
        this.router.navigate(['/login']);
    });
  }

  openDialog(type: string) {
    const dialogCreationChat = 
    this.dialog.open(SettingEditDialogComponent, {
      width: '400px',
      data: type
    });

    dialogCreationChat.afterClosed().subscribe((userRegister: UserRegister) => {
      if (userRegister) {
        if (this.isValidNames(userRegister.name) || this.isValidNames(userRegister.surname) || userRegister.settingId !== null || userRegister.photoUser !== null) {
          this.baseService.updateProfile(LocalStorageService.CURRENT_USER_ID, userRegister).subscribe((profile: Profile) => {
            this.currentProfile = profile;
            localStorage.setItem(LocalStorageService.SETTING_PROFILE_ID, JSON.stringify(profile.setting.id));
            if (userRegister.photoUser) {
              this.currentProfile.photo = userRegister.photoUser;
            }
          });
        }

        if ((userRegister.email !== '' && this.isEmailValid(userRegister.email)) 
          || (userRegister.password !== '' && userRegister.repeatPassword !== '' && this.isPasswordValid(userRegister.password, userRegister.repeatPassword))
          ) {
            this.baseService.updateUser(LocalStorageService.CURRENT_USER_ID, userRegister).subscribe((user: User) => {
              this.currentUser = user;
            });
        }

        if (userRegister.photoUser) {
          this.currentProfile.photo = userRegister.photoUser;
        }
      }
    });
  }

  isEmailValid(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  }

  isPasswordValid(password: string, repeatPassword: string): boolean {
    if (password === repeatPassword 
      && password.length >= 8) {
        return true;
      }
    return false;
  }

  isValidNames(name: string) {
    if (name !== '' && /^\s*$/.test(name)) {
      return true;
    } else {
      return false;
    }
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
