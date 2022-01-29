import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import fetch from 'node-fetch';
export default class extends Command {
    description = 'Get your daily dose of memes!';
    isSlashCommand = true;
    data = new SlashCommandBuilder();
    aliases = ['memes']
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        //make a request to reddit using the fetch lib
        
        const response = await fetch('https://www.reddit.com/r/memes/top.json?sort=new&limit=500');
        const json = await response.json();
        
        const post = json.data.children.filter((d: any) => !d.data.over_18)[Math.floor(Math.random() * json.data.children.length)].data;
        const embed = {
            title: post.title,
            url: post.url,
            image: {
                url: post.url
            },
            footer: {
                text: `👍 ${post.ups} | 👎 ${post.downs}`,
                icon_url: message.author.avatarURL() ?? undefined
            },
            color: 0xFF0000
        }
        return message.reply({ embeds: [embed] });

    }

    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const response = await fetch('https://www.reddit.com/r/memes/top.json?sort=new&limit=500');
        const json = await response.json();
        
        const post = json.data.children.filter((d: any) => !d.data.over_18)[Math.floor(Math.random() * json.data.children.length)].data;
        const embed = {
            title: post.title,
            url: post.url,
            image: {
                url: post.url
            },
            footer: {
                text: `👍 ${post.ups} | 👎 ${post.downs}`,
                icon_url: interaction.user.avatarURL() ?? undefined
            },
            color: 0xFF0000
        }
        return interaction.reply({ embeds: [embed] });
    }
}