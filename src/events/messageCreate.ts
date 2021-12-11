import { Message } from "discord.js";
import Event from '../lib/structures/Event'
export default class extends Event {
    async execute(msg: Message) {
        if(msg.author.bot || msg.webhookId || msg.partial) return;

        if(msg.channel.type === 'DM') {
            msg.reply({content: `DMs aren't implemented yet!`})
            this.client.logger.error(`DMS are not implemented yet, ${msg.author.tag}!`)
        }
        this.client.logger.log('info', `${msg.author.tag}: ${msg.content}`)
    }
}