import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  finalize,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
} from 'rxjs';

/**
 * Main service for manage loading
 * @constructor */
@Injectable({
  providedIn: 'root',
})
export class NgxSmartLoadingService implements OnDestroy {
  /**
   * The loader is tracked by default
   */
  private _defaultLoader = new BehaviorSubject(false);
  /**
   * All incomplete loaders added to the service
   */
  private _loaders: Observable<boolean>[] = [];
  /**
   * Subscription on multiplexing loaders
   */
  private _subscription: Subscription = new Subscription();

  constructor() {
    this.observeDefaultLoaderWithStack();
  }

  /**
   * This subject contains summary information about whether
   * all loaders have finished loading in the {@link NgxSmartLoadingService._loaders} variable
   */
  private _isLoading$ = new BehaviorSubject(false);

  /**
   * This observable contains summary information about loading {@link NgxSmartLoadingService._isFetching$}
   */
  get isLoading$(): Observable<boolean> {
    return this._isLoading$.asObservable();
  }

  /**
   * This value contains summary information about loading {@link NgxSmartLoadingService._isFetching$}
   */
  get isLoading(): boolean {
    return this._isLoading$.value;
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  /**
   * Tell the default download that a new download has started*/
  startLoading(): void {
    this._defaultLoader.next(true);
  }

  /**
   * Tell the default download that some download has ended*/
  stopLoading(): void {
    this._defaultLoader.next(false);
  }

  /**
   * Can use for wrapping requests
   * It is important that the passed observable
   * is completed otherwise the download status will not stop
   */
  wrapObservable<T>(obs$: Observable<T>): Observable<T> {
    return of(1)
      .pipe(
        switchMap(() => {
          this.startLoading();
          return obs$;
        }),
      )
      .pipe(finalize(() => this.stopLoading()));
  }

  /**
   * Changing the output state of the loader based on the stack.
   * It gives the behavior of the loader, which will say that the download
   * stopped only when the input values of false will be exactly as many as there were true values*/
  addStackToLoader(loader: Observable<boolean>): Observable<boolean> {
    let loadersCount = 0;
    return loader.pipe(
      map((isLoading) => {
        if (isLoading) {
          ++loadersCount;
        } else {
          loadersCount = loadersCount ? loadersCount - 1 : 0;
        }
        return loadersCount > 0;
      }),
    );
  }

  addLoaderForMultiplexing(newLoader: Observable<boolean>): void {
    this._loaders.push(newLoader);
    this.multiplexLoaders();
  }

  /**
   * Makes it possible to use the default
   * loader for multiple downloads thanks to the stack */
  private observeDefaultLoaderWithStack() {
    this.addLoaderForMultiplexing(this.addStackToLoader(this._defaultLoader));
  }

  private multiplexLoaders(): void {
    this._subscription.unsubscribe();
    this._subscription = combineLatest(this._loaders).subscribe((result) => {
      if (result.every((item) => !item)) {
        this._isLoading$.next(false);
      } else {
        this._isLoading$.next(true);
      }
    });
  }
}
