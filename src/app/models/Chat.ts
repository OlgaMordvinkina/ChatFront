import { Attachment } from "./Attachment";
import { User } from "./User";

export class Chat {
    id: number | null;
    title: string;
    type: string | null;
    participants: User[];
    photo: string | null;
    attachments: Attachment[];

    constructor(id: number | null, title: string, type: string | null, participants: User[]) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.participants = participants;
        this.photo = null;
        this.attachments = [];
    }
}