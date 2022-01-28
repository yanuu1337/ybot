import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends Command {
    dm = true;
    usage = '8ball <question>';
    isSlashCommand = true;
    data = new SlashCommandBuilder().addStringOption(arg => arg.setName("question").setRequired(true).setDescription("The question to ask the 8ball."));
    description = 'Play the classic 8ball game!';
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

    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const question = interaction.options.getString("question");
        const random = Math.floor(Math.random() * 20);
        return interaction.reply({embeds: [
            EmbedFactory.generateInfoEmbed(
                `${Utility.translate(`en-US`, `common:RESPONSE`)} - 8ball`,
                `${Utility.translate(`en-US`, `common:QUESTION`)}: \`${question}\`
                **${Utility.translate(`en-US`, `fun/8ball:RESPONSE_${random + 1}`)}.**
            `)
        ]});
    }

}

