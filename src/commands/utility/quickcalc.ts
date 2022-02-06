import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Formatters, Message } from 'discord.js';
import ArosClient from '../../extensions/ArosClient';
import Command from "../../lib/structures/Command";
import { GuildInterface } from '../../lib/types/database';
import EmbedFactory from '../../util/EmbedFactory';

export default class extends Command {
    description = 'Make a quick calculation.';
    isSlashCommand = true;
    usage = 'quickcalc <equation>';
    data = new SlashCommandBuilder().addStringOption(opt => opt.setName("equation").setRequired(true).setDescription("The equation to calculate."));
    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const equation = interaction.options.getString("equation", true)
        return this.run(client, interaction, [equation], guild);
    }
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        const equation = args.join(' ')
        return this.run(client, message, [equation], guild);
    }

    async run(client: ArosClient, message: Message<boolean> | CommandInteraction<CacheType>, args: string[], guild: GuildInterface | null): Promise<any> {
        if(!args[0]) return message.reply({content: "You must specify an equation to calculate!", ...message instanceof CommandInteraction ? {ephemeral: true} : {}});
        if (/[^$%*()\-+,\.\d]/.test(args[0])) return message.reply({content: "You must specify a valid equation to calculate!", ...message instanceof CommandInteraction ? {ephemeral: true} : {}});
        const equation = args[0].replace(/[^-()\d/+*%.]/g, '');
        const result = eval(equation);
        return message.reply({
            embeds: [
                EmbedFactory.generateInfoEmbed(`Result`, `${Formatters.codeBlock("js", equation)} = \`${result}\``)
            ]
        })
        
    }
}