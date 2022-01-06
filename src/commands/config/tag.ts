import { Collection, Message, MessageEmbed } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";

export default class extends Command {
    
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        if(args[0].toLowerCase() === "create") {
            return this.createTag(client, message, args.slice(1), guild);
        } else if (args[0].toLowerCase() === "delete" || args[0].toLowerCase() === "remove") {
            return this.removeTag(client, message, args.slice(1), guild);
        } else {
            return client.handlers.tags.fetch({discord_id: message.guild?.id, tag: args[0].toLowerCase()}).then(tag => {
                if(!tag) return message.channel.send(`Tag \`${args[0]}\` not found.`);
                console.log(tag);
                return message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`\`${tag.tag}\``)
                            .setColor("RANDOM")
                            .setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL()})
                            .setDescription(`${tag.content}`).setFooter({text: `© ${new Date().getFullYear()} - Aros | created by ${tag.author?.toString()}`})
                    ]
                })
            })
        }
        

        
    }


    async createTag(client: ArosClient, message: Message, args: string[], guild: GuildInterface | null): Promise<any> {

        if(!guild) return message.channel.send("You are not in a guild!");
    
        if(!args[0]) return message.channel.send("Please provide a tag name!");
        const illegalCharacters = ["<", ">", ":", ";", ",", ".", "?", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "{", "}", "[", "]", "|", "\\", "/", "`", "~", "\"", "'", " "];

        if(illegalCharacters.some(char => args[0].includes(char))) return message.channel.send("Tag name contains illegal characters!");
        
        if(args[0].length > 32) return message.reply("Tag name is too long!");
        if(args[0].length < 2) return message.reply("Tag name is too short!");
        const tagExists = await client.handlers.tags.fetch({discord_id: message.guild?.id, tag: args[0].toLowerCase()});
        if(tagExists) return message.reply("Tag already exists!");
        //create a message collector for the tag content
        const filter = (msg: Message<boolean>) => msg.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({filter, time: 60000, max: 1});
        message.reply("Please provide the content of the tag!");
        collector.on('collect', (msg: Message<boolean>): any => {
            if(msg.content.toLowerCase() === 'cancel') {
                message.reply(`Cancelled creating tag ${args[0]}`);
                return;
            }
            if(msg.content.length > 1024) return msg.reply("Tag content is too long!");
            if(msg.content.length < 2) return msg.reply("Tag content is too short!");
            collector.stop();
            client.handlers.tags.create({discord_id: message.guild?.id, tag: args[0].toLowerCase(), content: msg.content, author: {id: message.author.id, tag: message.author.tag}});
            message.reply(`Tag ${args[0]} created! Preview it using \`${guild?.prefix}tag ${args[0]}\``);
        })

        collector.on('end', (collected: Collection<string, Message<boolean>>): any => {
            if(!collected.size) return message.channel.send("Tag creation cancelled!");
        })

    }

    async removeTag(client: ArosClient, message: Message, args: string[], guild: GuildInterface | null): Promise<any> {
        const tagExists = await client.handlers.tags.fetch({discord_id: message.guild?.id, tag: args[0].toLowerCase()});
        if(!tagExists) return message.reply("Tag doesn't exist!");
        await client.handlers.tags.delete({discord_id: message.guild?.id, tag: args[0].toLowerCase()});
        return message.reply(`Tag ${args[0]} deleted!`);


    }
}