import ArosClient from "./extensions/ArosClient";
import {config} from 'dotenv';
import Database from "./util/Database";
config();
const client = new ArosClient()
const database = new Database(client)
client.once('ready', async () => {
    if(!database.loggedIn) {
        client.logger.error(`DB: Not connected!`)
    } else client.logger.info(`DB: Connected.`)
    client.logger.info('BOT: Connected.')
})
export { client, database }