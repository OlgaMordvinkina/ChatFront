export class User {
    id: number | null;
    fullName: string;
    email: string;
    onlineDate: string;
    type: string;
    photo: string | null;
  
    constructor() {
        this.id = null;
        this.fullName = '';
        this.email = '';
        this.onlineDate = '';
        this.type = '';
        this.photo = null;
    }

    public static dateTimeFormatter(dateTimeString: string): string {
        const dateTime = new Date(dateTimeString);
        const currentDate = new Date();
        
        if (
          dateTime.getDate() === currentDate.getDate() &&
          dateTime.getMonth() === currentDate.getMonth() &&
          dateTime.getFullYear() === currentDate.getFullYear()
        ) {
          const time = dateTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          return time;
        } else {
          const day = dateTime.getDate() < 10 ? `0${dateTime.getDate()}` : dateTime.getDate();
          const month = (dateTime.getMonth() + 1) < 10 ? `0${dateTime.getMonth() + 1}` : dateTime.getMonth() + 1;
          const date = `${day}.${month}.${dateTime.getFullYear()}`;
          return date;
        }
    }
}