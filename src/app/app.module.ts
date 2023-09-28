import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ChatPreviewComponent } from './components/chat-preview/chat-preview.component';
import { LeftSidePanelComponent } from './components/left-side-panel/left-side-panel.component';
import { RightSidePanelComponent } from './components/right-side-panel/right-side-panel.component';
import { ChatComponent } from './components/chat/chat.component';
import { MainComponent } from './components/main/main.component';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChatCreationDialogComponent } from './components/chat-creation-dialog/chat-creation-dialog.component';
import { LocalStorageService } from './components/storage/localStorageService';
import { SettingEditDialogComponent } from './components/setting-edit-dialog/setting-edit-dialog.component';
import { LoginComponent } from './components/login/login.component';
import { DelayedMessageDialogComponent } from './components/delayed-message-dialog/delayed-message-dialog.component';
import { EmogiDialogComponent } from './components/emogi-dialog/emogi-dialog.component';
import { HorizontalScrollDirective } from './directives/HorizontalScrollDirective';
import { ViewingImagesComponent } from './components/viewing-images/viewing-images.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatPreviewComponent,
    LeftSidePanelComponent,
    RightSidePanelComponent,
    ChatComponent,
    MainComponent,
    ChatCreationDialogComponent,
    SettingEditDialogComponent,
    LoginComponent,
    DelayedMessageDialogComponent,
    EmogiDialogComponent,
    HorizontalScrollDirective,
    ViewingImagesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatDialogModule,
    BrowserAnimationsModule, 
    MatFormFieldModule, 
    MatInputModule
  ],
  providers: [LocalStorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
