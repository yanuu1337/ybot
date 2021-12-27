import { Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

//make an 8ball command
export default class extends Command {
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        //make an 8ball command
        if(!args[0]) return message.reply({embeds: [
            EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(guild?.language, `fun/8ball:NO_QUESTION`)}`)
        ]});
        
        const random = Math.floor(Math.random() * 20);
        return message.reply({embeds: [
            EmbedFactory.generateInfoEmbed(
                `${Utility.translate(guild?.language, `common:RESPONSE`)} - 8ball`,
                `${Utility.translate(guild?.language, `common:QUESTION`)}: \`${args.join(" ")}\`
                **${Utility.translate(guild?.language, `fun/8ball:RESPONSE_${random + 1}`)}.**
            `)
        ]});
        
    }

}

