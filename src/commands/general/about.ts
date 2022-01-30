import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Message,MessageEmbed,User } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";

export default class extends Command {
    description = 'Get information about this bot!';
    usage = 'about';
    isSlashCommand = true;
    data = new SlashCommandBuilder();
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        return this.about(client, message, guild);
    }

    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        return this.about(client, interaction, guild);
    }

    async about(client: ArosClient, message: Message<boolean> | CommandInteraction<CacheType>, guild: GuildInterface | null): Promise<any> {
        if(!client.application?.owner) await client.application?.fetch();
        const owner = client.application?.owner as User;
        const embed = new MessageEmbed()
                .setTitle(`Hi there!`)
                .setFooter("© 2022 - yBot 🎉")
                .setColor(`RANDOM`)
                .setDescription(`You want to more about me! <:yBBruh:801006604728270848>`)
                .addField(`About me:`, `I'm your friend, yBot! Not only do I include moderation and meme commands (including slash commands), I also have fully-fledged leveling and currency systems!`)
                .addField(`My prefix here is: \`${guild?.prefix ?? '='}\``, `Use the \`${guild?.prefix ?? '='}help\` command to see all my commands! You could also use the /help slash command for the same thing.`)
                .addField(`Customization: `, `You can customize my settings in multiple ways, such as ~~my [website](https://bot.folds.cc) or~~ the \`config\` command!`)
                .addField(`Support: `, `If you need help, you can join the support server [here](http://support.folds.cc/)!`)
                .addField(`My owner is:`, `${owner?.tag}`)
                .addField(`My invite link:`, `[Click here](https://discord.com/oauth2/authorize?client_id=762760862535909426&scope=bot%20applications.commands&permissions=8)`)
                .addField(`Current websocket ping: `, `${client.ws.ping}ms`)
                .addField(`Stats today:`, `
                ${client.countsToday.commands} Commands 
                ${client.countsToday.tags} Tags
                ${client.countsToday.users} Users
                ${client.countsToday.guilds} Guilds
                `)
                .addField(`Versions:`, `
                **Node**: \`${process.version}\`
                **Discord.js**: \`${require('discord.js').version}\`
                **Bot**: \`${require('../../../package.json').version}\`

                `)
                
        message.reply({embeds: [embed]});
    }
    
}