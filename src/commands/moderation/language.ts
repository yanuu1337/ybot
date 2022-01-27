import { CacheType, CommandInteraction, Message, PermissionString } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import EmbedFactory from "../../util/EmbedFactory";
import { availableLanguages } from '../../lib/constants';
import Utility from "../../util/Utility";
import { SlashCommandBuilder } from "@discordjs/builders";

export default class extends Command {
    permissions = ['MANAGE_GUILD'] as PermissionString[];
    dm = false;
    aliases = ['lang', 'language'];
    isSlashCommand = true;
    usage = 'language <language>';
    description = 'Change the language of the bot.';
    data = new SlashCommandBuilder().addStringOption(str => 
        str
        .setName('language').setDescription('Language to choose')
        .addChoices(availableLanguages.map(val => [val.fullName, val.name]))
        .setRequired(true)
    ).setDefaultPermission(true)
    async execute(client: ArosClient, message: Message<boolean>, args: string[]): Promise<any> {
        if(!message.guild) return message.reply(`You can't use this command in DMs.`);
        const guild = await client.handlers.guilds.fetchOrCreate(message.guild);

        if(!args[0]) {
            return message.reply({embeds: [EmbedFactory.generateErrorEmbed(`Language`, `Please specify a language! All valid languages: ${availableLanguages.map(el => `\`${el.name}\``).join(', ')}`)]})
        }
        const selectedLanguage = availableLanguages.find((lang) => lang.name.toLowerCase() === args[0].toLowerCase() 
            || lang.fullName.toLowerCase() === args[0].toLowerCase() 
            || lang.aliases.map(val => val.toLowerCase()).includes(args[0].toLowerCase()))
        if(!selectedLanguage) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(
                    `Language`, 
                    `${Utility.translate(
                        guild?.language,
                        'config/language:INVALID_LANGUAGE', 
                        {wrong: args[0].toLowerCase(), list: availableLanguages.map(el => `\`${el.name}\``).join(', ')}
                    )}`
                )
            ]})
        }
        if(!selectedLanguage.complete) {
            return message.reply({embeds: [EmbedFactory.generateWarningEmbed(`Language`, `The \`${selectedLanguage.fullName}\` language isn't fully translated yet. If you wish to help translating it, you can reach out to us via our Discord.`)]})
        }
        client.handlers.guilds.edit(message.guild.id, {language: selectedLanguage.name})
        return message.reply({embeds: [EmbedFactory.generateInfoEmbed(`Language`, Utility.translate(selectedLanguage.name, 'config/language:CHANGED'))]})

    }
    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>): Promise<any> {
        if(!interaction.guild) return interaction.reply(`The guild has not been found. This error has been logged.`).then(() => client.logger.error(`Guild not found. Guild ID: ${interaction.guild?.id}`));
        const guild = await client.handlers.guilds.fetchOrCreate(interaction.guild);
        const selectedLanguage = availableLanguages.find((lang) => lang.name === interaction.options.getString('language', true))!
        if(!selectedLanguage.complete) {
            return interaction.reply({embeds: [EmbedFactory.generateWarningEmbed(`Language`, `The \`${selectedLanguage.fullName}\` language isn't fully translated yet. If you wish to help translating it, you can reach out to us via our Discord.`)]})
        }
        client.handlers.guilds.edit(guild!.discord_id, {language: selectedLanguage.name})
        return interaction.reply({embeds: [EmbedFactory.generateInfoEmbed(`Language`, Utility.translate(selectedLanguage.name, 'config/language:CHANGED'))]})

        
    }
}