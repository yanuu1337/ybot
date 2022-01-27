import { TextChannel } from 'discord.js';
import { Message, PermissionString } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import ms from 'ms';
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";
export default class extends Command {
    permissions = ["MODERATE_MEMBERS"] as PermissionString[];
    botPermissions = ["MODERATE_MEMBERS"] as PermissionString[];
    usage = 'timeout <user> <time> [reason]';
    
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        
        const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]) || await message.guild?.members.fetch(args[0]).catch(err => null);
        if(!args[0] || !member) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:INVALID_MEMBER")}`)
                ]}
            )
        }
        if(member.communicationDisabledUntilTimestamp || member?.communicationDisabledUntilTimestamp! > Date?.now()) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:ALREADY_TIMEOUTED")}`)
                ]}
            )
        }
        if(!args[1] || !ms(args[1])) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:INVALID_TIME")}`)
            ]})
        }
        const timeInMs = ms(args[1]);
        const reason = args.slice(2).join(" ") ?? Utility.translate(guild?.language, "common:NONE");

        const modLogEmbed = EmbedFactory.generateModerationEmbed(message.author, member, "timeout", reason);
        const timeoutEmbed = EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "mod/timeout:TIMEOUT_SUCCESS", {member: member.user.tag, time: args[1], reason: reason})}`);
        if(!member.moderatable) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:NOT_MODERATABLE")}`)
            ]})
        }
        member.timeout(timeInMs, reason).then(() => {
            message.reply({embeds: [timeoutEmbed]})
        }).catch(err => {
            client.logger.error(`Error ocurred while timeouting: ${err}`, () => {}, )
            message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:TIMEOUT_ERROR")}`)
            ]})
        })

        
        const modLog = guild?.mod_log ? client.channels.cache.get(guild?.mod_log) as TextChannel : null;
        if(!modLog) return;
        modLog.send({embeds: [modLogEmbed]});
    
    }
}