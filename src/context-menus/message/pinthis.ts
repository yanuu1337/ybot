import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { CacheType, Collection, Message, MessageContextMenuInteraction, MessageEmbed, PermissionString } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import ContextMenu from "../../lib/structures/ContextMenu";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends ContextMenu {
    name = 'Pin this message'
    data = new ContextMenuCommandBuilder()
    permissions = ['MANAGE_MESSAGES'] as PermissionString[]
    async execute(client: ArosClient, interaction: MessageContextMenuInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        
        const user = await client.handlers.users.fetchOrCreate(interaction.user)
        console.log(guild);
        if(!guild?.config?.pin_channel) {
            return interaction.reply({embeds: [
                EmbedFactory.generateErrorEmbed(
                    `${Utility.translate(user.language, `common:ERROR`)} - Pin`,
                    `You don't have a pin channel set.`
                )
            ], ephemeral: true})
        }
        const msg = interaction.targetMessage as Message;
        console.log(msg.content.length);
        if(msg.content.length > 500) {
            msg.content = msg.content.substring(0, 500).trimEnd() + `...`;
        }
        interaction.reply({content: `Pinned! Check the pinned messages channel - <#${guild?.config?.pin_channel}>.`, ephemeral: true});
        const channel = interaction.guild!.channels.cache.get(guild?.config?.pin_channel);
        if(!channel?.isText()) return;
        
        const embed = new MessageEmbed()
            .setTimestamp(msg.createdAt)
            .setAuthor({name: msg.author.tag, iconURL: msg.author.displayAvatarURL()})
            .setColor("RANDOM")
            .setDescription(`${interaction.targetMessage.content}\n[See message](${msg.url})`)
            .setFooter({text: `Pinned by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL()});
        if(interaction.targetMessage.attachments && interaction.targetMessage.attachments instanceof Collection && interaction.targetMessage.attachments.size > 0) {
            const attachment = interaction.targetMessage.attachments?.first();
            if(attachment) embed.setImage(attachment.proxyURL);
            if([...interaction.targetMessage.attachments.values()].slice(1).length > 0) {
                embed.setFooter({text: `${embed.footer} - +${[...interaction.targetMessage.attachments.values()].slice(1).length} files`});
            }
            return channel.send({
                embeds: [embed],
                files: [...interaction.targetMessage.attachments.values()].slice(1)
            })
        }
        return channel.send({
            embeds: [embed]
        })
    }
}