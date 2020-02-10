import { catchError, filter, finalize, tap, takeUntil } from 'rxjs/operators';
import { Observable, BehaviorSubject, throwError, Subject } from 'rxjs';
function rxFn(fn) {
    var _this = this;
    this.isLoading$ = new BehaviorSubject(null);
    this.errorHandler$ = new Subject();
    this.firstLoading$ = new BehaviorSubject(null);
    var _countSubscribers = 0;
    var _countSubscribersStore = 0;
    var _params;
    var _store$ = new BehaviorSubject(null);
    var _destroy$ = new Subject();
    var _firstLoadingSubscriber = this.isLoading$.subscribe(function (bool) {
        _this.firstLoading$.next(bool);
        if (bool === false) {
            _firstLoadingSubscriber.unsubscribe();
            _this.firstLoading$.complete();
        }
    });
    var _request = new Observable(function (subscriber) {
        _this.isLoading$.next(true);
        var subscription = fn.apply(void 0, _params).pipe(takeUntil(_destroy$)).subscribe(subscriber);
        _countSubscribers++;
        return function () {
            _this.isLoading$.next(false);
            subscription.unsubscribe();
            _countSubscribers--;
            if (_countSubscribers === 0) {
                _this.isLoading$.next(null);
                _this.firstLoading$.next(null);
            }
        };
    });
    this.getValue = function () { return _store$.getValue(); };
    this.setValue = function (value) { return _store$.next(value); };
    function func() {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        this.setParams.apply(this, params);
        this.get$.subscribe();
        return this.store$;
    }
    ;
    this.store$ = new Observable(function (subscriber) {
        var subscription = _store$.asObservable().pipe(filter(function (item) { return item !== null; })).subscribe(subscriber);
        _countSubscribersStore++;
        return function () {
            subscription.unsubscribe();
            _countSubscribersStore--;
            if (_countSubscribersStore === 0) {
                _store$.next(null);
                _destroy$.next();
                _destroy$.complete();
            }
        };
    });
    this.get$ = _request.pipe(catchError(function (e) {
        _this.isLoading$.next(e);
        _this.errorHandler$.next(e);
        return throwError(e);
    }), finalize(function () {
        _this.isLoading$.next(false);
    }), tap(function (data) {
        if (_countSubscribersStore) {
            _store$.next(data);
        }
    }));
    this.setParams = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        _params = params;
    };
    if (!(this instanceof rxFn)) {
        return new rxFn(fn);
    }
    return Object.assign(func.bind(this), this);
}
export var RxFn = rxFn;
