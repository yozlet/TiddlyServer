"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rx_1 = require("../rx");
function obsTruthy(a) {
    return !!a;
}
class ChainMapOperator {
    /**
     *
     * @param selector A function that returns a string specifying the route to use.
     * If there is no route for that string, the item is sent to defaultRoute instead.
     * @param routes A hashmap of routes.
     * @param defaultRoute The route used if the string returned by selector is not a
     * property of routes.
     */
    constructor(chain) {
        this.chain = chain;
    }
    static isObservable(obj) {
        return typeof obj === "object" && obj instanceof rx_1.Observable;
    }
    call(subs, source) {
        return source
            .map(this.chain)
            .filter(obsTruthy)
            .filter(ChainMapOperator.isObservable)
            .subscribe(subs);
    }
}
exports.ChainMapOperator = ChainMapOperator;
function chainMap(chainFunc) {
    return this.lift(new ChainMapOperator(chainFunc));
}
exports.chainMap = chainMap;
