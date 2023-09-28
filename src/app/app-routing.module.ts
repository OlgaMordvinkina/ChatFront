import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: 'login', 
    component: LoginComponent
  },
  { 
    path: '', 
    component: MainComponent,
    children: [
      { path: 'chats/:id', 
      component: ChatComponent,
      canActivate: [AuthGuard]
    }
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
