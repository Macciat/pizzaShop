import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { IonicModule, MenuController, AlertController } from '@ionic/angular';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SupabaseService } from './services/supabase';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, RouterModule, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit {
  private menu = inject(MenuController);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private alertCtrl = inject(AlertController);

  public isLoggedIn = false;
  public userData: any = null;

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) this.menu.close();
    });
  }

  async ngOnInit() {
    const { data } = await this.supabaseService.client.auth.getSession();
    this.isLoggedIn = !!data.session;
    this.userData = data.session;

    this.supabaseService.client.auth.onAuthStateChange((_event, session) => {
      this.isLoggedIn = !!session;
      this.userData = session;
    });
  }

  async logout() {
    await this.supabaseService.client.auth.signOut();
    this.isLoggedIn = false;
    this.userData = null;

    const alert = await this.alertCtrl.create({
      header: 'Logged Out',
      message: 'You have been logged out successfully.',
      buttons: ['OK'],
    });

    await alert.present();
    this.router.navigateByUrl('/login');
  }
}
