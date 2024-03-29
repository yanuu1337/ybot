// import { Sequelize } from "sequelize";
import ArosClient from "../extensions/ArosClient";
import mysql from 'mysql2/promise'
import { SQLStatement } from "sql-template-strings";
import Utility from './Utility'

type TableCollection = 'users' | 'guilds' | 'levels' | 'tags'
export default class Database {
    client: ArosClient;
    pool: mysql.Pool | null;
    loggedIn: boolean;
    constructor(client: ArosClient) {
        this.client = client;
        this.pool = null;
        this.loggedIn = false;
        try {
            this.pool = mysql.createPool({
                host: process.env.MYSQL_HOST || 'localhost',
                port: 3306,
                user: process.env.MYSQL_USERNAME || 'aros',
                password: process.env.MYSQL_PASSWORD,
                database: 'ybot'
    
            })
            
            this.client.db = this;
            this.loggedIn = true;
            this.test()
        } catch (err) {
            this.client.logger.error('There has been an error upon logging in to MYSQL.', err, () => {})
        }
    }
    /**
     * Finds a single element from the database using the parameters. If no element is found, null is returned.
     * @param {TableCollection} table The table to get a value from
     * @param {object} values The values to search for
     * @param {boolean} useOr Whether to use OR or AND  
     */
    async get(table: TableCollection, values: object, useOr: boolean = false) {
        const keys = Object.keys(values)
        const valuesArr = Object.values(values)
        return (await this.query(`SELECT * FROM ${table} WHERE ${keys.map((val, index) => `${val}=${Utility.isString(valuesArr[index]) ? `'${valuesArr[index]}'` : valuesArr[index]}`).join(` ${useOr ? 'OR' : 'AND'} `)} LIMIT 1;`))?.[0] as mysql.RowDataPacket[] ?? null
    }


    /**
     * Is identical to {@link Array.find()}. 
     * Returns the value of the first element in the array where predicate function returns a thruthy value, otherwise null is returned.
     * @param {TableCollection} table The table to find values form
     * @param {function} filter The function 
     */
    async find(table: TableCollection, predicate: (value: any) => unknown | null) {
        const results = await this.query(`SELECT * FROM ${table};`) as mysql.RowDataPacket[] | mysql.RowDataPacket[][]
        
        if(!results || !results?.length) return null;
        return results[0]?.find(predicate)
    }
    async filter(table: TableCollection, predicate: (value: any) => unknown | null) {
        const results = await this.query(`SELECT * FROM ${table};`) as mysql.RowDataPacket[] | mysql.RowDataPacket[][]
        if(!results || !results?.length) return null;
        return results[0]?.filter(predicate)
    }

    async update(table: TableCollection, where: object, query: object, or: boolean = false) {
        const whereValues = Object.values(where)
        const queryValues = Object.values(query) 
        
        return this.query(`UPDATE ${table} SET ${Object.keys(query).map((val, index) => `${val}=${Utility.isString(queryValues[index]) ? `'${queryValues[index]}'` : queryValues[index]}`).join(', ')} 
        WHERE ${Object.keys(where).map((val, index) => `${val}=${Utility.isString(whereValues[index]) ? `'${whereValues[index]}'` : whereValues[index]}`).join(`${or ? 'OR ' : 'AND '}`)}`)
    }

    /**
     * Makes a SQL query, logs the query to debug and returns SQL's response
     * If an error is caught, undefined is returned
     * @param {string | SQLStatement} query Query
     * @returns 
     */
    async query(query: string | SQLStatement) {
        this._makeLog(query.toString())
        const results = await this.pool?.query(query.toString()).catch((err) => {
            this.client.logger.error(`MYSQL Query error:`, err, () => {});
            return undefined; 
        })
        return results
    }

    /**
     * Delete a row from the table
     * @param table Table to insert values in
     * @param where The values to search for in the table to delete the row
     * @param or Whether to use or/and
     * @returns 
     */
    async delete(table: TableCollection, where: object, or: boolean = false) {
        const whereValues = Object.values(where)
        return this.query(`DELETE FROM ${table} WHERE ${Object.keys(where).map((val, index) => `${val}=${Utility.isString(whereValues[index]) ? `'${whereValues[index]}'` : whereValues[index]}`).join(`${or ? 'OR ' : 'AND '}`)}`)
    }

    /**
     * Inserts a new element to the table.
     * @param {string} table Table to insert values in
     * @param {object} query The values to insert in specific collumns
     */
    async insert(table: string, query: object) {
        
        this.query(`INSERT INTO ${table} (${Object.keys(query).join(', ')}) VALUES (${Object.values(query).map((val) => Utility.isString(val) ? `'${val}'` : val).join(', ')})`)
    }


    /**
     * Tests the MySQL connection
     * @returns {Promise<boolean>} a truthy value once client is connected
     */

    async test(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            this._makeLog(`SELECT 1 + 1;`)
            const query = await this.pool?.query(`SELECT 1 + 1;`).catch(err => {
                this.client.logger.error('There has been an error upon logging in to MYSQL.', err, () => {})
                return null;
                
            })
            if(!query) {
                this.loggedIn = false;
                resolve(false);
            }
            resolve(this.loggedIn ?? query !== null) 
        })
    }
    /**
     * Sends debug data notifying of a MySQL query
     * @param {string} query Query 
     */
    private _makeLog(query: string) {
        this.client.logger.debug(`MySQL query has been sent: ${query}`)
    }
}
