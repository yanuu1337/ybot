
import { MessagePagination } from '../../util/Pagination';
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
    usage = 'help [command|category]';
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        const user = await client.handlers.users.fetchOrCreate(message.author);
        console.log(user)
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
                    EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(user?.language, `QUERY_NOT_FOUND`, {query: args[0].toLowerCase()})}`)
                ]});
                const embed = new MessageEmbed()
                    .setColor("GREEN")
                    .setTitle(`Help - ${cmd.name}`)
                    .setDescription(`${cmd.description ?? 'No description'}`)
                    .addField(`${Utility.translate(user?.language, `info/help:USAGE`)}`, `${cmd.usage}`)
                    .addField(`${Utility.translate(user?.language, `info/help:ALIASES`)}`, `${cmd.aliases.length ? cmd.aliases.map(val => `\`${val}\``).join(', ') : 'None'} `)
                    .addField(`${Utility.translate(user?.language, `info/help:REQUIRED_PERMS`)}`, `${cmd.permissions?.length ? cmd.permissions.map(val => `\`${val}\``).join(', ') : 'None'}`)
                    .addField(`${Utility.translate(user?.language, `info/help:BOT_REQUIRED_PERMS`)}`, `${cmd.botPermissions?.length ? cmd.botPermissions.map(val => `\`${val}\``).join(', ') : 'None'}`)
                    .setFooter({text: `${Utility.translate(user?.language, `info/help:CATEGORY`)}: ${Utility.translate(user?.language, `info/help:${cmd.category.toUpperCase()}`)}`});
                await message.channel.send({embeds: [embed]});
                return;
            }
            
            const commandsOfCategory = categories[category];
            const fields = commandsOfCategory.map(cmd => {
                return {
                    name: `${cmd.name}`,
                    value: `
                        \`${cmd.description ?? 'No description'}\`\n
                        **${Utility.translate(user?.language, `info/help:USAGE`)}:** \`${cmd.usage}\`
                        **${Utility.translate(user?.language, `info/help:ALIASES`)}:** ${cmd.aliases.length ? cmd.aliases.map(val => `\`${val}\``).join(', ') : 'None'} 
                        **${Utility.translate(user?.language, `info/help:REQUIRED_PERMS`)}**: ${cmd.permissions?.length ? cmd.permissions.map(val => `\`${val}\``).join(', ') : 'None'}
                        **${Utility.translate(user?.language, `info/help:BOT_REQUIRED_PERMS`)}**: ${cmd.botPermissions?.length ? cmd.botPermissions.map(val => `\`${val}\``).join(', ') : 'None'}

                    `,
                    inline: true
                }
            })

            const em = new MessageEmbed({
                title: `Help - ${capitalize(category)}`,
                description: `${Utility.translate(user?.language, `info/help:HELP_DESCRIPTION`, {prefix: guild?.prefix})}`,
                fields,
                footer: {
                    text: `${commandsOfCategory.length} command(s) in this category`
                },
                color: "PURPLE"
            })
            return message.reply({embeds: [em]});

        }

        const embeds = Object.keys(categories).map(category => {
            const commands = categories[category];
            const fields = commands.map(cmd => {
                return {
                    name: `\`${cmd.name}\``,
                    value: `${cmd.description ?? 'No description'}\n
                    **${Utility.translate(user?.language, `info/help:USAGE`)}:** \`${cmd.usage}\` ${cmd.aliases.length ? `\n**${Utility.translate(user?.language, `info/help:ALIASES`)}:** ${cmd.aliases.map(val => `\`${val}\``).join(', ')}` : ''} 
                    ${cmd.permissions?.length ? `**${Utility.translate(user?.language, `info/help:REQUIRED_PERMS`)}**: ${cmd.permissions.map(val => `\`${val}\``).join(', ')}` : ''}
                    ${cmd.botPermissions?.length ? `**${Utility.translate(user?.language, `info/help:BOT_REQUIRED_PERMS`)}**: ${cmd.botPermissions.map(val => `\`${val}\``).join(', ')}` : ''}

                    `,
                    inline: true
                }
            });
            return new MessageEmbed({
                title: `Help - ${capitalize(category)}`,
                description: `${Utility.translate(user?.language, `info/help:HELP_DESCRIPTION`, {prefix: guild?.prefix})}`,
                fields,
                footer: {
                    text: `${commands.length} command(s) in this category`
                },
                color: 'AQUA'
            })
        });
        await new MessagePagination(message, {
            embed: embeds[0],
            edit: (index, emb: MessageEmbed, page: any) => emb.setTitle(`Help - ${capitalize(page.title.split('-')[1])}`),
            pages: embeds
        }).start();
        
    }
}