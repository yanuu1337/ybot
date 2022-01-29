import { SlashCommandBuilder } from "@discordjs/builders";
import { CacheType, CommandInteraction, Message, PermissionString, TextChannel } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";

export default class extends Command {
    description = 'Delete a number of messages.';
    usage = 'purge [number]';
    permissions = ['MANAGE_MESSAGES'] as PermissionString[]
    botPermissions = ['MANAGE_MESSAGES'] as PermissionString[]
    isSlashCommand = true;
    data = new SlashCommandBuilder().addNumberOption(arg => arg.setName("number").setDescription("The number of messages to delete.").setRequired(true));
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        const amount = args[0] ? parseInt(args[0]) : 0;
        const channel = message.channel as TextChannel;
        if(!amount) return message.reply({
            embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/purge:NO_AMOUNT")}`)
            ]
        });
        if(amount > 100) return message.reply({
            embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/purge:INVALID_AMOUNT")}`)
            ]
        });
        const messages = (await channel.messages.fetch({ limit: amount })).filter(val => val.deletable);
        if(messages.size == 0) {
            return message.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/purge:NO_MESSAGES")}`)
            ]})
        }
        await channel.bulkDelete(messages, true);
        return message.reply({
            embeds: [
                EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "mod/purge:DELETED", { amount: messages.size })}`)
            ]
        });
    }
    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const amount = interaction.options.getNumber("number") as number;
        const channel = interaction.channel as TextChannel;
        if(!amount) return interaction.reply({
            embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/purge:NO_AMOUNT")}`)
            ]
        });
        if(amount > 100) return interaction.reply({
            embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/purge:INVALID_AMOUNT")}`)
            ]
        });
        const messages = (await channel.messages.fetch({ limit: amount })).filter(val => val.deletable);
        if(messages.size == 0) {
            return interaction.reply({embeds: [
                EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, "common:ERROR")}`, `${Utility.translate(guild?.language, "mod/purge:NO_MESSAGES")}`)
            ]})
        }

        await channel.bulkDelete(messages, true);
        return interaction.reply({
            embeds: [
                EmbedFactory.generateInfoEmbed(`${Utility.translate(guild?.language, "common:SUCCESS")}`, `${Utility.translate(guild?.language, "mod/purge:DELETED", { amount: messages.size })}`)
            ]
        });
    }
}