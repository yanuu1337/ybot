import { GuildInterface } from '../../lib/types/database';
import { Formatters, Message } from 'discord.js';
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";

export default class extends Command {
    category = 'admin';
    devOnly = true;
    async execute(client: ArosClient, message: Message, args: string[], guild: GuildInterface) {
        const val = await client.db?.get('guilds', {discord_id: '856924300215713833', id: 2, prefix: '='}, true)
        message.reply(Formatters.codeBlock(`js\n${JSON.stringify(val, null, 2)}`))
    }
}