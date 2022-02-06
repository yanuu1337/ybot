import { SlashCommandBuilder } from "@discordjs/builders";
import { CacheType, CommandInteraction, GuildMember, Message, PermissionString, TextChannel } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends Command {
    usage = 'untimeout <user> [reason]';
    permissions = ['MODERATE_MEMBERS'] as PermissionString[]
    botPermissions = ['MODERATE_MEMBERS'] as PermissionString[]
    description = 'Untimeout a user';

    isSlashCommand = true;
    data = new SlashCommandBuilder()
        .addUserOption(opt => opt.setName("user").setDescription("The user to untimeout").setRequired(true))
        .addStringOption(opt => opt.setName("reason").setDescription("The reason for the untimeout").setRequired(false))
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        

        const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]) || await message.guild?.members.fetch(args[0]).catch(err => null);
        if(!args[0] || !member) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:INVALID_MEMBER")}`)
                ]}
            )
        }
        if(!member.communicationDisabledUntilTimestamp || member?.communicationDisabledUntilTimestamp < Date?.now()) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:NOT_IN_TIMEOUT")}`)
                ]}
            )
        }
        if(!member.moderatable) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:NOT_MODERATABLE")}`)
            ]})
        }
        const reason = args.slice(1).join(" ") ?? Utility.translate(guild?.language, "common:NONE");

        const modLogEmbed = EmbedFactory.generateModerationEmbed(message.author, member, "untimeout", reason);
        const timeoutEmbed = EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "mod/timeout:UNTIMEOUT_SUCCESS", {member: member.user.tag, reason: reason})}`);



        member.timeout(null, reason).then(() => {
            message.reply({embeds: [timeoutEmbed]})
        }).catch(err => {
            client.logger.error(`GUILD: ${message?.guild?.id} | Error occurred while trying to untimeout: ${err}`, () => {}, err);
            message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:TIMEOUT_ERROR")}`)
            ]})
        })
        const modLog = guild?.mod_log ? client.channels.cache.get(guild?.mod_log) as TextChannel : null;
        if(!modLog) return;
        modLog.send({embeds: [modLogEmbed]});
    }


    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const member = interaction.options.getMember("user", true) as GuildMember;
        
        if(!member.communicationDisabledUntilTimestamp || member?.communicationDisabledUntilTimestamp < Date?.now()) {
            return interaction.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:NOT_IN_TIMEOUT", {member: member.user.tag})}`)
                ]}
            )
        }
        if(!member.moderatable) {
            return interaction.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:NOT_MODERATABLE")}`)
            ]})
        }
        const reason = interaction.options.getString("reason") ?? Utility.translate(guild?.language, "common:NONE");

        const modLogEmbed = EmbedFactory.generateModerationEmbed(interaction.user, member, "untimeout", reason);
        const timeoutEmbed = EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "mod/timeout:UNTIMEOUT_SUCCESS", {member: member.user.tag, reason: reason})}`);



        member.timeout(null, reason).then(() => {
            interaction.reply({embeds: [timeoutEmbed]})
        }).catch(err => {
            client.logger.error(`GUILD: ${interaction?.guild?.id} | Error occurred while trying to untimeout: ${err}`, () => {}, err);
            interaction.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:TIMEOUT_ERROR")}`)
            ]})
        })
        const modLog = guild?.mod_log ? client.channels.cache.get(guild?.mod_log) as TextChannel : null;
        if(!modLog) return;
        modLog.send({embeds: [modLogEmbed]});

    }

}