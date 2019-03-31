# RxFn
The wrap object for RxJS observables help you to reduce similar constructions of store and don't think to control loading state. For handling errors the wrap consist error subject channel that also control loading state. With the aim of understanding best review using RxJS store with RxFn
![rxfn](https://user-images.githubusercontent.com/20255399/55286351-5c9bcd80-53a3-11e9-9d71-a3cb451b6b92.png)
## Getting Started
Install the package in your project with rxjs

    npm install rx-fn --save

Import class RxFn

    import RxFn from '../rx-fn/rx-fn';

Create RxFn object from function with return type observable

    public rxFn = new RxFn<TYPE_DATA, Parameters<FUNCTION>>(FUNCTION);

## Example
For example, consider getting data by get-request and creating RxFn object

	public getData = new RxFn<any[], [string, number]>(this._getData);

	private _getData(catalog: string, page?: number): Observable<any[]> {
	  this.http.get<any[]>(`.../${catalog}/${page}`);
    }


After `getData` has follow interface:

    interface  RxFn<any[], [string, number]> {
      isLoading$:  BehaviorSubject<boolean>;
      firstLoaing$:  BehaviorSubject<boolean>;
      errorHandler$:  Subject<any>;
      store$:  Observable<any[]>;
      get$:  Observable<any[]>;
      getValue: () =>  any[];
      setValue: (value:  any[]) =>  void;
      setParams: (...params:  [string, number]) =>  void;
      (...params:  [string, number]):  Observable<any[]>;
    }
Let's look at the last function in the getting interface. When we call it as:

	this.getData('history', 13);

The function is a wrapper function for `_getData` that is called with entered params.  Then RxFn observe request, switch loading state to `true` and wait complete request, next depending on the result to switch loading, error and etc. channels.

P.S. `get$` and `setParams` needed for if your case don't required creating store and you want get loading and error state of request

    this.getData.setParams('history', 13)
    this.getData.get$.subscribe(...)

