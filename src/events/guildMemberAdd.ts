import { GuildMember } from 'discord.js';
import ArosClient from '../extensions/ArosClient';
import Event from '../lib/structures/Event'
export default class extends Event {
    async execute(client: ArosClient, member: GuildMember) {
        //check if the guild has a blacklist, if so, return
        if(!client.handlers.guilds.has(member.guild.id)) return;
        const guild = client.handlers.guilds.get(member.guild.id);
        if(guild?.blacklisted) return;
        //check if the member is a bot, if so add a respective bot role
        if(guild?.autoroles?.active) {
            if(member.user.bot) {
                const botRole = member.guild.roles.cache.find(r => r.id === guild?.autoroles?.bots);
                if(botRole) member.roles.add(botRole);
                
            } else {
                const userRole = member.guild.roles.cache.find(r => r.id === guild?.autoroles?.members);
                if(userRole) member.roles.add(userRole);
            }
        }
        


    }
}