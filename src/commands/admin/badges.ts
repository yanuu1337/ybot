import { Badges } from './../../lib/types/database';
import { Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { BadgeEmojis, GuildInterface } from "../../lib/types/database";

export default class extends Command {
    category = 'admin';
    aliases = ['badges', 'devbg', 'bgs', 'bdg', 'badge'];
    dm = true;
    description = 'Grant a user a badge.';
    devOnly = true;
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        
        if(!args[0] || !Object.keys(BadgeEmojis).includes(args[0].toUpperCase())) {
            return message.reply(`Please specify a valid badge.`);
        }
        if(!message.mentions.members?.size && !args[1]) {
            return message.reply(`Please specify a user.`);
        }
        const member = message.mentions.members?.first() ?? message.guild?.members.cache.get(args[1].toLowerCase()) ?? null;
        console.log(member)
        const badge = args[0].toUpperCase() as Badges;
        const user = await client.handlers.users.fetch(member!.id)
        if(!member) {
            return message.reply(`Please specify a user.`);
        }
        if(!user) {
            return message.reply(`That user is not registered.`)
        }
        if(user.badges?.some(b => b.name === badge)) {
            const newBadges = user.badges.filter(b => b.name !== badge)
            await client.handlers.users.edit(member?.id, {badges: JSON.stringify(newBadges)})
            return message.reply(`Successfully removed that badge from the user. Current badges: ${newBadges.map(b => b.emoji).join(' ')}`)
            
        }
        
        
        console.log(user)
        const userBadges = [...(user.badges ?? []), {name: badge, emoji: BadgeEmojis[badge]}]
        await client.handlers.users.edit(member?.id, {badges: JSON.stringify(userBadges)})
        message.reply(`Successfully granted the user that badge. Current badges: ${userBadges.map(b => b.emoji).join(' ')}`)
    }
}