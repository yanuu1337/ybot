import { Permissions, Message, TextChannel, ThreadChannel, NewsChannel } from 'discord.js';
import ArosClient from '../extensions/ArosClient';
import Event from '../lib/structures/Event'
import EmbedFactory from '../util/EmbedFactory';
import Utility from '../util/Utility';

export default class extends Event {
    readonly requiredPermissions = new Permissions(['VIEW_CHANNEL', 'SEND_MESSAGES']).freeze()


    async execute(client: ArosClient, oldMsg: Message, newMsg: Message) {
        
        if(newMsg?.author?.bot || newMsg?.webhookId || newMsg?.partial) return;

        const guildMe = newMsg?.guild?.me ?? await newMsg.guild?.members.fetch(`${this.client.user?.id}`)!
        const channel = newMsg.channel as TextChannel | ThreadChannel | NewsChannel
        const user = await this.client.handlers.users.fetchOrCreate(newMsg.author)
        if(!newMsg.guild && newMsg.channel.type !== 'DM') return;
        const commandGuild = newMsg.guild ? await this.client.handlers.guilds.fetchOrCreate(newMsg.guild!) : null
        const [cmdName, ...cmdArgs] = newMsg.content
            .slice((commandGuild?.prefix ?? '=').length)
            .trim()
            .split(/\s+/);
        try {
            if(user.blacklisted) {
                if (Math.random() > 0.5) newMsg.reply(`Error: You are blacklisted from using this bot.`)
                return;
            }

            if(!newMsg.content.startsWith((commandGuild?.prefix ?? '='))) return;
            const command = this.client.handlers.commands.fetch(cmdName.toLowerCase());
            
            if(!command) return;
            if(command.devOnly && newMsg.author.id !== '304263386588250112') {
                return newMsg.reply(`This command is only available for developers.`)
            }
            client.countsToday.commands++;

            if(newMsg.channel.type === 'DM') {
                if(!command.dm) return newMsg.reply({embeds: [
                    EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(commandGuild?.language, `common:DM_ONLY`)}`)
                ]})
                return command.execute(client, newMsg, cmdArgs, null);
            }

            if(!channel?.permissionsFor(guildMe)?.has?.(this.requiredPermissions, true)) return;
            if (command?.botPermissions && !channel?.permissionsFor(guildMe)?.has(command?.botPermissions, true)) {
                return newMsg.reply({embeds: 
                    [
                        EmbedFactory.generateErrorEmbed(
                            `${Utility.translate(commandGuild?.language, 'common:ERROR')}`, 
                            `${Utility.translate(commandGuild?.language, 'common:MISSING_PERMS', {roles: command?.botPermissions.join(', ')})}`
                        )
                    ]
                })
            }

            if(command?.permissions) {
                if((channel.permissionsFor(newMsg.member!)?.has(command.permissions, true) || newMsg.member?.permissions?.has(command.permissions, true))) {
                    return await command?.execute(this.client, newMsg, cmdArgs, commandGuild)
                } else {
                    return newMsg.reply({
                        embeds: [
                            EmbedFactory.generateErrorEmbed(
                                `${Utility.translate(commandGuild?.language, 'common:ERROR')}`,
                                `${Utility.translate(commandGuild?.language, 'common:USER_MISSING_PERMS', {roles: command?.permissions.join(', ')})}`
                            )
                        ]
                    })
                    
                }
            }
            await command?.execute(this.client, newMsg, cmdArgs, commandGuild)




        } catch (error) {
            this.client.logger.error(`Command execution error - msg edit`, error, () => {})
            newMsg.reply({embeds: [EmbedFactory.generateErrorEmbed(`${Utility.translate(commandGuild?.language, 'common:ERROR')}`, `${Utility.translate(commandGuild?.language, 'misc:ERROR_OCURRED')}`)]})
            return;
        }
            
    
    }
}