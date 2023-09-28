export class UserRegister {
    email: string;
    password: string;
    repeatPassword: string;
    name: string;
    surname: string;
    settingId: number | null;
    photoUser: string | null;
  
    constructor() {
        this.email = '';
        this.password = '';
        this.repeatPassword = '';
        this.name = '';
        this.surname = '';
        this.settingId = null;
        this.photoUser = null;
    }
}