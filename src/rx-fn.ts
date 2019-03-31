import { catchError, filter, finalize } from 'rxjs/operators';
import { Observable, BehaviorSubject, throwError, Subject } from 'rxjs';

function RxFn<T, Args extends Array<any>>(fn: (...args: Args) => Observable<T>): RxFnModel<T, Args> {
  this.isLoading$ = new BehaviorSubject(null);
  this.errorHandler$ = new Subject();
  this.firstLoaing$ = new BehaviorSubject(null);

  let _countSubscribers = 0;
  let _countSubscribersStore = 0;

  const _store$ = new BehaviorSubject(null);
  const _firstLoadingSubscriber = this.isLoading$.subscribe((bool: boolean) => {
    this.firstLoaing$.next(bool);
    if (bool === false) {
      _firstLoadingSubscriber.unsubscribe();
      this.firstLoaing$.complete();
    }
  });

  this.getValue = (): T => _store$.getValue();
  this.setValue = (value: T): void => _store$.next(value);

  function func(...params: Args): BehaviorSubject<T> {
    this.setParams(...params);
    this.get$.subscribe((data: T) => {
      _store$.next(data);
    });

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
      }
    };
  });

  this.setParams = (...params: Args): void => {
    const request = new Observable<T>((subscriber) => {
      debugger
      this.isLoading$.next(true);
      const subscription = fn(...params).subscribe(subscriber);
      _countSubscribers++;
      return () => {
        this.isLoading$.next(false);
        subscription.unsubscribe();
        _countSubscribers--;
        if (_countSubscribers === 0) {
          this.isLoading$.next(null);
          this.firstLoaing$.next(null);
        }
      };
    });

    this.get$ = request.pipe(
      catchError((e) => {
        this.isLoading$.next(e);
        this.errorHandler$.next(e);
        return throwError(e);
      }),
      finalize(() => {
        this.isLoading$.next(false);
      })
    );
  };

  if (!(this instanceof RxFn)) {
    return new (<RequestObjectConstructor>RxFn)(fn);
  }

  return Object.assign(func.bind(this), this);
};

interface RequestObjectConstructor {
  <T, Args extends Array<any>>(fn: (...args: Args) => Observable<T>): RxFnModel<T, Args>;
  <T, Arg>(fn: (arg: Arg) => Observable<T>): RxFnModel<T, [Arg]>;
  <T>(fn: () => Observable<T>): RxFnModel<T, null>;
  new <T, Args extends Array<any>>(fn: (...args: Args) => Observable<T>): RxFnModel<T, Args>;
  new <T, Arg>(fn: (arg: Arg) => Observable<T>): RxFnModel<T, [Arg]>;
  new <T>(fn: () => Observable<T>): RxFnModel<T, null>;
  readonly prototype: RxFnModel<any, any>;
}

interface RxFnModel<T, P extends Array<any>> {
  isLoading$: BehaviorSubject<any>;
  firstLoaing$: BehaviorSubject<any>;
  errorHandler$: Subject<any>;
  store$: Observable<T>;
  get$: Observable<T>;
  getValue: () => T;
  setValue: (value: T) => void;
  setParams: (...params: P) => void;
  (...params: P): Observable<T>;
}

export default RxFn as RequestObjectConstructor;
