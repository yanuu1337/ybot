import { Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends Command {
    usage = 'level [user]';
    aliases = ['lvl'];

    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        const member = message.mentions.members?.first() || message.member!;
        const level = (await client.handlers.levels.getLevel(member))!;
        const xp = await client.handlers.levels.getXp(member);
        const xpToNextLevel = Math.floor(Math.pow(level! + 1, 2) * 10);
        const xpToNextLevelPercent = Math.floor((xp! / xpToNextLevel) * 100);

        if(!guild?.config?.leveling) {
            return message.reply({
                embeds: [
                    EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, `common:ERROR`)}`, `${Utility.translate(guild?.language, `level/level:NO_LEVELING`)}`)
                ]
            })
        }

        return message.reply({
            embeds: [
                EmbedFactory.generateInfoEmbed(`${member.displayName}'s Level`, `
                **Level:** ${level}
                **XP:** ${xp}/${xpToNextLevel} (${xpToNextLevelPercent}%)
                `)
            ]
        })


    }
}