export class Profile {
    id: number | null;
    name: string;
    surname: string;
    photo: string;
    type: string;
    setting: { id: number, setting: string };
    userId: number;
    onlineDate: Date | null;
  
    constructor(userId: number) {
        this.id = null;
        this.name = '';
        this.surname = '';
        this.photo = '';
        this.type = '';
        this.setting = { id: 0, setting: '' };
        this.userId = userId;
        this.onlineDate = null;
    }
}