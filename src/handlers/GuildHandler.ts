
import { Collection, Guild } from "discord.js";
import ArosClient from "../extensions/ArosClient";
import { Guild as GuildInterface } from "../lib/types/database";
export default class GuildHandler extends Collection<string, GuildInterface> {
    client: ArosClient;
    constructor(client: ArosClient) {
        super();
        this.client = client;
        this.init()
    }

    private init(): void {
        setTimeout(() => {
            this.client.db?.query(`CREATE TABLE IF NOT EXISTS \`guilds\` (\`id\` INT NOT NULL AUTO_INCREMENT,
            \`discord_id\` VARCHAR(25) NOT NULL, 
            \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
            \`joined_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`blacklisted\` BOOLEAN NOT NULL DEFAULT FALSE, 
            \`language\` VARCHAR(10) NOT NULL DEFAULT 'en-US',
            \`autoroles\` JSON NULL DEFAULT NULL,
            PRIMARY KEY(\`id\`)) ENGINE= InnoDB;
            `)
        }, 1000)
        
    }
    async edit(id: Guild | string, query: object): Promise<void> {
        this.client.db?.update('guilds', {discord_id: id instanceof Guild ? id.id : id}, query);
    }

    async create(data: GuildInterface) {
        const didPass = this.client.db?.insert('guilds', data).catch(err => false)
        return didPass ?? true;
    }

    async fetch(query: Guild | string): Promise<GuildInterface | null> {
        const id = query instanceof Guild ? query.id : query
        if(this.has(id)) return this.get(id) ?? null
        const data = await this.client.db?.get('guilds', 'discord_id', id) as GuildInterface[]
        this.set(id, data[0])
        return data[0];
    }

    async fetchAll() {
        const results = await this.client.db?.query(`SELECT * from guilds WHERE blacklised = false;`)
        return results
    }
   
    
    
    
}