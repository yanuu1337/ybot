import { Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
enum ActivityTypes {
    PLAYING = 0,
    STREAMING = 1,
    LISTENING = 2,
    WATCHING = 3,
    CUSTOM = 4,
    COMPETING = 5,
  }
export default class extends Command {
    devOnly = true;
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        if(!args[0] || !['dnd', 'online', 'idle', 'invisible'].includes(args[0].toLowerCase())) {
            return message.reply(`${message.author}, please specify a valid status ${['dnd', 'online', 'idle', 'invisible'].map(k => `\`${k}\``).join(', ')}.`);
        }
        const dotStatus = args[0].toLowerCase() as 'dnd' | 'online' | 'idle' | 'invisible';
        
        const collector = message.channel.createMessageCollector({filter: m => m.author.id === message.author.id, time: 60000 });
        const ActivityOptions = Object.keys(ActivityTypes)
        message.reply(`Choose a status! Pick from ${ActivityOptions.map(k => `\`${k}\``).join(', ')}`);
        collector.on('collect', (m: Message<boolean>) => {
            if(m.content === 'cancel') {
                collector.stop('cancelled');
                message.reply({content: 'Cancelled!'});
                return;
            }
            if(m.content === 'clear') {
                client.user?.setPresence({});
                collector.stop('cleared');
                message.channel.send({content: 'Cleared!'});
                return;
            }
            if(!ActivityOptions.some(val => !val.includes(m.content))) {
                message.reply('Invalid option!');
                collector.stop('opt');
                return;
            }
            collector.stop('');

        })
        collector.on('end', async (collected, reason) => {
            if(reason === 'cleared' || reason === 'cancelled' || reason === 'opt') return;
            await collected.first()!.reply(`Please enter the status content!`);
            const msgAwaiter = await message.channel.awaitMessages({filter: m => m.author.id === message.author.id, time: 60000, max: 1});
            const status = msgAwaiter?.first()?.content;
            if(!status) {
                message.reply('No status provided!');
                return
            };
            if(reason === 'time') {
                message.reply('Timed out!');
                return;
            }
            
            client.user?.setPresence({activities: [{type: ActivityOptions.find(opt => opt.toLowerCase().includes(collected.first()!?.content.toLowerCase())) as any, name: status}], status: dotStatus, afk: dotStatus === 'idle' ? true : undefined});
            message.reply('Status set!');
        })

    }
}