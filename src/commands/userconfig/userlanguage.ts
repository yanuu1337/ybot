import { Message } from 'discord.js';
import ArosClient from "../../extensions/ArosClient";
import { availableLanguages } from '../../lib/constants';
import Command from "../../lib/structures/Command";
import { GuildInterface } from '../../lib/types/database';
import EmbedFactory from '../../util/EmbedFactory';
import Util from '../../util/Util';

export default class extends Command {
    category = 'config';

    aliases = ['userlang', 'mylang']
    dm = true;
    async execute(client: ArosClient, message: Message, args: string[], guildInterface: GuildInterface) {
        const user = await client.handlers.users.fetchOrCreate(message.author);
        if(!args[0]) {
            return message.reply({embeds: [EmbedFactory.generateErrorEmbed(`Language`, `Please specify a language!`)]})
        }
        console.log(user)
        const selectedLanguage = availableLanguages.find((lang) => lang.name === args[0].toLowerCase() || lang.aliases.includes(args[0].toLowerCase()))
        if(!selectedLanguage) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(
                    `Language`, 
                    `${Util.translate(
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
        return message.reply({embeds: [EmbedFactory.generateInfoEmbed(`Language`, Util.translate(selectedLanguage.name, 'config/language:CHANGED'))]})
    }
}