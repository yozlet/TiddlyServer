import { Observable, Subject, Operator, Subscriber, Subscription } from '../rx';

function obsTruthy<T>(a: T | undefined | null | false | "" | 0 | void): a is T {
    return !!a;
}
type ChainFunction<T, R> = (item: T) => (Observable<R> | void);
export class ChainMapOperator<T, R> implements Operator<T, Observable<R>> {

    stack: Error;
    defInput: Subject<T>;
    inputs: { [K: string]: Subject<T> };
    outputs: Observable<R>[];
    keys: string[];

    /**
     * 
     * @param selector A function that returns a string specifying the route to use.
     * If there is no route for that string, the item is sent to defaultRoute instead.
     * @param routes A hashmap of routes.
     * @param defaultRoute The route used if the string returned by selector is not a
     * property of routes.
     */
    constructor(
        private chain: ChainFunction<T, R>
    ) {

    }
    static isObservable<T>(obj: any): obj is Observable<T> {
        return typeof obj === "object" && obj instanceof Observable;
    }

    call(subs: Subscriber<Observable<R>>, source: any) {
        return (source as Observable<T>)
            .map(this.chain)
            .filter(obsTruthy)
            .filter(ChainMapOperator.isObservable)
            .subscribe(subs);
    }

}
export function chainMap<T, R>(this: Observable<T>, chainFunc: ChainFunction<T, R>) {
    return this.lift(new ChainMapOperator<T, R>(chainFunc));
}
declare module 'rxjs/Observable' {
    interface Observable<T> {
        chainMap: typeof chainMap;
    }
}