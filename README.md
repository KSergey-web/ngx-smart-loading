# LoaderWorkspace

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.1.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

# State loading tracking

Source https://github.com/KSergey-web/ngx-smart-loading

## Compatibility with Angular Versions

<table>
  <thead>
    <tr>
      <th>ngx-smart-loading</th>
      <th>Angular</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        1.x
      </td>
      <td>
        >= 13.3.1
      </td>
    </tr>
  </tbody>
</table>

## Table of contents

- [Setup](#setup)
- [Wrap some request](#wrap-some-request)
- [Manually changing the download status](#manually-changing-the-download-status)
- [Own observable for tracking download status](#own-observable-for-tracking-download-status)
- [Multiple instances of the service](#multiple-instances-of-the-service)

## Setup

```bash
npm i ngx-smart-loading
```

## Wrap some request

You can wrap some Observable to find out the status of its execution. The execution status can be obtained from the `ngxSmartLoadingService.isLoading$`.

```ts
import { NgxSmartLoadingService } from "ngx-smart-loading";
import { HttpClient } from "@angular/common/http";

@Component()
export class SomeComponent {
  constructor(
    private http: HttpClient,
    private ngxSmartLoadingService: NgxSmartLoadingService,
  ) {
    this.ngxSmartLoadingService.wrapObservable(this.http.get("SOME_URL")).subscribe();
  }

  isLoading$ = this.ngxSmartLoadingService.isLoading$;
}
```

Value in `ngxSmartLoadingService.isLoading$` will become true when subscription to observable occurs and then will become false when observable complete.

## Manually changing the download status

You can change status of loading by call `startLoading` and `stopLoading`.

```ts
import { NgxSmartLoadingService } from "ngx-smart-loading";
import { HttpClient } from "@angular/common/http";

@Component()
export class SomeComponent {
  constructor(
    private http: HttpClient,
    private ngxSmartLoadingService: NgxSmartLoadingService,
  ) {
    this.ngxSmartLoadingService.startLoading();
    this.ngxSmartLoadingService.wrapObservable(http.get("SOME_URL")).subscribe(() => {
      this.ngxSmartLoadingService.stopLoading();
    });
  }

  isLoading$ = this.ngxSmartLoadingService.isLoading$;
}
```

It is important that the number of `stopLoading ` calls is the same as `startLoading ` . Otherwise, it will mean that some of the requests have not completed yet and `isLoading$` will be `true`.

## Own observable for tracking download status

You can create your own BehaviorSubjects that monitor the download status and register them in the service to get a final value that will tell you whether there is at least some download going on or not.

```ts
import { NgxSmartLoadingService } from "ngx-smart-loading";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";

@Component()
export class SomeComponent {
  loader1 = new BehaviorSubject(true);

  constructor(
    private http: HttpClient,
    private ngxSmartLoadingService: NgxSmartLoadingService,
  ) {
    //registering a loader1
    this.ngxSmartLoadingService.addLoaderForMultiplexing(this.loader1);
    const loader2 = new BehaviorSubject(false);
    ////registering a loader2
    this.ngxSmartLoadingService.addLoaderForMultiplexing(loader2);
    loader2.next(true);
    this.ngxSmartLoadingService.wrapObservable(this.http.get("SOME_URL")).subscribe(() => {
      loader2.next(false); // now isLoading$ still true because loader1 is currently set to true
      this.loader1.next(false); // now isLoading$ is false
    });
  }

  isLoading$ = this.ngxSmartLoadingService.isLoading$;
}
```

## Multiple instances of the service

In the case where you need to display two independent spinners on a page, you can encapsulate the visibility of the service at the component level where the spinner should be shown.
In the following example, `SomeComponent1` and `SomeComponent2` will have their own NgxSmartLoadingService instances and changing the state of one service does not change the state of the other in any way

```ts
import { NgxSmartLoadingService } from "ngx-smart-loading";

@Component({
  providers: [NgxSmartLoadingService],
})
export class SomeComponent1 {
  constructor(private ngxSmartLoadingService: NgxSmartLoadingService) {}

  isLoading$ = this.ngxSmartLoadingService.isLoading$;
}

@Component({
  providers: [NgxSmartLoadingService],
})
export class SomeComponent2 {
  constructor(private ngxSmartLoadingService: NgxSmartLoadingService) {}

  isLoading$ = this.ngxSmartLoadingService.isLoading$;
}
```
