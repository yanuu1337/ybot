import { Message } from "discord.js";
import EmbedFactory from "../../util/EmbedFactory";
import Utility from "../../util/Utility";
import ArosClient from "../../extensions/ArosClient";
import Command from "../../lib/structures/Command";
import { GuildInterface } from "../../lib/types/database";


export default class extends Command {
    dm = true;
    usage = 'rps <rock|paper|scissors>';
    aliases = ['rockpaperscissors', 'rpsgame']
    description = 'Rock beats scissors. Scissors beats paper. Paper beats rock.';
    async execute(client: ArosClient, message: Message<boolean>, args: string[], guild: GuildInterface | null): Promise<any> {
        
        const user = await client.handlers.users.fetchOrCreate(message.author);
        
        const choices = ['rock', 'paper', 'scissors'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        const userChoice = args[0];
        if(!userChoice) return message.reply({embeds: [
            EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(user?.language, `fun/rps:NO_CHOICE`)}`)
        ]});
        if(!choices.includes(userChoice)) return message.reply({embeds: [
            EmbedFactory.generateErrorEmbed(`Error`, `${Utility.translate(user?.language, `fun/rps:INVALID_CHOICE`)}`)
        ]});
        if(botChoice === userChoice) return message.reply({embeds: [
            EmbedFactory.generateInfoEmbed(`${Utility.translate(user?.language, `fun/rps:RESULT`, {user: message.author.username})}`, `${Utility.translate(user?.language, `fun/rps:DRAW`, {bot: botChoice})}`).setColor("WHITE")
        ]});
        
        
        
        if(
            (botChoice === 'rock' && userChoice === 'scissors') || 
            (botChoice === 'paper' && userChoice === 'rock') ||
            (botChoice === 'scissors' && userChoice === 'paper')
        ) return message.reply({embeds: [
            EmbedFactory.generateInfoEmbed(`${Utility.translate(user?.language, `fun/rps:RESULT`, {user: message.author.username})}`, `${Utility.translate(user?.language, `fun/rps:LOSE`, {bot: botChoice})}`).setColor("RED")
        ]});
        if(
            (botChoice === 'paper' && userChoice === 'scissors') || 
            (botChoice === 'scissors' && userChoice === 'rock') || 
            (botChoice === 'rock' && userChoice === 'paper')
        ) return message.reply({embeds: [
            EmbedFactory.generateInfoEmbed(`${Utility.translate(user?.language, `fun/rps:RESULT`, {user: message.author.username})}`, `${Utility.translate(user?.language, `fun/rps:WIN`, {bot: botChoice})}`).setColor("GREEN")
        ]});
        
        
    }

}

