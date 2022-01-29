import { CacheType, CommandInteraction, Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import fetch from 'node-fetch'
import EmbedFactory from "../../util/EmbedFactory";
import { SlashCommandBuilder } from "@discordjs/builders";
export default class extends Command {
    description = "Send a random dog!";
    isSlashCommand = true;
    data = new SlashCommandBuilder();
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        const res = await fetch(`https://dog.ceo/api/breeds/image/random`)
        const json = await res.json()
        return message.reply({embeds: [
            EmbedFactory.generateInfoEmbed(`Dog`, `Here's a random dog!`).setImage(json.message)
        ]})
    }

    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const res = await fetch(`https://dog.ceo/api/breeds/image/random`)
        const json = await res.json()
        return interaction.reply({embeds: [
            EmbedFactory.generateInfoEmbed(`Dog`, `Here's a random dog!`).setImage(json.message)
        ]})
    }
}