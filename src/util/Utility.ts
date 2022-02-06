
import { client } from "../bot";

export default class Utility extends null {
    
    constructor() {
        
    }

    static bytesToSize(bytes: number, precision: number = 2) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Bytes';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10);
        if (i == 0) return `${bytes} ${sizes[i]}`;
        return `${(bytes / (1024 ** i)).toFixed(precision)} ${sizes[i]}`;
    }
        

    static isString(val: any) {
        return Object.prototype.toString.call(val) === '[object String]';
    }

    static translate(language?: string, key?: string, args?: Record<string, unknown>) {
        
        const lang = client.translate.get(language ?? 'en-US');

        if(!lang) throw new Error(`No language.`)
        if(!key) throw new Error(`No key specified.`)
        return lang(key, args);
    }
    static secondsToDhms(seconds: number) {
        let d = Math.floor(seconds / (3600*24));
        let h = Math.floor(seconds % (3600*24) / 3600);
        let m = Math.floor(seconds % 3600 / 60);
        let s = Math.floor(seconds % 60);
        let dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
        let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return dDisplay + hDisplay + mDisplay + sDisplay;
    }

    static getChunk(...args: any[]) {
        const [arr, len] = args;
        const rest = [];
        for(let i = 0; i < arr.length; i += len) {
            rest.push(arr.slice(i, i + len))
        }
        return rest;
    }
}