import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSmartLoadingService } from 'ngx-smart-loading';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgOptimizedImage],
  providers: [NgxSmartLoadingService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private loaderService: NgxSmartLoadingService = inject(
    NgxSmartLoadingService,
  );

  isLoading = toSignal(this.loaderService.isLoading$);

  startLoading() {
    this.loaderService.startLoading();
  }

  stopLoading() {
    this.loaderService.stopLoading();
  }
}
