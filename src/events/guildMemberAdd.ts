import { GuildMember } from 'discord.js';
import ArosClient from '../extensions/ArosClient';
import Event from '../lib/structures/Event'
export default class extends Event {
    async execute(client: ArosClient, member: GuildMember) {
        
        if(!(await client.handlers.guilds.fetch(member.guild.id))) return;
        const guild = client.handlers.guilds.get(member.guild.id);
        if(guild?.blacklisted) return;
        
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