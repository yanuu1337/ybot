import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Message, MessageEmbed } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";

export default class extends Command {
    isSlashCommand = true;
    data = new SlashCommandBuilder().addStringOption(input => input.setName("report").setDescription("The bug report message").setRequired(true));
    description = 'Report bugs directly to the developers! Any abuse of this command will result in a blacklist.';
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        if(!args[0]) {
            return message.reply(`Please report a bug using the following format: \`${guild?.prefix ?? '='}bugreport <message>\``);
        }
        const bugReport = args.join(" ");
        const embed = new MessageEmbed({
            title: "Bug Report",
            description: bugReport,
            color: 0xFF0000,
            footer: {
                text: `${message.author.id} - ${message.author.tag}`,
                icon_url: message.author.avatarURL() ?? undefined
            }
        }).setTimestamp();
        await client.users.cache.get("304263386588250112")!.send({ embeds: [embed]});
        return message.reply({content: `Bug report sent!`, embeds: [embed.setFooter({text: `Please note that any abuse of this sytem will result in a blacklist.`, iconURL: message.author.avatarURL() ?? undefined})]});

    }

    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
    
        const bugReport = interaction.options.getString("report", true)
        const embed = new MessageEmbed({
            title: "Bug Report",
            description: bugReport,
            color: 0xFF0000,
            footer: {
                text: `${interaction.user.id} - ${interaction.user.tag}`,
                icon_url: interaction.user.avatarURL() ?? undefined
            }
        }).setTimestamp();
        await client.users.cache.get("304263386588250112")!.send({ embeds: [embed]});
        return interaction.reply({content: `Bug report sent!`, embeds: [embed.setFooter({text: `Please note that any abuse of this sytem will result in a blacklist.`, iconURL: interaction.user.avatarURL() ?? undefined})], ephemeral: true});

    }
}