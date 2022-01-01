import { Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends Command {
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        
        if(!args[0]) return message.reply({embeds: [
            EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(`en-US`, `fun/8ball:NO_QUESTION`)}`)
        ]});
        
        const random = Math.floor(Math.random() * 20);
        return message.reply({content: '**8Ball** is only available in **English** for now!', embeds: [
            EmbedFactory.generateInfoEmbed(
                `${Utility.translate(`en-US`, `common:RESPONSE`)} - 8ball`,
                `${Utility.translate(`en-US`, `common:QUESTION`)}: \`${args.join(" ")}\`
                **${Utility.translate(`en-US`, `fun/8ball:RESPONSE_${random + 1}`)}.**
            `)
        ]});
        
    }

}

