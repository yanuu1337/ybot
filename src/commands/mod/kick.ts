import { Message, PermissionString } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends Command {
    permissions = ["KICK_MEMBERS"] as PermissionString[];
    botPermissions = ["KICK_MEMBERS"] as PermissionString[];
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
        const banEmbed = EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "mod/kick:KICK_SUCCESS", {member: member.user.tag, reason: reason, guild: message?.guild?.name})}`);
        
        await member.kick(reason).catch(err => {
            client.logger.error(err);
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/kick:KICK_FAILED")}`)
                ]}
            )
        });
        message.reply({embeds: [banEmbed]});


        const modLogChannel = guild?.mod_log ? message.guild?.channels.cache.get(guild?.mod_log) : null; 
        if(!modLogChannel?.isText()) return;
        await modLogChannel?.send({embeds: [modLogEmbed]}).catch(err => {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/common:MOD_LOG_FAILED")}`)
                ]}
            )
        });
    }
}