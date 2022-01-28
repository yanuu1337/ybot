import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, GuildMember, Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends Command {
    usage = 'level [user]';
    aliases = ['lvl'];
    description = 'Check your or your friends\' level! Level up by actively chatting.'
    isSlashCommand = true;
    data = new SlashCommandBuilder().addMentionableOption(input => input.setName("member").setDescription("Member to get the level of"))
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        const member = message.mentions.members?.first() || message.member!;
        const apiMember = await client.handlers.levels.fetch({ member })
        if(!apiMember) {
            return message.reply({
                embeds: [
                    EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, `common:ERROR`)}`, `${Utility.translate(guild?.language, `info/level:USER_NO_LEVEL`)}`)
                ]
            })
        }
        const {level, xp} = apiMember;
        const xpToNextLevel = Math.floor(Math.pow(level! + 1, 2) * 10);
        const xpToNextLevelPercent = Math.floor((xp! / xpToNextLevel) * 100);

        if(!guild?.config?.leveling) {
            return message.reply({
                embeds: [
                    EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, `common:ERROR`)}`, `${Utility.translate(guild?.language, `info/level:NO_LEVELING`)}`)
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

    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const member = interaction.options.getMentionable("member") as GuildMember || interaction.member!;
        const apiMember = await client.handlers.levels.fetch({ member })
        if(!apiMember) {
            return interaction.reply({
                embeds: [
                    EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, `common:ERROR`)}`, `${Utility.translate(guild?.language, `info/level:USER_NO_LEVEL`)}`)
                ]
            })
        }
        const {level, xp} = apiMember;
        const xpToNextLevel = Math.floor(Math.pow(level! + 1, 2) * 10);
        const xpToNextLevelPercent = Math.floor((xp! / xpToNextLevel) * 100);

        if(!guild?.config?.leveling) {
            return interaction.reply({
                embeds: [
                    EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, `common:ERROR`)}`, `${Utility.translate(guild?.language, `info/level:NO_LEVELING`)}`)
                ]
            })
        }

        return interaction.reply({
            embeds: [
                EmbedFactory.generateInfoEmbed(`${member.displayName}'s Level`, `
                **Level:** ${level}
                **XP:** ${xp}/${xpToNextLevel} (${xpToNextLevelPercent}%)
                `)
            ]
        })
    }
}