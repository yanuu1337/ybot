import ArosClient from "./extensions/ArosClient";
import {config} from 'dotenv';
import Database from "./util/Database";
config();
const client = new ArosClient()
const database = new Database(client)
client.once('ready', async () => {
    await client.handlers.api.putGuildTestSlashCommands()
    if(!database.loggedIn) {
        client.logger.error(`DB: Not connected!`)
    } else client.logger.info(`DB: Connected.`)
    client.logger.info('BOT: Connected.')
    client.handlers.guilds.create({
        discord_id: '856924300215713833'
    })   
})
export { client, database }