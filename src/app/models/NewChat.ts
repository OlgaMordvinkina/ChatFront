import { User } from "./User";

export class NewChat {
    id: number | null;
    title: string;
    type: string;
    participants: number[];
  
    constructor(id: number | null, title: string,
        type: string, participants: number[]) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.participants = participants;
    }
}