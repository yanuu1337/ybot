import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { CacheType, UserContextMenuInteraction, GuildMember, MessageEmbed, User } from "discord.js";
import EmbedFactory from "../..//util/EmbedFactory";
import Utility from "../../util/Utility";
import ArosClient from "../../extensions/ArosClient";
import ContextMenu from "../../lib/structures/ContextMenu";
import { GuildInterface } from "../../lib/types/database";

export default class extends ContextMenu {
    name = 'Show info'
    data = new ContextMenuCommandBuilder()
    async execute(client: ArosClient, interaction: UserContextMenuInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        if(isInDms) {
            const user = interaction.targetUser as User;

            if(!user) {
                return interaction.reply({embeds: [
                    EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(`en-US`, `util/userinfo:NO_USER`)}`)
                ], ephemeral: true});
            }
            const badges = (await client.handlers.users.fetch(user.id))?.badges?.map(val => val.emoji) ?? [];
            const embed = new MessageEmbed()
                .setAuthor({name: `${user.tag} (${user.id})`, iconURL: user.displayAvatarURL()})
                .setThumbnail(user.displayAvatarURL())
                .setDescription(`⚠️ **This data is not based on the guild**. Use the mention subcommand if you want to get data from the guild.`)
                .addField(`${Utility.translate(`en-US`, `util/userinfo:USER_INFO_ID`)}`, `${user.id}`)
                .addField(`${Utility.translate(`en-US`, `util/userinfo:USER_INFO_CREATED`)}`, `${user.createdAt.toLocaleString()}`)
                .addField(`${Utility.translate(`en-US`, `util/userinfo:USER_INFO_BADGES`)}`, `${badges.length ? badges.join(' ') : 'NONE'}`)
                .setFooter({text: `© ${new Date().getFullYear()} - yBot`, iconURL: client.user?.displayAvatarURL() ?? undefined})
                //@ts-ignore
                .setColor(`${user.accentColor?.toString() ?? '#7289DA'}`);
            return interaction.reply({embeds: [embed], ephemeral: true});
        }
        
        const member = interaction.targetMember as GuildMember;
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
            .setFooter({text: `© ${new Date().getFullYear()} - yBot`, iconURL: client.user?.displayAvatarURL() ?? undefined});
        return interaction.reply({embeds: [embed], ephemeral: true});
    }
}