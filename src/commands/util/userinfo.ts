import { CacheType, CommandInteraction, Message, MessageEmbed } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends Command {
    description = 'Get information about a user.';
    usage = 'userinfo [user]';
    aliases = ['user', 'ui'];
    category = 'util';
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        //get information about an user, including badges, roles, and more
        if(message.guild) {
            const member = message.mentions.members?.first() ?? message.guild?.members.cache.get(args[0]) ?? message.member;
            if(!member) return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(`en-US`, `util/userinfo:NO_USER`)}`)
            ]});
            const user = member.user;
            const roles = member.roles.cache.map(r => r).sort((a, b) => a.position + b.position);
            const badges = (await client.handlers.users.fetch(user.id))?.badges?.map(val => val.emoji) ?? [];
            const embed = new MessageEmbed()
                .setAuthor({name: `${user.tag} (${user.id})`, iconURL: user.displayAvatarURL()})
                .setThumbnail(user.displayAvatarURL())
                .addField(`${Utility.translate(`en-US`, `util/userinfo:USER_INFO_ID`)}`, `${user.id}`)
                .addField(`${Utility.translate(`en-US`, `util/userinfo:USER_INFO_CREATED`)}`, `${user.createdAt.toLocaleString()} <t:${Math.round(user.createdAt.getTime() / 1000)}:R>`)
                .addField(`${Utility.translate(`en-US`, `util/userinfo:USER_INFO_JOINED`)}`, `${member.joinedAt?.toLocaleString() ?? 'N/A'}`)
                .addField(`${Utility.translate(`en-US`, `util/userinfo:USER_INFO_ROLES`)}`, `${roles.length > 0 ? roles.join(', ') : 'None'}`)
                .addField(`${Utility.translate(`en-US`, `util/userinfo:USER_INFO_BADGES`)}`, `${badges.length ? badges.join(' ') : 'None'}`)
                .setColor(member.displayHexColor)
                .setFooter({text: `© ${new Date().getFullYear()} - Aros`, iconURL: client.user?.displayAvatarURL() ?? undefined});
            return message.reply({embeds: [embed]});

        } else {
            const user = message.author;
            const badges = (await client.handlers.users.fetch(user.id))?.badges?.map(val => val.emoji) ?? [];
            const embed = new MessageEmbed()
                .setAuthor({name: `${user.tag} (${user.id})`, iconURL: user.displayAvatarURL()})
                .setThumbnail(user.displayAvatarURL())
                .setDescription(`⚠️ **This member is NOT in this guild.**`)
                .addField(`${Utility.translate(`en-US`, `util/userinfo:USER_INFO_ID`)}`, `${user.id}`)
                .addField(`${Utility.translate(`en-US`, `util/userinfo:USER_INFO_CREATED`)}`, `${user.createdAt.toLocaleString()}`)
                .addField(`${Utility.translate(`en-US`, `util/userinfo:USER_INFO_BADGES`)}`, `${badges.length ? badges.join(' ') : 'NONE'}`)
                .setFooter({text: `© ${new Date().getFullYear()} - Aros`, iconURL: client.user?.displayAvatarURL() ?? undefined})
                //@ts-ignore
                .setColor(`${user.accentColor?.toString() ?? '#7289DA'}`);
            return message.reply({embeds: [embed]});
            
        }
    }
    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        
    }
}