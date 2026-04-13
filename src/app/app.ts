import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: [':host { display: block; min-height: 100dvh; background: #f5f5f5; width: 100% }'],
})
export class App {}
