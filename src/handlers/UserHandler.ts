
import { Collection, GuildMember, User } from "discord.js";
import ArosClient from "../extensions/ArosClient";
import { User as UserInterface } from "../lib/types/database";
export default class UserHandler extends Collection<string, UserInterface> {
    client: ArosClient;
    constructor(client: ArosClient) {
        super();
        this.client = client;
        this.init()
    }

    private init(): void {
        setTimeout(() => {
            this.client.db?.query(`CREATE TABLE IF NOT EXISTS \`users\` (\`id\` INT NOT NULL AUTO_INCREMENT,
            \`discord_id\` VARCHAR(25) NOT NULL, 
            \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
            \`blacklisted\` BOOLEAN NOT NULL DEFAULT FALSE, 
            \`badges\` JSON NULL DEFAULT NULL,
            \`language\` VARCHAR(10) NOT NULL DEFAULT 'en-US', PRIMARY KEY(\`id\`)) ENGINE= InnoDB;
            `)
        }, 1000)
        
    }
    async edit(id: string, query: object) {
        if(!this.get(id)) return undefined;
        await this.client.db?.update('users', {discord_id: id}, query);
        this.set(id, {...this.get(id), ...query} as UserInterface)
        return await this.fetch(id, true);
        
    }

    async create(data: UserInterface) {
        this.client.db?.insert(`users`, data)
        this.set(data.discord_id, data);
        return data;
    }

    async fetchOrCreate(query: User | GuildMember) {
        const fetchResult = await this.fetch(query, true)
        if(fetchResult) return fetchResult;
        else return this.create({discord_id: query.id})

    }
    
    async fetch(query: User | GuildMember | string, force = false) {
        const id = (query instanceof User || query instanceof GuildMember) ? query.id : query
        if(this.has(id) && !force) return this.get(id) ?? null;
        const data = await this.client.db?.get('users', 'discord_id', id) as UserInterface[]
        this.set(id, data[0])
        return data[0]
    }

    async fetchAll() {
        const results = await this.client.db?.query(`SELECT * from users;`)
        return results
    }
    
    
    
    
}