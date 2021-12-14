import { Message } from 'discord.js';
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";

export default class extends Command {
    category = 'admin';
    async execute(client: ArosClient, message: Message, args: string[]) {
        message.reply({content: client.translate.get(`${args[0] ?? 'en-US'}`)?.(`misc:PING`, {ping: client.ws.ping})})
        
        
    }
}