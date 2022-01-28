import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface User {
    discord_id: string,
    created_at?: string,
    blacklisted?: boolean,
    language?: string,
    badges?: BadgesObject[] | null;
}

export interface LevelUser {
    discord_id: string,
    guild_id?: string,
    created_at?: string | number | Date,
    level?: number,
    xp?: number

}
export interface GuildInterface  {
    prefix?: string;
    discord_id: string,
    created_at?: string | number | Date,
    language?: string,
    joined_at?: string,
    blacklisted?: boolean,
    autoroles?: Autoroles | null,
    mod_log?: string | null,
    config?: GuildConfig | null,
} 

export interface Tag {
    id?: string,
    discord_id?: string,
    tag?: string,
    author?: string | {id: string, tag: string},
    created_at?: string | number | Date,
    content?: string,
}
export interface Autoroles {
    bots?: string | null;
    members?: string | null;
    active?: boolean;
}

export interface GuildConfig {
    tag_restrict?: string | null,
    pin_channel?: string | null,
    leveling?: boolean | false,
}

export type Badges = 'STAFF' | 'FRIEND' | 'PREMIUM' | 'TRUSTED_USER' | 'CAT'
export const BadgeEmojis = {
    STAFF:`<:staff:927258825659121715>`,
    PREMIUM: `<:premium:927259468004196413>`,
    TRUSTED_USER: `<:trusted:927290620370882581>`,
    FRIEND: `<:friendship:927291555591635005>`,
    CAT: `<a:catbop:927835314251268106>`
} 
export type BadgesObject = {
    name: Badges,
    emoji: string
}
export type MySQLResponseType = RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader | FieldPacket[];
