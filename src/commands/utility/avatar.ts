import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Message, MessageEmbed, User } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";

export default class extends Command {
    aliases = ['av', 'pfp']
    description = 'Get your or someone else\'s avatar.'
    usage = 'avatar [user]'
    isSlashCommand = true;
    data = new SlashCommandBuilder().addUserOption(arg => arg.setName("member").setDescription("The member to get avatar of (defaults to you)"))
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        const mem = message.mentions.users.first() 
            || message.guild?.members.cache.find(mem => mem.displayName.toLowerCase().includes(args[0].toLowerCase()))?.user 
            || client.users.cache.find(val => val.username.toLowerCase().includes(args[0].toLowerCase())) 
            || client.users.cache.get(args[0]) 
            || message.author;
        message.reply({embeds: [
            new MessageEmbed().setTitle(`${mem.username}'s avatar`).setImage(mem.avatarURL() ?? mem.defaultAvatarURL)
        ]})
    }
    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const mem = interaction.options.getUser("member") as User || interaction.user as User;
        interaction.reply({embeds: [
            new MessageEmbed().setTitle(`${mem.username}'s avatar`).setImage(mem.avatarURL({dynamic: true, size: 4096}) ?? mem.defaultAvatarURL)
        ]})
    }

}