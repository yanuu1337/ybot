import { Autoroles } from './../lib/types/database';

import { Collection, Guild } from "discord.js";
import ArosClient from "../extensions/ArosClient";
import { GuildInterface as GuildInterface } from "../lib/types/database";
export default class GuildHandler extends Collection<string, GuildInterface> {
    client: ArosClient;
    constructor(client: ArosClient) {
        super();
        this.client = client;
        this.init()
        
    }

    private init(): void {
        setTimeout(async () => {
            this.client.db?.query(`CREATE TABLE IF NOT EXISTS \`guilds\` (\`id\` INT NOT NULL AUTO_INCREMENT,
            \`discord_id\` VARCHAR(25) NOT NULL, 
            \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
            \`joined_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`blacklisted\` BOOLEAN NOT NULL DEFAULT FALSE, 
            \`language\` VARCHAR(10) NOT NULL DEFAULT 'en-US',
            \`autoroles\` JSON NULL DEFAULT NULL,
            \`mod_log\` VARCHAR(25) NULL DEFAULT NULL,
            PRIMARY KEY(\`id\`)) ENGINE= InnoDB;
            `);
            (await this.client.guilds.fetch()).forEach((key) => {
                if(key instanceof Guild) this.create({
                    discord_id: key.id,
                    language: 'en-US',
                    mod_log: key.channels.cache.find(c => (c.name.toLowerCase().includes('mod') && c.name.toLowerCase().includes('log')) || c.name.toLowerCase().includes('offences'))?.id ?? null
                })
            })
        }, 1000);
        
    }
    async fetchOrCreate(query: Guild): Promise<GuildInterface | null> {
        const data = await this.fetch(query.id)
        if(data) return data
        return this.create({discord_id: query.id})
    }

    async edit(id: Guild | string, query: GuildInterface | object) {
        const realId = id instanceof Guild ? id.id : id
        await this.client.db?.update('guilds', {discord_id: realId}, query);
        const val = {...this.get(realId), ...query} as GuildInterface
        this.delete(realId);
        this.set(realId, val);
        return await this.fetch(id, true);
    }

    async setAutoRoles(id: Guild | string, query: Autoroles) {
        this.edit(id, {autoroles: JSON.stringify(query)});
    }

    async removeAutoRoles(id: Guild | string) {
        this.edit(id, {autoroles: null});
    }

    async create(data: GuildInterface) {
        if((await this.fetch(data.discord_id, true))) return null;

        const didPass = this.client.db?.insert('guilds', data).catch(err => false)
        if(didPass) this.set(data.discord_id, data)
        return data ?? null;
    }

    async fetch(query: Guild | string, force = false): Promise<GuildInterface | null> {
        const id = query instanceof Guild ? query.id : query
        if(this.has(id) && !force) return this.get(id) ?? null
        const data = await this.client.db?.get('guilds', 'discord_id', id) as GuildInterface[]
        this.set(id, data?.[0])
        return data?.[0];
    }

    async fetchAll() {
        const results = await this.client.db?.query(`SELECT * from guilds WHERE blacklised = false;`)
        return results
    }
   
    
    
    
}