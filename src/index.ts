import { catchError, filter, finalize, tap, takeUntil } from 'rxjs/operators';
import { Observable, BehaviorSubject, throwError, Subject } from 'rxjs';

function rxFn<T, Args extends Array<any>>(fn: (...args: Args) => Observable<T>): RxFn<T, Args> {
  this.isLoading$ = new BehaviorSubject(null);
  this.errorHandler$ = new Subject();
  this.firstLoading$ = new BehaviorSubject(null);

  let _countSubscribers = 0;
  let _countSubscribersStore = 0;
  let _params: Args;

  const _store$ = new BehaviorSubject(null);
  const _destroy$ = new Subject();
  const _firstLoadingSubscriber = this.isLoading$.subscribe((bool: boolean) => {
    this.firstLoading$.next(bool);
    if (bool === false) {
      _firstLoadingSubscriber.unsubscribe();
      this.firstLoading$.complete();
    }
  });
  const _request = new Observable<T>((subscriber) => {
    this.isLoading$.next(true);
    const subscription = fn(..._params).pipe(takeUntil(_destroy$)).subscribe(subscriber);
    _countSubscribers++;
    return () => {
      this.isLoading$.next(false);
      subscription.unsubscribe();
      _countSubscribers--;
      if (_countSubscribers === 0) {
        this.isLoading$.next(null);
        this.firstLoading$.next(null);
      }
    };
  });

  this.getValue = (): T => _store$.getValue();
  this.setValue = (value: T): void => _store$.next(value);

  function func(...params: Args): BehaviorSubject<T> {
    this.setParams(...params);
    this.get$.subscribe();

    return this.store$;
  };

  this.store$ = new Observable<T>((subscriber) => {
    const subscription = _store$.asObservable().pipe(filter(item => item !== null)).subscribe(subscriber);
    _countSubscribersStore++;
    return () => {
      subscription.unsubscribe();
      _countSubscribersStore--;
      if (_countSubscribersStore === 0) {
        _store$.next(null);
        _destroy$.next();
        _destroy$.complete();
      }
    };
  });

  this.get$ = _request.pipe(
    catchError((e) => {
      this.isLoading$.next(e);
      this.errorHandler$.next(e);
      return throwError(e);
    }),
    finalize(() => {
      this.isLoading$.next(false);
    }),
    tap((data) => {
      if (_countSubscribersStore) {
        _store$.next(data);
      }
    })
  );

  this.setParams = (...params: Args): void => {
    _params = params;
  };

  if (!(this instanceof rxFn)) {
    return new (<RequestObjectConstructor>rxFn)(fn);
  }

  return Object.assign(func.bind(this), this);
}

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

export const RxFn = (rxFn as RequestObjectConstructor);
