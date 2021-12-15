import { Message } from 'discord.js';
import ArosClient from "../../extensions/ArosClient";
import { GuildInterface } from '../types/database';

export default class Command {
    client: ArosClient;
    name: string;
    category: string;
    aliases: string[] = [];
    isSlashCommand: boolean = false;
    dm: boolean = false;
    
    constructor(client: ArosClient, name: string, path: string) {
        this.client = client;
        this.name = name;
        //@ts-ignore
        this.category = path.replaceAll("/", '').replaceAll(".", '');
    }
    
    async execute(client: ArosClient, message: Message, args: string[], guild: GuildInterface | null): Promise<any> {
        
    }


}