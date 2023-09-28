import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/models/User';
import { UserRegister } from 'src/app/models/UserRegister';
import { BaseServiceService } from 'src/app/services/base-service.service';

@Component({
  selector: 'app-setting-edit-dialog',
  templateUrl: './setting-edit-dialog.component.html',
  styleUrls: ['./setting-edit-dialog.component.scss']
})
export class SettingEditDialogComponent {
  updatedUser: UserRegister;
  settingIds: number[] = [1,2,3];

  constructor(public dialogRef: MatDialogRef<SettingEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private baseService: BaseServiceService) {
    this.updatedUser = new UserRegister();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  isActive(): boolean {
    if (this.updatedUser.name !== '' 
      || this.updatedUser.surname !== '' 
      || (this.updatedUser.email !== '' && this.isEmailValid()) 
      || (this.updatedUser.password !== '' && this.updatedUser.repeatPassword !== '' && this.isPasswordValid()) 
      || this.updatedUser.settingId !== null
      || this.updatedUser.photoUser !== null) {
        return true;
      } else {
        return false;
      }
  }

  isEmailValid(): boolean {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(this.updatedUser.email);
  }

  isPasswordValid(): boolean {
    if (this.updatedUser.password && this.updatedUser.repeatPassword 
      && this.updatedUser.password === this.updatedUser.repeatPassword 
      && this.isLengthPassword()) {
        return true;
      }
    return false;
  }

  isLengthPassword(): boolean {
    if (this.updatedUser.password.length >= 8) {
      return true;
    }
    return false;
  }

  registerUser() {
    this.baseService.createUser(this.updatedUser).subscribe((user: User) => {});
  }


  uploadPhotoUser() {
    const fileInput = document.getElementById('fileInputPhoto') as HTMLInputElement;
        
    fileInput.addEventListener('change', (event: Event) => {
      const target = event.target as HTMLInputElement;
    
      const file = target.files;
      if (file && file.length > 0) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target && typeof event.target.result === 'string') {
              const base64File = event.target.result;
              this.updatedUser.photoUser = base64File;
            }
          };
          reader.readAsDataURL(file[0]);
      }
    });
  }
}
