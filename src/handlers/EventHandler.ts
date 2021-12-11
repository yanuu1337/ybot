import { Collection } from "discord.js";
import ArosClient from "../extensions/ArosClient";
import Event from "../lib/structures/Event";
import { join } from 'path'
import { readdir, lstat } from 'fs/promises'
export default class EventHandler extends Collection<string, Event> {
    client: ArosClient;

    constructor(client: ArosClient) {
        super();
        this.client = client;
        
        this.init('../events').catch(err => client.logger.error(`Error: `, err))
    }

    private async init(dir: string) {
        
        const filePath = join(__dirname, dir)
        const files = await readdir(filePath);
        
        for(const file of files) {
            if ((await lstat(join(filePath, file))).isDirectory()) this.init(join(dir, file));
            if(file?.endsWith('.js') && !file?.endsWith('.dev.js')) {
                const {default: Event} = await import(join(dir, file))
                const event = new Event(this.client, file.split('.')[0]);
                this.set(file.split('.')[0], event)
                this.client[event.once ? 'once' : 'on'](event.name, (...args: unknown[]) => event.execute(...args)) 
            }
        }
        this.client.logger.info(`Successfully loaded ${this.size} events!`)
    }
}