import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";
import fetch from 'node-fetch';

export default class extends Command {
    dm = true;
    isSlashCommand = true;
    data = new SlashCommandBuilder();
    description = 'Get advice from the AdviceSlip API';
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        //fetch an user and use their language
        const user = await client.handlers.users.fetchOrCreate(message.author);
        const response = await fetch('https://api.adviceslip.com/advice');
        const json = await response.json();
        const advice = json.slip.advice;
        return message.reply({embeds: [
            EmbedFactory.generateInfoEmbed(
                `${Utility.translate(user?.language, `common:RESPONSE`)} - Advice`,
                `Advice: \`${advice}\`
                 
            `)
        ]});
    }

    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const user = await client.handlers.users.fetchOrCreate(interaction.user);
        const response = await fetch('https://api.adviceslip.com/advice');
        const json = await response.json();
        const advice = json.slip.advice;
        return interaction.reply({embeds: [
            EmbedFactory.generateInfoEmbed(
                `${Utility.translate(user?.language, `common:RESPONSE`)} - Advice`,
                `Advice: \`${advice}\``
                )
        ], ephemeral: true});

    }

}

