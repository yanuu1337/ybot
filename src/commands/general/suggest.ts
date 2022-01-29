import { SlashCommandBuilder } from "@discordjs/builders";
import { CacheType, CommandInteraction, Message, MessageEmbed } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";

export default class extends Command {
    description = "Suggest a feature you want to see in this bot!";
    isSlashCommand = true;
    usage = 'suggest <suggestion>';
    data = new SlashCommandBuilder().addStringOption(input => input.setName("suggestion").setDescription("The suggestion message").setRequired(true));
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        if(!args[0]) {
            return message.reply(`Please make a suggestion using the following format: \`${guild?.prefix ?? '='}suggest <suggestion>\``);
        }
        const suggestion = args.join(" ");
        const embed = new MessageEmbed({
            title: "Suggestion",
            description: suggestion,
            color: "AQUA",
            footer: {
                text: `${message.author.id} - ${message.author.tag}`,
                icon_url: message.author.avatarURL() ?? undefined
            },
            timestamp: new Date()
        });
        await client.users.cache.get("304263386588250112")!.send({ embeds: [embed]});
        return message.reply({content: `Suggestion sent!`, embeds: [embed.setFooter({text: `Please note that any abuse of this system will result in a blacklist.`, iconURL: message.author.avatarURL() ?? undefined})]});
    }

    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const suggestion = interaction.options.getString("suggestion", true);
        const embed = new MessageEmbed({
            title: "Suggestion",
            description: suggestion,
            color: "AQUA",
            footer: {
                text: `${interaction.user.id} - ${interaction.user.tag}`,
                icon_url: interaction.user.avatarURL() ?? undefined
            },
            timestamp: new Date()
        });
        await client.users.cache.get("304263386588250112")!.send({ embeds: [embed]});
        return interaction.reply({content: `Suggestion sent!`, embeds: [embed.setFooter({text: `Please note that any abuse of this system will result in a blacklist.`, iconURL: interaction.user.avatarURL() ?? undefined})], ephemeral: true});
    }
}