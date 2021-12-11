export default class Util extends null {
    constructor() {
        
    }

    static isString(val: any) {
        return Object.prototype.toString.call(val) === '[object String]';
    }
}