import { Component, ViewChild } from '@angular/core';
import { AuthService } from './services/auth.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'HeartBridge - Connecting Hearts Through Kindness';
  // Reference to the sidenav defined in the template (#sidenav)
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(public authService: AuthService) {}
}

