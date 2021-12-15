import { GuildInterface } from './../../lib/types/database';
import { Message } from 'discord.js';
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import Utility from '../../util/Utility';

export default class extends Command {
    category = 'admin';
    async execute(client: ArosClient, message: Message, args: string[], guild: GuildInterface) {
        message.reply({content: Utility.translate(guild.language, `misc:PING`, {ping: client.ws.ping})})
        
       
    }
}