import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Message } from 'discord.js';
import ArosClient from "../../extensions/ArosClient";
import { availableLanguages } from '../../lib/constants';
import Command from "../../lib/structures/Command";
import { GuildInterface } from '../../lib/types/database';
import EmbedFactory from '../../util/EmbedFactory';
import Utility from '../../util/Utility';

export default class extends Command {
    category = 'config';

    aliases = ['userlang', 'mylang']
    dm = true;
    name = 'userlanguage'
    description = 'Configure the user language (does not affect guild languages)'
    isSlashCommand = true;
    data = new SlashCommandBuilder().addStringOption(str => 
        str
        .setName('language').setDescription('Language to choose')
        .addChoices(availableLanguages.map(val => [val.fullName, val.name]))
        .setRequired(true)
    ).setDefaultPermission(true)
    async execute(client: ArosClient, message: Message, args: string[], guildInterface: GuildInterface) {
        const user = await client.handlers.users.fetchOrCreate(message.author);
        if(!args[0]) {
            return message.reply({embeds: [EmbedFactory.generateErrorEmbed(`Language`, `Please specify a language!`)]})
        }
        console.log(user)
        const selectedLanguage = availableLanguages.find((lang) => lang.name.toLowerCase() === args[0].toLowerCase() 
            || lang.fullName.toLowerCase() === args[0].toLowerCase() 
            || lang.aliases.map(val => val.toLowerCase()).includes(args[0].toLowerCase()))
        if(!selectedLanguage) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(
                    `Language`, 
                    `${Utility.translate(
                        user.language, 'config/language:INVALID_LANGUAGE', 
                        {wrong: args[0].toLowerCase(), list: availableLanguages.map(el => `\`${el.name}\``).join(', ')}
                        )
                    }`
                )
            ]})
        }
        if(!selectedLanguage.complete) {
            return message.reply({embeds: [EmbedFactory.generateWarningEmbed(`Language`, `The \`${selectedLanguage.fullName}\` language isn't fully translated yet. If you wish to help translating it, you can reach out to us via our Discord.`)]})
        }

        client.handlers.users.edit(user.discord_id, {language: selectedLanguage.name})
        return message.reply({embeds: [EmbedFactory.generateInfoEmbed(`Language`, Utility.translate(selectedLanguage.name, 'config/language:CHANGED'))]})
    }
    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const user = await client.handlers.users.fetchOrCreate(interaction.user);

        const selectedLanguage = availableLanguages.find((lang) => lang.name === interaction.options.getString('language', true))!
        if(!selectedLanguage.complete) {
            return interaction.reply({embeds: [EmbedFactory.generateWarningEmbed(`Language`, `The \`${selectedLanguage.fullName}\` language isn't fully translated yet. If you wish to help translating it, you can reach out to us via our Discord.`)]})
        }
        client.handlers.users.edit(user.discord_id, {language: selectedLanguage.name})
        return interaction.reply({embeds: [EmbedFactory.generateInfoEmbed(`Language`, Utility.translate(selectedLanguage.name, 'config/language:CHANGED'))]})


    }
}