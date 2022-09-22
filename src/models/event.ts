import location from './location';

export default class Event {

    id: number;
    datetime: Date;
    name: string;
    summary: string;
    url: string;
    type: string;
    location: location;

    constructor(id: number, datetime: Date, name: string, summary: string, url: string, type: string, location: location) {
        this.id = id;
        this.datetime = datetime;
        this.name = name;
        this.summary = summary;
        this.url = url;
        this.type = type;
        this.location = location;
    }
}