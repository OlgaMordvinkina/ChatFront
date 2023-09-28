import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Chat } from '../models/Chat';
import { ChatPreview } from '../models/ChatPreview';
import { LoginUser } from '../models/LoginUser';
import { Message } from '../models/Message';
import { NewChat } from '../models/NewChat';
import { Profile } from '../models/Profile';
import { User } from '../models/User';
import { UserRegister } from '../models/UserRegister';
import { Buffer } from 'buffer';
import { LocalStorageService } from '../components/storage/localStorageService';
import { ApiUrls } from './ApiUrls';

@Injectable({
  providedIn: 'root'
})
export class BaseServiceService {

  constructor(private http: HttpClient) { }

  getChatPreviews(userId: number): Observable<ChatPreview[]> {
    return this.http.get<ChatPreview[]>(ApiUrls.GET_CHAT_PREVIEW(userId), { headers: this.getHeaders() });
  }

  getChat(userId: number, chatId: number): Observable<Chat> {
    return this.http.get<Chat>(ApiUrls.GET_CHAT(userId, chatId), { headers: this.getHeaders() });
  }

  createChat(userId: number, chat: NewChat): Observable<Chat> {
    return this.http.post<Chat>(ApiUrls.CREATE_CHAT(userId), chat, { headers: this.getHeaders() }).pipe();
  }

  deleteChat(userId: number, chatId: number): Observable<any> {
    return this.http.delete<any>(ApiUrls.DELETE_CHAT(userId, chatId), { headers: this.getHeaders() });
  }

  updatePhotoChat(userId: number, chatId: number, photo: string): Observable<Chat> {
    return this.http.put<Chat>(ApiUrls.UPDATE_PHOTO_CHAT(userId, chatId), photo, { headers: this.getHeaders() });
  }



  getMessages(userId: number, chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(ApiUrls.GET_MESSAGE(userId, chatId), { headers: this.getHeaders() });
  }

  createMessage(userId: number, chatId: number, newMessage: Message): Observable<Message> {
    return this.http.post<Message>(ApiUrls.CREATE_MESSAGE(userId, chatId), newMessage, { headers: this.getHeaders() }).pipe();
  }

  updateMessage(userId: number, chatId: number, updateMessage: Message): Observable<Message> {
    return this.http.put<Message>(ApiUrls.UPDATE_MESSAGE(userId, chatId), updateMessage, { headers: this.getHeaders() }).pipe();
  }

  deleteMessage(userId: number, chatId: number, messageId: number): Observable<any> {
    return this.http.delete<any>(ApiUrls.DELETE_MESSAGE(userId, chatId, messageId), { headers: this.getHeaders() });
  }

  searchMessagesAllChats(userId: number, desired: string): Observable<Message[]> {
    return this.http.get<Message[]>(ApiUrls.SEARCH_MESSAGE_ALL_CHATS(userId, desired), { headers: this.getHeaders() });
  }

  searchMessagesThisChat(userId: number, chatId: number, desired: string): Observable<Message[]> {
    return this.http.get<Message[]>(ApiUrls.SEARCH_MESSAGE_THIS_CHAT(userId, chatId, desired), { headers: this.getHeaders() });
  }

  updateStateMessages(userId: number, chatId: number): Observable<any> {
    return this.http.put<number>(ApiUrls.UPDATE_STATE_MESSAGES(userId, chatId), null, { headers: this.getHeaders() });
  }



  addParticipant(userId: number, chatId: number, participantUserId: number): Observable<User> {
    return this.http.post<User>(ApiUrls.ADD_PARTICIPANT(userId, chatId, participantUserId), null, { headers: this.getHeaders() }).pipe();
  }

  deleteParticipantFromChat(userId: number, chatId: number, deletedUserId: number): Observable<any> {
    return this.http.delete<any>(ApiUrls.DELETE_PARTICIPANT_FROM_CHAT(userId, chatId, deletedUserId), { headers: this.getHeaders() });
  }



  loginUser(user: LoginUser): Observable<HttpResponse<any>> {
    const encodedCredentials = Buffer.from(`${user.username}:${user.password}`).toString('base64');
    const headers = { Authorization: `Basic ${encodedCredentials}`,};
    localStorage.setItem(LocalStorageService.LOGIN, encodedCredentials);
    return this.http.post<any>(ApiUrls.LOGIN_USER, null, { headers });
  }

  logoutUser(): Observable<HttpResponse<any>> {
    return this.http.post<any>(ApiUrls.LOGOUT_USER, null, { headers: this.getHeaders() });
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(ApiUrls.GET_USER_BY_EMAIL(email), { headers: this.getHeaders() });
  }

  searchUser(userId: number, desired: string): Observable<User[]> {
    return this.http.get<User[]>(ApiUrls.SEARCH_USER(userId, desired), { headers: this.getHeaders() });
  }

  createUser(userRegister: UserRegister): Observable<User> {
    return this.http.post<User>(ApiUrls.CREATE_USER, userRegister).pipe();
  }

  updateUser(userId: number, user: UserRegister): Observable<User> {
    return this.http.put<User>(ApiUrls.UPDATE_USER(userId), user, { headers: this.getHeaders() }).pipe();
  }

  

  getProfile(userId: number): Observable<Profile> {
    return this.http.get<Profile>(ApiUrls.GET_PROFILE(userId), { headers: this.getHeaders() });
  }

  updateProfile(userId: number, user: UserRegister): Observable<Profile> {
    return this.http.put<Profile>(ApiUrls.UPDATE_PROFILE(userId), user, { headers: this.getHeaders() }).pipe();
  }

  updateOnlineDate(userId: number): Observable<Profile> {
    return this.http.put<Profile>(ApiUrls.UPDATE_ONLINE_DATE(userId), null, { headers: this.getHeaders() }).pipe();
  }



  private getHeaders(): { Authorization: string; } {
    const login = localStorage.getItem(LocalStorageService.LOGIN);
    return { Authorization: `Basic ${login}`,};
  }
}
