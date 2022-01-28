
import { Guild, GuildMember } from "discord.js";
import ArosClient from "../extensions/ArosClient";
import { LevelUser } from "../lib/types/database";
export default class LevelingHandler {
    client: ArosClient;
    constructor(client: ArosClient) {
        this.client = client;
        this.init()
    }

    private init(): void {
        setTimeout(() => {
            this.client.db?.query(`CREATE TABLE IF NOT EXISTS \`levels\` (\`id\` INT NOT NULL AUTO_INCREMENT,
                \`discord_id\` VARCHAR(25) NOT NULL,
                \`guild_id\` VARCHAR(25) NOT NULL, 
                \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
                \`level\` INT NOT NULL DEFAULT 0,
                \`xp\` INT NOT NULL DEFAULT 0,
                PRIMARY KEY(\`id\`)) ENGINE= InnoDB;
            `)
        }, 1000)
        
    }
    async edit(data: {member?: GuildMember, guild_id?: string, member_id?: string}, query: object) {
        await this.client.db?.update('levels', {discord_id: data.member ? data.member.id : data.member_id, guild_id: data.member ? data.member.guild.id : data.guild_id}, query);
        return await this.fetch(data, true);
        
    }

    async create(data: LevelUser) {
        this.client.db?.insert(`levels`, data)
        return data;
    }

    async fetchOrCreate(query: GuildMember) {
        const fetchResult = await this.fetch({member: query}, true)
        if(fetchResult) return fetchResult;
        else return this.create({discord_id: query.id, guild_id: query.guild.id})

    }
    
    async addLevel(member: GuildMember, amount: number) {
        const user = await this.fetch({ member })
        if(!user) return;
        const newLevel = (user.level ?? 0) + amount;
        await this.edit({ member }, {level: newLevel})
        return newLevel;
    }

    async setLevel(member: GuildMember, level: number) {
        await this.edit({ member }, { level })
        return level;
    }

    async setXp(member: GuildMember, xp: number) {
        await this.edit({ member }, { xp })
        return xp;
    }

    async addXp(member: GuildMember, amount: number) {
        const user = await this.fetch({ member })
        if(!user) return;
        
        const newXp = (user.xp ?? 0) + amount;
        await this.edit({ member }, { xp: newXp })

        return newXp;
    }

    async getLevel(member: GuildMember) {
        const user = await this.fetch({ member })
        if(!user) return;
        return user.level ?? 0;
    }
    

    async getXp(member: GuildMember) {
        const user = await this.fetch({ member })
        if(!user) return;
        return user.xp ?? 0;
    }

    async toggleLeveling(guildId: string | Guild) {
        const isTurnedOn = await this.client.handlers.guilds.fetch(guildId)
        this.client.handlers.guilds.edit(guildId, {leveling: !isTurnedOn?.config?.leveling})
        return !isTurnedOn?.config?.leveling
    }

    async getLevelingStatus(guildId: string | Guild) {
        const guild = guildId instanceof Guild ? guildId : this.client.guilds.cache.get(guildId)
        if(!guild) return false;
        const guildConfig = await this.client.handlers.guilds.fetch(guildId)
        return guildConfig?.config?.leveling ?? false
    }

    /**
     * 
     * @param query {string | User | GuildMember}
     * @param force 
     * @returns 
     */
    async fetch(query: {member?: GuildMember, guild_id?: string, member_id?: string}, force = false) {
        if(query.member) {
            const data = await this.client.db?.get('levels', {discord_id: query.member?.id, guild_id: query.member.guild.id}) as LevelUser[]
            return data?.[0]

        }
        const data = await this.client.db?.get('levels', {discord_id: query?.member_id, guild_id: query.guild_id}) as LevelUser[]
        
        return data?.[0]
    }

    async fetchAll() {
        const results = await this.client.db?.query(`SELECT * from levels;`)
        return results
    }
    
    
    
    
}