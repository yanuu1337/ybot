import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface User {
    discord_id: string,
    created_at?: string,
    blacklisted?: boolean,
    language?: string,

} 
export interface GuildInterface  {
    discord_id: string,
    created_at?: string,
    language?: string,
    joined_at?: string,
    blacklisted?: boolean,
    autoroles?: object[] | any[],
} 


export type MySQLResponseType = RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader | FieldPacket[];
