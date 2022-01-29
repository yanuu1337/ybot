import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import fetch from 'node-fetch'
import EmbedFactory from "../../util/EmbedFactory";
export default class extends Command {
    description = "Send a cat!";
    isSlashCommand = true;
    data = new SlashCommandBuilder();
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        const res = await fetch(`https://cataas.com/cat?json=true`)
        const { id } = await res.json()
        return message.reply({embeds: [
            EmbedFactory.generateInfoEmbed(`Cat`, `Here's a cat!`).setImage(`https://cataas.com/cat/${id}`)
        ]})
    }

    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const res = await fetch(`https://cataas.com/cat?json=true`)
        const { id } = await res.json()
        return interaction.reply({embeds: [
            EmbedFactory.generateInfoEmbed(`Cat`, `Here's a cat!`).setImage(`https://cataas.com/cat/${id}`)
        ]})
    }
}