import { Message, NewsChannel, Permissions, TextChannel, ThreadChannel } from "discord.js";
import ArosClient from "../extensions/ArosClient";
import Event from '../lib/structures/Event'
import EmbedFactory from "../util/EmbedFactory";
import Util from "../util/Util";
export default class extends Event {
    readonly requiredPermissions = new Permissions(['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS']).freeze()
    async execute(client: ArosClient, msg: Message) {
        if(msg.author.bot || msg.webhookId || msg.partial) return;
        
        if(msg.channel.type === 'DM') {
            //!Handle DMs
            
            return;
        }
        const guildMe = msg?.guild?.me ?? await msg.guild?.members.fetch(`${this.client.user?.id}`)!
        const channel = msg.channel as TextChannel | ThreadChannel | NewsChannel
        
        if(!channel?.permissionsFor(guildMe)?.has(this.requiredPermissions, true)) return;
        
        const [cmdName, ...cmdArgs] = msg.content
        .slice('='.length)
        .trim()
        .split(/\s+/);

        const command = this.client.handlers.commands.fetch(cmdName.toLowerCase());
        try {
            await command?.execute(this.client, msg, cmdArgs)
        } catch (error) {
            this.client.logger.error(`Command execution error`, error, () => {})
            msg.reply({embeds: [EmbedFactory.generateErrorEmbed(`${Util.translate('en-US', 'common:ERROR')}`, `${Util.translate('en-US', 'misc:ERROR_OCURRED')}`)]})
            return;
        }
        this.client.logger.log('info', `${msg.author.tag}: ${msg.content}`)
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