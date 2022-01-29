import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, GuildMember, Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import fetch from 'node-fetch'
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";
export default class extends Command {
    description = 'Kiss someone';
    isSlashCommand = true;
    data = new SlashCommandBuilder().addUserOption(usr => usr.setName("member").setRequired(true).setDescription("The user you want to kiss"));
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        const res = await fetch(`https://nekos.life/api/v2/img/kiss`)
        const json = await res.json()
        
        if(message.reference) {
            const msg = await message.fetchReference();
            const embed = EmbedFactory.generateInfoEmbed(`Kiss`, `${message.member!.displayName} ${Utility.translate(guild?.language, 'fun/actions:KISSED')} ${msg.member?.displayName}!`)
            embed.setImage(json.url)
            return message.reply({ embeds: [embed] })
        }

        const mem = message.mentions.members?.first() 
            || message.guild?.members.cache.get(args[0]) 
            || message.guild?.members.cache.find(mem => mem.displayName.includes(args[0]?.toLowerCase()) 
            || mem.user.username.includes(args[0]?.toLowerCase()));
        if(!mem) {
            return message.reply({
                embeds: [
                    EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(guild?.language, 'common:USER_NOT_FOUND')}`)
                ]
            })
        }
        const embed = EmbedFactory.generateInfoEmbed(`Kiss`, `${message.member!.displayName} ${Utility.translate(guild?.language, 'fun/actions:KISSED')} ${mem.displayName}!`)
        embed.setImage(json.url)
        return message.reply({ embeds: [embed] })
    }
    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const res = await fetch(`https://nekos.life/api/v2/img/kiss`)
        const json = await res.json()
        const member = interaction.options.getMember("member", true) as GuildMember;
        const author = interaction.member as GuildMember;
        const embed = EmbedFactory.generateInfoEmbed(`Kiss`, `${author.displayName} ${Utility.translate(guild?.language, 'fun/actions:KISSED')} ${member.displayName}!`).setImage(json.url);
        return interaction.reply({ embeds: [embed] });
    }
}