import { Message } from 'discord.js';
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import fetch from 'node-fetch'
import EmbedFactory from '../../util/EmbedFactory';
import Utility from '../../util/Utility';
export default class extends Command {
    category = 'test';
    async execute(client: ArosClient, message: Message, args: string[]) {
        let dateNow = Date.now()
        let dateThen;
        const msg = await message.reply({embeds: [EmbedFactory.generateLoadingEmbed(false, `Ping`, Utility.translate('en-US', `commands/ping:LOADING`))]})
        await fetch('https://discord.com/api/v8/users/@me', {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${client.token}`
            }
        }).then((res) => {
            if(!res.ok) {
                msg.edit({embeds: [EmbedFactory.generateErrorEmbed(`Ping`, `${Utility.translate('en-US', `commands/ping:GET_API_LAT_FAIL`)}`)]})
                return;
            }
            
            dateThen = Date.now()
            msg.edit({
                content: Math.random() > 0.5 ? `Sometimes these values may not be equivalent to the actual result!` : null,
                embeds: [EmbedFactory.generateLoadingEmbed(true, `Ping`, Utility.translate('en-US', `commands/ping:PING`, {
                    ws: client.ws.ping, 
                    api: (dateThen - dateNow),
                    command: (msg.createdTimestamp - message.createdTimestamp) 
                }))]
        })
        })

        
        

    }
}