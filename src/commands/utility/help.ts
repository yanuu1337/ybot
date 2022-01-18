
import { MessagePagination } from './../../util/Pagination';
import { Message, MessageEmbed } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import Utility from '../../util/Utility';
import EmbedFactory from '../../util/EmbedFactory';
const capitalize = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}
export default class extends Command {
    description = "Display a help message.";

    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        
        //sort commands into multiple arrays by their category
        const commands = [...client.handlers.commands.values()].filter(cmd => !cmd.devOnly);
        const categories: {
            [key: string]: Command[]
        } = {
            "General": [],
            "Moderation": [],
            "Config": [],
            "Utility": [],
            "Fun": [],
            "NSFW": [],
        };
        commands.forEach(cmd => {
            
            if(cmd?.category === 'admin') return;
            if(cmd.category) categories[capitalize(cmd.category)].push(cmd);
        });

        if(args[0]) {
            const category = capitalize(args[0]);
            if(!categories[category]) {
                const cmd = client.handlers.commands.find(val => val.name.includes(args[0])) 
                if(!cmd) return message.reply({embeds: [
                    EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(guild?.language, `The category/command \`${args[0]}\` could not be found.`)}`)
                ]});
                const embed = new MessageEmbed()
                    .setColor("GREEN")
                    .setTitle(`Help - ${cmd.name}`)
                    .setDescription(`${cmd.description}`)
                    .addField(`Usage`, `${cmd.usage}`)
                    .addField(`Aliases`, `${cmd.aliases.length ? cmd.aliases.map(val => `\`${val}\``).join(', ') : 'None'} `)
                    .addField(`Required Permissions`, `${cmd.permissions?.length ? cmd.permissions.map(val => `\`${val}\``).join(', ') : 'None'}`)
                    .addField(`Bot Permissions`, `${cmd.botPermissions?.length ? cmd.botPermissions.map(val => `\`${val}\``).join(', ') : 'None'}`)
                    .setFooter(`Category: ${capitalize(cmd.category)}`);
                await message.channel.send({embeds: [embed]});
                return;
            }
            
            const commandsOfCategory = categories[category];
            const fields = commandsOfCategory.map(cmd => {
                return {
                    name: `${cmd.name}`,
                    value: `**Description**: \`${cmd.description}\`
                        **Usage:** \`${cmd.usage}\`
                        **Aliases:** ${cmd.aliases.length ? cmd.aliases.map(val => `\`${val}\``).join(', ') : 'None'} 
                        **Required Permissions**: ${cmd.permissions?.length ? cmd.permissions.map(val => `\`${val}\``).join(', ') : 'None'}
                        **Bot Permissions**: ${cmd.botPermissions?.length ? cmd.botPermissions.map(val => `\`${val}\``).join(', ') : 'None'}

                    `,
                    inline: false
                }
            })

            const em = new MessageEmbed({
                title: `Help - ${capitalize(category)}`,
                description: `Use \`${guild?.prefix}help <command>\` to get more info on a command\n
                *[] = optional*, *<> = required*`,
                fields,
                footer: {
                    text: `${commandsOfCategory.length} command(s) in this category`
                }
            })
            return message.reply({embeds: [em]});

        }

        const embeds = Object.keys(categories).map(category => {
            const commands = categories[category];
            const fields = commands.map(cmd => {
                return {
                    name: `\`${cmd.name}\``,
                    value: `**Description**: \`${cmd.description}\`
                    **Usage:** \`${cmd.usage}\`
                    **Aliases:** ${cmd.aliases.length ? cmd.aliases.map(val => `\`${val}\``).join(', ') : 'None'} 
                    **Required Permissions**: ${cmd.permissions?.length ? cmd.permissions.map(val => `\`${val}\``).join(', ') : 'None'}
                    **Bot Permissions**: ${cmd.botPermissions?.length ? cmd.botPermissions.map(val => `\`${val}\``).join(', ') : 'None'}

                    `,
                    inline: false
                }
            });
            return new MessageEmbed({
                title: `Help - ${capitalize(category)}`,
                description: `**Use the reactions below to navigate the help menu!**
                Use \`${guild?.prefix}help <command>\` to get more info on a command
                Use \`${guild?.prefix}help <category>\` to get more info on a category\n
                *[] = optional*, *<> = required*`,
                fields,
                footer: {
                    text: `${commands.length} command(s) in this category`
                }
            })
        });
        await new MessagePagination(message, {
            embed: embeds[0],
            edit: (index, emb: MessageEmbed, page: any) => emb.setTitle(`Help - ${capitalize(page.title.split('-')[1])}`),
            pages: embeds
        }).start();
        
    }
}