import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoginUser } from 'src/app/models/LoginUser';
import { User } from 'src/app/models/User';
import { UserRegister } from 'src/app/models/UserRegister';
import { BaseServiceService } from 'src/app/services/base-service.service';
import { SettingEditDialogComponent } from '../setting-edit-dialog/setting-edit-dialog.component';
import { LocalStorageService } from '../storage/localStorageService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  user: UserRegister;
  isRightData: boolean = true;

  constructor(private baseService: BaseServiceService, public dialog: MatDialog, private router: Router) {
    this.user = new UserRegister();
  }

  ngOnInit(): void {}

  openRegisterDialog() {
    const dialogCreationChat = 
    this.dialog.open(SettingEditDialogComponent, {
      width: '400px',
      data: 'REGISTRATION'
    });

    dialogCreationChat.afterClosed().subscribe((userRegister: UserRegister) => {
      if (userRegister) {
        if ((userRegister.email !== '' && this.isEmailValid(userRegister.email)) 
          || (userRegister.password !== '' && userRegister.repeatPassword !== '' && this.isPasswordValid(userRegister.password, userRegister.repeatPassword))
          ) {
            this.baseService.createUser(userRegister).subscribe((user: User) => {
              
            });
        }
      }
    });
  }
  
  loginUser() {
    const user: LoginUser = new LoginUser(this.user.email.toLocaleLowerCase(), this.user.password);
    try {
      this.baseService.loginUser(user).subscribe(
        (response: any) => {
          // const encodedCredentials = Buffer.from(`${user.username}:${user.password}`).toString('base64');
          // localStorage.setItem(LocalStorageService.LOGIN, encodedCredentials);
          localStorage.setItem(LocalStorageService.EMAIL, response.username);
          this.baseService.getUserByEmail(response.username).subscribe(
            (fullUser: User) => {
              if (fullUser && fullUser.id) {
                localStorage.setItem(LocalStorageService.ID, JSON.stringify(fullUser.id));
              }
            });
          this.router.navigate(['/']);
        }
      );
      setTimeout(() => {
        window.location.reload();
      }, 300);
    
    } catch {
      this.isRightData = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.isActive() && event.key === "Enter") {
      this.loginUser();
    }
  }

  isActive(): boolean {
    if (this.user.password.length >= 8) {
      return true;
    }
    return false;
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
}
