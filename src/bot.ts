import ArosClient from "./extensions/ArosClient";
import {config} from 'dotenv';
import Database from "./util/Database";
config();
const client = new ArosClient()
const database = new Database(client)
client.once('ready', async () => {
    await client.handlers.api.putSlashCommands()
    if(!database.loggedIn) {
        client.logger.error(`DB: Not connected!`)
    } else client.logger.info(`DB: Connected.`)
    client.logger.info('BOT: Connected.')
    client.handlers.guilds.create({
        discord_id: '856924300215713833'
    })

    await client.db?.query(`CREATE TABLE IF NOT EXISTS phishing_data (
        id INT NOT NULL AUTO_INCREMENT,
        domain VARCHAR(255) NOT NULL,
        legit BOOLEAN NOT NULL DEFAULT FALSE,
        PRIMARY KEY(\`id\`)) ENGINE= InnoDB;    
    `)
})
export { client, database }