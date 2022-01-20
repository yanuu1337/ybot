import { GuildInterface } from './../lib/types/database';
import { Message, MessageEmbed, NewsChannel, Permissions, TextChannel, ThreadChannel } from "discord.js";
import ArosClient from "../extensions/ArosClient";
import Event from '../lib/structures/Event'
import EmbedFactory from "../util/EmbedFactory";
import Utility from "../util/Utility";
import moment from 'moment';
export default class extends Event {
    readonly requiredPermissions = new Permissions(['VIEW_CHANNEL', 'SEND_MESSAGES']).freeze()
    async execute(client: ArosClient, msg: Message) {
        if(msg.author.bot || msg.webhookId || msg.partial) return;
        
        
        const guildMe = msg?.guild?.me ?? await msg.guild?.members.fetch(`${this.client.user?.id}`)!
        const channel = msg.channel as TextChannel | ThreadChannel | NewsChannel
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
        .slice((commandGuild?.prefix ?? '=').length)
        .trim()
        .split(/\s+/);

        try {
            await this.handleMention(msg, commandGuild, cmdArgs)
            const command = this.client.handlers.commands.fetch(cmdName.toLowerCase());
            if(!msg.content.startsWith((commandGuild?.prefix ?? '='))) return;

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
        if(msg.mentions.users.find(user => user.id === this.client.user?.id)) {
            if(args[0] === 'prefix') {
                if(!args[1]) return msg.reply(`The current prefix is \`${guild?.prefix ?? '='}\``)
                if(!msg.member?.permissions?.has('MANAGE_GUILD', true)) return msg.reply(`You don't have the \`MANAGE_GUILD\` to change the prefix.`)
                await this.client.handlers.guilds.edit(msg.guild!, {prefix: args[1]})
                return msg.reply(`The prefix has been changed to \`${args[1]}\`.`)
            }
            const embed = new MessageEmbed()
                .setTitle(`Hi there!`)
                .setFooter("© 2022 - Aros 🎉")
                .setColor(`RANDOM`)
                .setDescription(`You mentioned me! <:yBBruh:801006604728270848>`)
                .addField(`About me:`, `I'm your friend, Aros! Not only do I include moderation and meme commands (including slash commands), I also have fully-fledged leveling and currency systems!`)
                .addField(`My prefix here is: \`${guild?.prefix ?? '='}\``, `Use the \`${guild?.prefix ?? '='}help\` command to see all my commands! You could also use the /help slash command for the same thing.`)
                .addField(`Customization: `, `You can customize my settings in multiple ways, such as my [website](https://aros.folds.cc) or the \`config\` command!`)
            
            return msg.reply({embeds: [embed]})
        }
    }

    async checkInvites(message: Message) {
        const inviteRegex = /(discord\.(gg|io|me|li|plus|link)\/.+|discord(?:app)?\.com\/invite\/.+)/i;
        if(message.content.match(inviteRegex) || inviteRegex.test(message.content)) {
            
            //!Handle invites
        }
    }
}