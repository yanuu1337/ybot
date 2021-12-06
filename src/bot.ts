import ArosClient from "./extensions/ArosClient";
import {config} from 'dotenv';
import Database from "./util/Database";
config();
const client = new ArosClient()
new Database(client)

client.once('ready', () => {
    client.logger.info('BOT: Connected.')
})