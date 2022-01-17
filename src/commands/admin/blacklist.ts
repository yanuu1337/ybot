import { Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";


export default class extends Command {
    devOnly = true;

    async execute(client: ArosClient, message: Message<boolean>, args: string[]): Promise<any> {
        if(!args[0]) {
            return message.reply(`Please specify a guild to blacklist/unblacklist.`)
        }
        if(args[0] === "status" || args[0] === "info") {
            const guild = await client.handlers.guilds.fetchOrCreate(args[1])
            console.log(guild);
            return message.reply(`The guild is ${guild?.blacklisted ? 'blacklisted' : 'not blacklisted'}.`)
        }
        if(args[0] === "list") {
            return message.reply(`The following guilds are blacklisted: ${client.handlers.guilds.filter(g => g?.blacklisted ?? false).map(g => client.guilds.cache.get(g.discord_id)?.name).join(', ')}`)
            // return message.reply(`The following guilds are blacklisted: ${client.handlers.guilds.filter(g => g.blacklisted).map(g => g.discord_id).join(', ')}`)
        }
        const guild = await client.handlers.guilds.fetchOrCreate(args[0])
        await client.handlers.guilds.edit(args[0], {blacklisted: !guild?.blacklisted});
        message.reply(`Successfully ${guild?.blacklisted ? 'unblacklisted' : 'blacklisted'} the guild.`)
    }
} 