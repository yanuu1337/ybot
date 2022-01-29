import { Message, MessageEmbed } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";

export default class extends Command {
    description = 'Send a message to an user';
    devOnly = true;
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        if(!args[0]) {
            return message.reply(`Please specify a user to send a message to.`);
        }
        const founduser = message.mentions.users.first() 
            || client.users.cache.get(args[0]) 
            || client.users.cache.find(val => val.tag.toLowerCase().includes(args[0])) 
            || await client.users.fetch(args[0]).catch(err => null)
        
        if(!founduser) return message.reply("Could not find user!");

        if(!args[1]) {
            const msg = await message.reply(`Awaiting a message to send to ${founduser.tag}:`);
            const collector = message.channel.createMessageCollector({filter: m => m.author.id === message.author.id, max: 1, time: 60_000 });
            collector.on('collect', async m => {
                collector.stop();
                msg.edit(`Sending message to ${founduser.tag}...`);
                const messageSentTOUser = await founduser.send({
                    embeds: [
                        new MessageEmbed({
                            title: "Important Message From Developer",
                            description: m.content,
                            color: 0xFF0000,
                            fields: [{name: "Please don't ignore this message.",
                                value: `This message was sent to you by a developer of the bot. Add **${message.author.tag}** or join the **[Discord](https://discord.gg/QWDtak23Mx)** to stay in touch.`
                            }],
                            footer: {
                                text: `${message.author.tag}`,
                                icon_url: message.author.avatarURL() ?? undefined
                            }
                        }).setTimestamp()
                    ]
                }).catch(err => {
                    client.logger.error(`Error sending message to ${founduser.id} - ${founduser.tag}`, err);
                    return msg.edit(`Failed to send message to ${founduser}. Perhaps they have DMS off?`);
                });
                await msg.edit({
                    content: null,
                    embeds: [
                        new MessageEmbed({
                            title: "Message Sent",
                            description: `${m.content}`,
                            color: 0x00FF00,
                            footer: {
                                text: `MessageID: ${messageSentTOUser.id}`,
                                icon_url: message.author.avatarURL() ?? undefined
                            }
                        }).setTimestamp()
                    ]
                })

            })
        } else {
            const msg = await message.reply(`Sending message to ${founduser.tag}...`);
            const messageSentTOUser = await founduser.send({
                embeds: [
                    new MessageEmbed({
                        title: "Important Message From Developer",
                        description: args.slice(1).join(" "),
                        color: 0xFF0000,
                        fields: [{name: "Please don't ignore this message.",
                            value: `This message was sent to you by a developer of the bot. If you don't want to receive this message again, please contact the developer. Add **${message.author.tag}** or join the **[Discord](https://discord.gg/QWDtak23Mx)** to stay in touch.`
                        }],
                        footer: {
                            text: `${message.author.tag}`,
                            icon_url: message.author.avatarURL() ?? undefined
                        }
                    }).setTimestamp()
                ]
            }).catch(err => {
                client.logger.error(`Error sending message to ${founduser.id} - ${founduser.tag}`, err);
                return msg.edit(`Failed to send message to ${founduser}. Perhaps they have DMS off?`);
            });
            await msg.edit({
                content: null,
                embeds: [
                    new MessageEmbed({
                        title: "Message Sent",
                        description: `${args.slice(1).join(" ")}`,
                        color: 0x00FF00,
                        footer: {
                            text: `MessageID: ${messageSentTOUser.id}`,
                            icon_url: message.author.avatarURL() ?? undefined
                        }
                    }).setTimestamp()
                ]
            })
        }


    }
}