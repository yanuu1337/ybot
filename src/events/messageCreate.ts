import { Message, NewsChannel, Permissions, TextChannel, ThreadChannel } from "discord.js";
import ArosClient from "../extensions/ArosClient";
import Event from '../lib/structures/Event'
import EmbedFactory from "../util/EmbedFactory";
import Utility from "../util/Utility";
export default class extends Event {
    readonly requiredPermissions = new Permissions(['VIEW_CHANNEL', 'SEND_MESSAGES']).freeze()
    async execute(client: ArosClient, msg: Message) {
        if(msg.author.bot || msg.webhookId || msg.partial) return;
        
        if(msg.channel.type === 'DM') {
            //!Handle DMs
            
            return;
        }
        const guildMe = msg?.guild?.me ?? await msg.guild?.members.fetch(`${this.client.user?.id}`)!
        const channel = msg.channel as TextChannel | ThreadChannel | NewsChannel
        if(!msg.guild) return;
        if(!channel?.permissionsFor(guildMe)?.has(this.requiredPermissions, true)) return;
        const commandGuild = this.client.handlers.guilds.fetch(msg.guild!)
        if(!commandGuild) {
            this.client.handlers.guilds.create({
                discord_id: msg.guild!.id,
                language: 'en-US',
            })
        }
        const [cmdName, ...cmdArgs] = msg.content
        .slice('='.length)
        .trim()
        .split(/\s+/);

        const command = this.client.handlers.commands.fetch(cmdName.toLowerCase());
        const guild = await this.client.handlers.guilds.fetch(msg.guild)
        try {
            if (command?.botPermissions && !channel.permissionsFor(guildMe)?.has(command?.botPermissions, true)) {
                return msg.reply({embeds: 
                    [
                        EmbedFactory.generateErrorEmbed(
                            `${Utility.translate(guild?.language, 'common:ERROR')}`, 
                            `${Utility.translate(guild?.language, 'common:MISSING_PERMS', {roles: command?.botPermissions.join(', ')})}`
                        )
                    ]
                })
            }
            if(command?.permissions) {
                if((channel.permissionsFor(msg.member!)?.has(command.permissions, true) || msg.member?.permissions?.has(command.permissions, true))) {
                    return await command?.execute(this.client, msg, cmdArgs, guild)
                } else {
                    return msg.reply({
                        embeds: [
                            EmbedFactory.generateErrorEmbed(
                                `${Utility.translate(guild?.language, 'common:ERROR')}`,
                                `${Utility.translate(guild?.language, 'common:USER_MISSING_PERMS', {roles: command?.permissions.join(', ')})}`
                            )
                        ]
                    })
                    
                }
            }
            await command?.execute(this.client, msg, cmdArgs, guild)
        } catch (error) {
            this.client.logger.error(`Command execution error`, error, () => {})
            msg.reply({embeds: [EmbedFactory.generateErrorEmbed(`${Utility.translate(guild?.language, 'common:ERROR')}`, `${Utility.translate(guild?.language, 'misc:ERROR_OCURRED')}`)]})
            return;
        }
    }

    async handleMention(message: Message) {
        if(message.mentions.users.find(user => user.id === this.client.user?.id)) {
            //! Handle mention text (print prefix, settings, main commands, etc.)
        }
    }

    async checkInvites(message: Message) {
        const inviteRegex = /(discord\.(gg|io|me|li|plus|link)\/.+|discord(?:app)?\.com\/invite\/.+)/i;
        if(message.content.match(inviteRegex) || inviteRegex.test(message.content)) {
            
            //!Handle invites
        }
    }
}