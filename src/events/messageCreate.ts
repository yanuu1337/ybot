import { RowDataPacket } from 'mysql2/promise';
import { GuildInterface } from './../lib/types/database';
import { Message, MessageEmbed, NewsChannel, Permissions, TextChannel, ThreadChannel } from "discord.js";
import ArosClient from "../extensions/ArosClient";
import Event from '../lib/structures/Event'
import EmbedFactory from "../util/EmbedFactory";
import Utility from "../util/Utility";
import moment from 'moment';
import { parse } from 'tldts';
import {readFile} from 'fs/promises'
const urlRegexp = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?")
export default class extends Event {
    readonly requiredPermissions = new Permissions(['VIEW_CHANNEL', 'SEND_MESSAGES']).freeze()
    async execute(client: ArosClient, msg: Message) {
        if(msg.author.bot || msg.webhookId || msg.partial) return;
        
        
        const guildMe = msg?.guild?.me ?? await msg.guild?.members.fetch(`${this.client.user?.id}`)!
        const channel = msg.channel as TextChannel | ThreadChannel | NewsChannel
        const user = await this.client.handlers.users.fetchOrCreate(msg.author)
        if(!msg.guild && msg.channel.type !== 'DM') return;
        const commandGuild = msg.guild ? await this.client.handlers.guilds.fetchOrCreate(msg.guild!) : null
        
        if(!commandGuild && msg.guild) {
            this.client.handlers.guilds.create({
                discord_id: msg.guild!.id,
                language: 'en-US',
                created_at: moment(msg.guild.createdAt).format("YYYY-MM-DD HH:mm:ss.000"),
            })
        }
        const [cmdName, ...cmdArgs] = msg.content
        .slice((commandGuild?.prefix ?? '.').length)
        .trim()
        .split(/\s+/);

        try {
            
            await this.handleMention(msg, commandGuild, cmdArgs)
            const command = this.client.handlers.commands.fetch(cmdName.toLowerCase());
            if(urlRegexp.test(msg.content)) {
                this.handlePhishingLinks(msg, commandGuild);
            }
            if(!msg.content.startsWith((commandGuild?.prefix ?? '.'))) return await this.handleLeveling(msg, commandGuild);
            
            if(user.blacklisted) {
                if (Math.random() > 0.7) msg.reply(`Error: You are blacklisted from using this bot.`)
                return;
            }
            if(!command) return;
            if(command.devOnly && msg.author.id !== '304263386588250112') {
                return msg.reply(`This command is only available for developers.`)
            }
            client.countsToday.commands++;

            if(msg.channel.type === 'DM') {   
                if(!command.dm) return msg.reply({embeds: [
                    EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(commandGuild?.language, `common:DM_ONLY`)}`)
                ]})
                return command.execute(client, msg, cmdArgs, null);
            } 

            if(!channel?.permissionsFor?.(guildMe)?.has?.(this.requiredPermissions, true)) return;


            if (command?.botPermissions && !channel?.permissionsFor(guildMe)?.has(command?.botPermissions, true)) {
                return msg.reply({embeds: 
                    [
                        EmbedFactory.generateErrorEmbed(
                            `${Utility.translate(commandGuild?.language, 'common:ERROR')}`, 
                            `${Utility.translate(commandGuild?.language, 'common:MISSING_PERMS', {roles: command?.botPermissions.join(', ')})}`
                        )
                    ]
                })
            }
            
            
            if(command?.permissions) {
                if((channel.permissionsFor(msg.member!)?.has(command.permissions, true) || msg.member?.permissions?.has(command.permissions, true))) {
                    return await command?.execute(this.client, msg, cmdArgs, commandGuild)
                } else {
                    return msg.reply({
                        embeds: [
                            EmbedFactory.generateErrorEmbed(
                                `${Utility.translate(commandGuild?.language, 'common:ERROR')}`,
                                `${Utility.translate(commandGuild?.language, 'common:USER_MISSING_PERMS', {roles: command?.permissions.join(', ')})}`
                            )
                        ]
                    })
                    
                }
            }
            
            await command?.execute(this.client, msg, cmdArgs, commandGuild)
        
        } catch (error) {
            this.client.logger.error(`Command execution error`, error, () => {})
            msg.reply({embeds: [EmbedFactory.generateErrorEmbed(`${Utility.translate(commandGuild?.language, 'common:ERROR')}`, `${Utility.translate(commandGuild?.language, 'misc:ERROR_OCURRED')}`)]})
            return;
        }
    }

    async handleMention(msg: Message, guild: GuildInterface | null, args: string[] = []) {
        if(msg.mentions.users.find(user => user.id === this.client.user?.id) && !msg.mentions.everyone && !msg.reference) {
            if(args[0] === 'prefix') {
                if(!args[1]) return msg.reply(`The current prefix is \`${guild?.prefix ?? '.'}\``)
                if(!msg.member?.permissions?.has('MANAGE_GUILD', true)) return msg.reply(`You don't have the \`MANAGE_GUILD\` to change the prefix.`)
                await this.client.handlers.guilds.edit(msg.guild!, {prefix: args[1]})
                return msg.reply(`The prefix has been changed to \`${args[1]}\`.`)
            }
            const embed = new MessageEmbed()
                .setTitle(`Hi there!`)
                .setFooter("© 2022 - yBot 🎉")
                .setColor(`RANDOM`)
                .setDescription(`You mentioned me! <:yBBruh:801006604728270848>`)
                .addField(`About me:`, `I'm your friend, yBot! Not only do I include moderation and meme commands (including slash commands), I also have fully-fledged leveling and currency systems!`)
                .addField(`My prefix here is: \`${guild?.prefix ?? '.'}\``, `Use the \`${guild?.prefix ?? '.'}help\` command to see all my commands! You could also use the /help slash command for the same thing.`)
                .addField(`Customization: `, `You can customize my settings in multiple ways, such as my [website](https://bot.folds.cc) or the \`config\` command!`)
            
            return msg.reply({embeds: [embed]})
        }
    }

    async checkInvites(message: Message) {
        const inviteRegex = /(discord\.(gg|io|me|li|plus|link)\/.+|discord(?:app)?\.com\/invite\/.+)/i;
        if(message.content.match(inviteRegex) || inviteRegex.test(message.content)) {
            
            //!Handle invites
        }
    }

    async handleLeveling(msg: Message, guild?: GuildInterface | null) {
        if(!msg.member || msg.author.bot) return;
        const fetched = await this.client.handlers.levels.fetchOrCreate(msg.member);
        
        if(!guild?.config?.leveling || guild.blacklisted) return;
        const randomXpAmount = Math.floor(Math.random() * 10) + 1;
        const xp = fetched.xp! + randomXpAmount;
        const level = fetched.level;

        
        const required = Math.floor(Math.pow(level! + 1, 2) * 10);
        if(xp >= required) {
            await this.client.handlers.levels.addLevel(msg.member!, 1);
            return msg.reply({
                content: `GG ${msg.member}! You've leveled up to level ${level! + 1}!`,
                embeds: [
                    EmbedFactory.generateInfoEmbed(`Level up!`, `${Utility.translate(guild?.language, `common:LEVEL_UP`, {level: level! + 1})}`)
                ]
            })
        } else {
            await this.client.handlers.levels.addXp(msg.member!, randomXpAmount);
        }

        
    }


    async handlePhishingLinks(msg: Message, guild: GuildInterface | null) {
        const allDatabaseLinks = (await this.client.db?.query(`SELECT * FROM phishing_data`))?.[0] as RowDataPacket[];
        if(!allDatabaseLinks) return;
        if(msg.channel.type === "DM") return;
        const links = allDatabaseLinks.filter(link => !link.legit).map(link => link.domain);
        const msgArgs = msg.content.split(" ");
        const legitLinks = allDatabaseLinks.filter(link => link.legit).map(link => parse(link.domain).domain);
        const link = msgArgs.find(arg => urlRegexp.test(arg));
        
        const madeRequest = await readFile(`./etc/phishing-domains.txt`, 'utf8');
        const newUrl = parse(link!);
        
        if(newUrl.domain && ((madeRequest.split("\n").includes(newUrl.domain) && !legitLinks.includes(newUrl.domain)) || links.includes(newUrl.domain) && !legitLinks.includes(newUrl.domain))) {
            if(msg.deletable) await msg.delete();
            
            const modLogChannel = guild?.mod_log ? await this.client.channels.fetch(guild?.mod_log!) : 
                msg.guild?.channels.cache.find(channel => channel.name.includes('mod-log')) ?? 
                msg.guild?.channels.cache.find(channel => channel.name.includes('admin')) ?? 
                msg.guild?.channels.cache.find(channel => channel.name.includes("logs"))
            if(modLogChannel?.type === "DM") return;

            if(modLogChannel?.isText() && modLogChannel.permissionsFor(msg.guild?.me!, true).has("SEND_MESSAGES")) modLogChannel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor("RED")
                        .setAuthor({name: `${msg.author.tag} (${msg.author.id})`, iconURL: msg.author.displayAvatarURL()})
                        .setTitle(`Phishing link detected!`)
                        .setDescription(`**A phishing link has been detected in a message sent by \`${msg.author.tag}\`. The message has been removed.**
                        \`\`\`yBot stores, detects, and reports phishing links with the help of yBot's Staff Team. If you believe this is a mistake, please contact the Staff Team (for example by using the bugreport command). You could help us remove more phishing links and keep servers clean by reporting them using the suggest or bugreport command. Thank you!
                         \`\`\`
                         User: **${msg.author.tag}**
                         ID: **${msg.author.id}**
                         Message sent in: ${msg.channel}
                         Message content: 
                         **Warning! This message contains a malicious link! Please do not click it unless you are sure it is legit!**
                         ||${msg.content}||
                         `)
                        .setFooter("© 2022 - yBot 🎉")
                ]
            })                    
        }
        


    }

    
}