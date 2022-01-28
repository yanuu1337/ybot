import { Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";


export default class extends Command {
    devOnly = true;

    async execute(client: ArosClient, message: Message<boolean>, args: string[]): Promise<any> {
        const member = message.mentions.users.first()?.id || client.users.cache.get(args[0].toLowerCase())?.id || (await client.users.fetch(args[0].toLowerCase()).catch(err => null))?.id || args[0];
        if(!args[0]) {
            return message.reply(`Please specify a user to blacklist/unblacklist.`)
        }

        if(args[0] === "status" || args[0] === "info") {
            const guild = await client.handlers.users.fetchOrCreate(member)
            return message.reply(`The user is ${guild?.blacklisted ? 'blacklisted' : 'not blacklisted'}.`)
        }
        if(args[0] === "list") {
            return message.reply(`The following users are blacklisted: ${client.handlers.users.filter(g => g?.blacklisted ?? false).map(g => client.users.cache.get(g.discord_id)?.username).join(', ')}`)
            // return message.reply(`The following guilds are blacklisted: ${client.handlers.guilds.filter(g => g.blacklisted).map(g => g.discord_id).join(', ')}`)
        }
        
        const user = await client.handlers.users.fetchOrCreate(member)
        await client.handlers.users.edit(member, {blacklisted: !user?.blacklisted});
        message.reply(`Successfully ${user?.blacklisted ? 'unblacklisted' : 'blacklisted'} the user.`)
    }
} 