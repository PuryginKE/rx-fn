import { Observable, BehaviorSubject, Subject } from 'rxjs';
interface RequestObjectConstructor {
    <T>(fn: () => Observable<T>): RxFn<T, any[]>;
    <T, Args extends Array<any>>(fn: (...args: Args) => Observable<T>): RxFn<T, Args>;
    <T, Arg extends any>(fn: (arg: Arg) => Observable<T>): RxFn<T, [Arg]>;
    new <T>(fn: () => Observable<T>): RxFn<T, any[]>;
    new <T, Args extends Array<any>>(fn: (...args: Args) => Observable<T>): RxFn<T, Args>;
    new <T, Arg extends any>(fn: (arg: Arg) => Observable<T>): RxFn<T, [Arg]>;
    readonly prototype: RxFn<any, any>;
}
export interface RxFn<T, P extends Array<any>> {
    isLoading$: BehaviorSubject<any>;
    firstLoading$: BehaviorSubject<any>;
    errorHandler$: Subject<any>;
    store$: Observable<T>;
    get$: Observable<T>;
    getValue: () => T;
    setValue: (value: T) => void;
    setParams: (...params: P) => void;
    (...params: P): Observable<T>;
}
export declare const RxFn: RequestObjectConstructor;
export {};
