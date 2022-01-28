import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction, Message } from "discord.js";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";
import EmbedFactory from '../../util/EmbedFactory';
import Utility from '../../util/Utility';

export default class extends Command {
    description = 'Flip a coin!';
    isSlashCommand = true;
    data = new SlashCommandBuilder().addStringOption(arg => arg.setName("yourchoice").setDescription("The choice you want to make - the bot will tell you if you won.").addChoices([["🗣️ Heads",  "heads"], ["🪙Tails",  "tails"]]));
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        const user = await client.handlers.users.fetchOrCreate(message.author);
        const coin = Math.floor(Math.random() * 2);
        const userChoice = args[0]?.toLowerCase();
        const choice = coin === 0 ? 'heads' : 'tails'
        const msg = await message.reply({
            embeds: [
                EmbedFactory.generateLoadingEmbed(false, `Coinflip`, `${Utility.translate(user?.language, 'fun/coinflip:TENSION')}`)
            ]
        })
        
        return setTimeout(async () => {
            if(msg instanceof Message) {
                if(userChoice && userChoice !== choice) msg.edit({
                    embeds: [
                        EmbedFactory.generateInfoEmbed(`Coinflip`, `${Utility.translate(user?.language, 'fun/coinflip:RESULT_LOST', { choice })}`).setColor("RED")
                    ]
                })
                else if (userChoice === choice) msg.edit({
                    embeds: [
                        EmbedFactory.generateInfoEmbed(`Coinflip`, `${Utility.translate(user?.language, 'fun/coinflip:RESULT_WON', { choice })}`).setColor("GREEN")
                    ]
                })
                else msg.edit({
                    embeds: [
                        EmbedFactory.generateInfoEmbed(`Coinflip`, `${Utility.translate(user?.language, 'fun/coinflip:RESULT', { choice })}`).setColor("YELLOW")
                    ]
                })
                
            } 
        }, 1000)
    }

    async executeSlash(client: ArosClient, interaction: CommandInteraction<CacheType>, guild: GuildInterface | null, isInDms?: boolean): Promise<any> {
        const user = await client.handlers.users.fetchOrCreate(interaction.user);
        const coin = Math.floor(Math.random() * 2);
        const userChoice = interaction.options.getString("yourchoice") as "heads" | "tails" | null;
        const choice = coin === 0 ? 'heads' : 'tails'
        const msg = await interaction.reply({
            embeds: [
                EmbedFactory.generateLoadingEmbed(false, `Coinflip`, `${Utility.translate(user?.language, 'fun/coinflip:TENSION')}`)
            ], fetchReply: true
        })
        console.log(userChoice, choice);
        return setTimeout(async () => {
            if(msg instanceof Message && userChoice) {
                if(userChoice !== choice) msg.edit({
                    embeds: [
                        EmbedFactory.generateInfoEmbed(`Coinflip`, `${Utility.translate(user?.language, 'fun/coinflip:RESULT_LOST', { choice })}`).setColor("RED")
                    ]
                })
                else msg.edit({
                    embeds: [
                        EmbedFactory.generateInfoEmbed(`Coinflip`, `${Utility.translate(user?.language, 'fun/coinflip:RESULT_WON', { choice })}`).setColor("GREEN")
                    ]
                })
            } else if (msg instanceof Message) {
                msg.edit({
                    embeds: [
                        EmbedFactory.generateInfoEmbed(`Coinflip`, `${Utility.translate(user?.language, 'fun/coinflip:RESULT', { choice })}`).setColor("YELLOW")
                    ]
                })
            }
        }, 1000)
        
        
    }
}