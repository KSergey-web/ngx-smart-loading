import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSmartLoadingComponent } from "ngx-smart-loading";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSmartLoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'demo';
}
