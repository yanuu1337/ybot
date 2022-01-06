import { Guild } from 'discord.js';
import { Tag as TagInterface} from './../lib/types/database';
import ArosClient from "../extensions/ArosClient";
export default class TagHandler {
    client: ArosClient;
    constructor(client: ArosClient) {
        this.client = client;
        this.init()
    }

    private init(): void {
        setTimeout(async () => {
            this.client.db?.query(`CREATE TABLE IF NOT EXISTS \`tags\` (\`id\` INT NOT NULL AUTO_INCREMENT,
            \`discord_id\` VARCHAR(25) NOT NULL, 
            \`tag\` VARCHAR(10) DEFAULT '=',
            \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
            \`joined_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`content\` TEXT NOT NULL,
            \`author\` JSON NOT NULL,
            PRIMARY KEY(\`id\`)) ENGINE= InnoDB;
            `);
            
        }, 1000);
    }

    async create(data: TagInterface) {
        const exists = await this.fetch({discord_id: data.discord_id, tag: data.tag});
        data.author = JSON.stringify(data.author)
        if(exists) return;
        const insert = await this.client.db?.insert('tags', data).catch(err => {
            this.client.logger.error(`Error creating tag ${data.tag} for ${data.discord_id}`, err)
            return false;
        });
        if(insert) return data;
        return false;
    }

    async delete(data: TagInterface) {
        const deleteTag = await this.client.db?.delete('tags', {discord_id: data.discord_id, tag: data.tag}).catch(err => {
            this.client.logger.error(`Error deleting tag ${data.tag} for ${data.discord_id}`, err)
            return false;
        });
        if(deleteTag) return data;
        return false;
    }

    async edit(data: TagInterface) {
        const exists = await this.fetch({discord_id: data.discord_id, tag: data.tag});
        if(!exists) return;
        const udpate = await this.client.db?.update('tags', {discord_id: data.discord_id, tag: data.tag}, data).catch(err => {
            this.client.logger.error(`Error editing tag ${data.tag} for ${data.discord_id}`, err)
            return false;
        });
        if(udpate) return data;
        return false;

    }

    async fetch(obj: {discord_id?: string, tag?: string} | TagInterface): Promise<TagInterface | null> {
        const data = await this.client.db?.get('tags', obj, false) as TagInterface[];
        return data?.[0] ?? null;
    }

    async getTags(guild: string | Guild) {
        const data = await this.client.db?.get('tags', {discord_id: guild instanceof Guild ? guild.id : guild}, false) as TagInterface[];
        return data ?? [];
    }

    
   
    
    
    
}