import { TextChannel } from 'discord.js';
//command
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

    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        //timeout a member
        const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]) || await message.guild?.members.fetch(args[0]).catch(err => null);
        if(!args[0] || !member) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:INVALID_MEMBER")}`)
                ]}
            )
        }
        if(!args[1] || !ms(args[1])) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:INVALID_TIME")}`)
            ]})
        }
        const timeInMs = ms(args[1]);
        const reason = args.slice(2).join(" ");

        const modLogEmbed = EmbedFactory.generateModerationEmbed(message.author, member, "timeout", reason);
        const timeoutEmbed = EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "mod/timeout:TIMEOUT_SUCCESS", {member: member.user.tag, time: args[1], reason: reason})}`);
        if(!member.moderatable) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:NOT_MODERATABLE")}`)
            ]})
        }
        member.timeout(timeInMs, reason).then(() => {
            message.channel.send({embeds: [timeoutEmbed]})
        }).catch(err => {
            client.logger.error(`Error ocurred while timeouting: ${err}`, () => {}, )
            message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/timeout:TIMEOUT_ERROR")}`)
            ]})
        })

        //send to modlog
        const modLog = message.guild?.channels.cache.find(c => c.name === "mod-logs") as TextChannel;
        if(!modLog) return;
        modLog.send({embeds: [modLogEmbed]});
    
    }
}