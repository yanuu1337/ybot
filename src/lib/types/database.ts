import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface User {
    discord_id: string,
    created_at?: string,
    blacklisted: boolean,
} 
export type MySQLResponseType = RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader | FieldPacket[];
