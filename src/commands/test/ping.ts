import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Message } from 'discord.js';
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import fetch from 'node-fetch'
import EmbedFactory from '../../util/EmbedFactory';
import Utility from '../../util/Utility';
import { GuildInterface } from '../../lib/types/database';
export default class extends Command {
    category = 'test';
    isSlashCommand= true;
    data = new SlashCommandBuilder()
    description = 'Pong!'
    async execute(client: ArosClient, message: Message, args: string[]) {
        let dateNow = Date.now()
        let dateThen;
        const msg = await message.reply({embeds: [EmbedFactory.generateLoadingEmbed(false, `Ping`, Utility.translate('en-US', `info/ping:LOADING`))]})
        await fetch('https://discord.com/api/v8/users/@me', {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${client.token}`
            }
        }).then((res) => {
            if(!res.ok) {
                msg.edit({embeds: [EmbedFactory.generateErrorEmbed(`Ping`, `${Utility.translate('en-US', `info/ping:GET_API_LAT_FAIL`)}`)]})
                return;
            }
            
            dateThen = Date.now()
            msg.edit({
                content: Math.random() > 0.5 ? `Sometimes these values may not be equivalent to the actual result!` : null,
                embeds: [EmbedFactory.generateLoadingEmbed(true, `Ping`, Utility.translate('en-US', `info/ping:PING`, {
                    ws: client.ws.ping, 
                    api: (dateThen - dateNow),
                    command: (msg.createdTimestamp - message.createdTimestamp) 
                }))]
        })
        })
    }
    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        let dateNow = Date.now()
        let dateThen;
        await fetch('https://discord.com/api/v8/users/@me', {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${client.token}`
            }
        }).then((res) => {
            if(!res.ok) {
                interaction.reply({embeds: [EmbedFactory.generateErrorEmbed(`Ping`, `${Utility.translate('en-US', `info/ping:GET_API_LAT_FAIL`)}`)], ephemeral: true})
                return;
            }
            
            dateThen = Date.now()
            interaction.reply({
                content: Math.random() > 0.5 ? `Sometimes these values may not be equivalent to the actual result!` : null,
                embeds: [EmbedFactory.generateLoadingEmbed(true, `Ping`, Utility.translate('en-US', `info/ping:PING`, {
                    ws: client.ws.ping, 
                    api: (dateThen - dateNow),
                    command: Date.now() - interaction.createdTimestamp
                }))], ephemeral: true
        })
        })
    }
}