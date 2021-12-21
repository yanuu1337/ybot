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
    autoroles?: Autoroles | null | undefined,
} 
export interface Autoroles {
    bots?: string | null;
    members?: string | null;
    active: boolean;
}

export type MySQLResponseType = RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader | FieldPacket[];
