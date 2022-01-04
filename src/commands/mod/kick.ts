import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, GuildMember, Message, PermissionString } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends Command {
    permissions = ["KICK_MEMBERS"] as PermissionString[];
    botPermissions = ["KICK_MEMBERS"] as PermissionString[];
    isSlashCommand = true;
    description = 'Kick a member from the server';
    data = new SlashCommandBuilder().addStringOption(opt => opt.setName("member").setRequired(true).setDescription("The member to kick")).addStringOption(opt => opt.setName("reason").setRequired(false).setDescription("The reason for the kick"))
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {

        const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]) || await message.guild?.members.fetch(args[0]).catch(err => null);
        if(!args[0] || !member) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/ban:INVALID_MEMBER")}`)
                ]}
            )
        }

        let reason = "None";
        if(!args[1]) reason = Utility.translate(guild?.language, "mod/ban:NO_REASON");
        else reason = args.slice(1).join(" ");
        if(member.id === message.member?.id) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/kick:CANNOT_KICK_SELF")}`)
            ]})
        }
        if(!member.kickable) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/kick:MEMBER_NOT_KICKABLE")}`)
                ]}
            )
        }
        const modLogEmbed = EmbedFactory.generateModerationEmbed(message.author, member, "kick", reason);
        const kickEmbed = EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "mod/kick:KICK_SUCCESS", {member: member.user.tag, reason: reason, guild: message?.guild?.name})}`);
        
        await member.kick(reason).catch(err => {
            client.logger.error(err);
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/kick:KICK_FAILED")}`)
                ]}
            )
        });
        message.reply({embeds: [kickEmbed]});


        const modLogChannel = guild?.mod_log ? message.guild?.channels.cache.get(guild?.mod_log) : null; 
        if(!modLogChannel?.isText()) return;
        await modLogChannel?.send({embeds: [modLogEmbed]}).catch(err => {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/common:MOD_LOG_FAILED")}`)
                ]}
            )
        });
    }

    async executeSlash(client: ArosClient, cmd: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const member = cmd.options.getMember('member', true) as GuildMember;
        const reason = cmd.options.getString('reason') || 'None';

        if(!member) {
            return cmd.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/ban:INVALID_MEMBER")}`)
            ]})
        }
        if(member.id === cmd.user?.id) {
            return cmd.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/kick:CANNOT_KICK_SELF")}`)
            ], ephemeral: true})
        }

        if(!member.kickable) {
            return cmd.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/kick:MEMBER_NOT_KICKABLE")}`)
                ], ephemeral: true}
            )
        }
        const modLogEmbed = EmbedFactory.generateModerationEmbed(cmd.user, member, "kick", reason);
        const kickEmbed = EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "mod/kick:KICK_SUCCESS", {member: member.user.tag, reason: reason, guild: cmd?.guild?.name})}`);
        await member.kick(reason).catch(err => {
            client.logger.error(err);
            return cmd.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/kick:KICK_FAILED")}`)
                ]}
            )
        });
        cmd.reply({embeds: [kickEmbed]});

        const modLogChannel = guild?.mod_log ? cmd.guild?.channels.cache.get(guild?.mod_log) : null; 
        if(!modLogChannel?.isText()) return;
        await modLogChannel?.send({embeds: [modLogEmbed]}).catch(err => {
            return cmd.followUp({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/common:MOD_LOG_FAILED")}`)
                ], ephemeral: true}
            )
        });
        
    }
}