import { parse } from "date-fns";
import { Chat } from "./Chat";
import { Profile } from "./Profile";

export class Message {
    id: number | null;
    sender: Profile | null;
    chat: Chat | null;
    createDate: Date | null;
    state: string | null;
    text: string;
    replyMessage: Message | null;
    forwardedFrom: Message[] | null;
    attachments: {id: number, file: String}[];
    typeMessage: string;

    constructor() {
        this.id = null;
        this.sender = null;
        this.chat = null;
        this.createDate = null;
        this.state = null;
        this.text = '';
        this.replyMessage = null;
        this.forwardedFrom = null;
        this.attachments = [];
        this.typeMessage = '';
    }

    public static convertToObjFromJSON(body: string): Message {
        const message: Message = new Message();
        Object.assign(message, JSON.parse(body));
    
        if (message.createDate) {
            const dateString = message.createDate.toString().replaceAll(/"/g, '');
            const dateParts = dateString.split(",").map(Number);

            const year = dateParts[0];
            const month = dateParts[1];
            const day = dateParts[2];
            const hour = dateParts[3];
            const minute = dateParts[4];
            const second = dateParts[5];
            const millisecond = dateParts[6];
            
            const dt: string = day +'-'+ month +'-'+ year +' '+ hour +':'+ minute +':'+ second;
            const date = parse(dt, 'dd-MM-yyyy HH:mm:ss', new Date());
               
            message.createDate = new Date(date);
        }
        
        return message;
    }

    public static dateTimeFormatter(dateTime: Date): string {
        const currentDate = new Date();
        if (dateTime.toDateString() === currentDate.toDateString()) {
          const time = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          return time;
        } else {
          const date = `${dateTime.getDate()}.${dateTime.getMonth() + 1}.${dateTime.getFullYear()}`;
          return date;
        }
    }
}