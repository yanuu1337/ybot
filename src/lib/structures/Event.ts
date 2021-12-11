import ArosClient from "../../extensions/ArosClient";

export default class Event {
    client: ArosClient;
    name: string;
    once = false;

    constructor(client: ArosClient, name: string) {
        this.client = client;
        this.name = name;
    }

    execute(...args: unknown[]) {
    }
}