import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { NgxSmartLoadingService } from './ngx-smart-loading.service';
import {
  BehaviorSubject,
  delay,
  last,
  Observable,
  of,
  Subject,
  Subscription,
} from 'rxjs';
import Spy = jasmine.Spy;

describe('NgxSmartLoadingService', () => {
  let service: NgxSmartLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgxSmartLoadingService],
    });
    service = TestBed.inject(NgxSmartLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('test startLoading fn', () => {
    it('should set true in default loader', () => {
      service.startLoading();
      expect(service['_defaultLoader'].value).toBeTrue();
    });
    it('should change resulting loading state', () => {
      service.startLoading();
      expect(service.isLoading).toBeTrue();
    });
  });

  describe('test stopLoading fn', () => {
    it('should set false in default loader where now set true', () => {
      service.startLoading();
      service.stopLoading();
      expect(service['_defaultLoader'].value).toBeFalse();
    });
    it('should change resulting loading state to false where now set true', () => {
      service.startLoading();
      service.stopLoading();
      expect(service.isLoading).toBeFalse();
    });
    it('should not stop loading when before startLoading was called 2 times', () => {
      service.startLoading();
      service.startLoading();
      service.stopLoading();
      expect(service.isLoading).toBeTrue();
    });
    it('should stop loading when startLoading has been called as many times as stopLoading', () => {
      service.startLoading();
      service.startLoading();
      service.stopLoading();
      service.stopLoading();
      expect(service.isLoading).toBeFalse();
    });
  });

  describe('test wrapObservable fn', () => {
    let requestStab: Observable<number>;
    let wrappedRequest: Observable<number>;
    beforeEach(() => {
      requestStab = of(1).pipe(delay(1000));
      wrappedRequest = service.wrapObservable(requestStab);
    });
    it('should not change resulting loading state while Observable not executed', () => {
      expect(service.isLoading).toBeFalse();
    });
    it('should change resulting loading state to true while wrapped Observable not completed', fakeAsync(() => {
      wrappedRequest.subscribe();
      tick(500);
      expect(service.isLoading).toBeTrue();
      tick(500);
    }));
    it('should change resulting loading state to false after wrapped Observable completed', fakeAsync(() => {
      wrappedRequest.subscribe();
      tick(1000);
      expect(service.isLoading).toBeFalse();
    }));
  });

  describe('test addStackToLoader fn', () => {
    let loader: Subject<boolean>;
    let loaderWithStack: Observable<boolean>;
    beforeEach(() => {
      loader = new Subject<boolean>();
      loaderWithStack = service.addStackToLoader(loader);
    });
    it('should not stop loading in loader when to loader set more true value then false', () => {
      loader.next(true);
      loader.next(true);
      loader.next(false);
      loaderWithStack.pipe(last()).subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });
    });
    it('should stop loading in loader when to loader set more false value then true', () => {
      loader.next(true);
      loader.next(false);
      loader.next(false);
      loaderWithStack.pipe(last()).subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });
    });
    it('should stop loading in loader when to loader set true as many times as false', () => {
      loader.next(true);
      loader.next(true);
      loader.next(false);
      loader.next(false);
      loaderWithStack.pipe(last()).subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });
    });
  });

  describe('test addLoaderForMultiplexing fn', () => {
    let loader: Subject<boolean>;
    beforeEach(() => {
      loader = new Subject<boolean>();
    });

    it('should add loader to array loaders', () => {
      service.addLoaderForMultiplexing(loader);
      expect(service['_loaders'].includes(loader)).toBeTruthy();
    });
    it('should call addLoaderForMultiplexing', () => {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const spyMultiplexLoaders = spyOn<any>(
        service,
        'multiplexLoaders',
      ).and.returnValue(undefined);
      service.addLoaderForMultiplexing(loader);
      expect(spyMultiplexLoaders).toHaveBeenCalled();
    });
  });

  describe('test observeDefaultLoaderWithStack fn', () => {
    beforeEach(() => {
      spyOn(service, 'addStackToLoader');
      spyOn(service, 'addLoaderForMultiplexing');
    });
    it('should add loader stack to default loader ', () => {
      const _defaultLoader = new BehaviorSubject(false);
      service['_defaultLoader'] = _defaultLoader;
      service['observeDefaultLoaderWithStack']();
      expect(service.addStackToLoader).toHaveBeenCalledWith(_defaultLoader);
    });

    it('should call addLoaderForMultiplexing with defaultLoader with stack ', () => {
      service['observeDefaultLoaderWithStack']();
      expect(service.addLoaderForMultiplexing).toHaveBeenCalledWith(
        (service.addStackToLoader as Spy).calls.mostRecent().returnValue,
      );
    });
  });

  describe('test multiplexLoaders fn', () => {
    it('should unsubscribe from prev subscription on loaders', () => {
      const spyOnSub = (service['_subscription'] = new Subscription());
      service['multiplexLoaders']();
      expect(spyOnSub.closed).toBeTrue();
    });

    it('should save new subscription on loaders', () => {
      expect(service['_subscription']['_finalizers'].length).toBe(1);
      service['multiplexLoaders']();
    });

    it('should set true to resulting loading state when some loader has true value', () => {
      const loaderWithTrue = new BehaviorSubject<boolean>(true);
      const loaderWithFalse = new BehaviorSubject<boolean>(false);
      service.addLoaderForMultiplexing(loaderWithTrue);
      expect(service.isLoading).toBeTrue();
      service.addLoaderForMultiplexing(loaderWithFalse);
      expect(service.isLoading).toBeTrue();
    });

    it('should set false to resulting loading state when all loaders change value to false', () => {
      const loader = new BehaviorSubject<boolean>(true);
      service.addLoaderForMultiplexing(loader);
      loader.next(false);
      expect(service.isLoading).toBeFalse();
    });

    it('should not stop to observe loaders when some loader complete', () => {
      const loader = new BehaviorSubject<boolean>(true);
      service.addLoaderForMultiplexing(loader);
      loader.complete();
      expect(service['_subscription'].closed).toBeFalse();
    });
  });
});
