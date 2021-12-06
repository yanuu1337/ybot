import { Sequelize } from "sequelize";
import ArosClient from "../extensions/ArosClient";

export default class Database extends Sequelize {
    constructor(client: ArosClient) {
        super('aros', process.env.MYSQL_USERNAME!, process.env.MYSQL_PASSWORD!, {
            host: process.env.MYSQL_HOST!,
            database: 'aros',
            dialect: 'mysql',
            logging: (content: string) => client.logger.debug(content)
        })
        client.db = this;
    }
}