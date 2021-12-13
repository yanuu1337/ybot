
import ArosClient from "../extensions/ArosClient";
import { User } from "../lib/types/database";
export default class UserHandler {
    client: ArosClient;
    constructor(client: ArosClient) {
        this.client = client;
        this.init()
    }

    private init(): void {
        setTimeout(() => {
            this.client.db?.query(`CREATE TABLE IF NOT EXISTS \`users\` (\`id\` INT NOT NULL AUTO_INCREMENT,
            \`discord_id\` VARCHAR(25) NOT NULL, \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \`blacklisted\` BOOLEAN NOT NULL DEFAULT FALSE, \`language\` VARCHAR(10) NOT NULL DEFAULT 'en-US', PRIMARY KEY(\`id\`)) ENGINE= InnoDB;
            `)
        }, 1000)
        
    }
    async edit(id: string, query: object): Promise<void> {
        this.client.db?.update('users', {discord_id: id}, query);
    }

    async create(data: User) {
        this.client.db?.insert(`users`, data)
        return data;
    }

    async fetchAll() {
        const results = await this.client.db?.query(`SELECT * from users;`)
        return results
    }
    
    
    
    
}