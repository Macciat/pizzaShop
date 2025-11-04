import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonMenuButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonMenuButton,
    IonIcon,
    RouterModule,
  ],
})
export class NavbarComponent implements OnDestroy {
  isLoggedIn = false;
  private unsubscribeFn?: () => void;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initAuthState();

    window.addEventListener('supabase-auth-changed', () => {
      this.checkSession();
    });
  }

  private async initAuthState() {
    await this.checkSession();

    try {
      const { data: listener } = this.supabase.client.auth.onAuthStateChange(
        (_event, session) => {
          this.isLoggedIn = !!session;
          console.log('Auth event:', _event, 'Session exists:', this.isLoggedIn);
          this.cdr.detectChanges(); 
        }
      );
      this.unsubscribeFn = listener.subscription.unsubscribe;
    } catch (err) {
      console.error('Auth listener error:', err);
    }
  }

  private async checkSession() {
    try {
      const { data } = await this.supabase.client.auth.getSession();
      this.isLoggedIn = !!data.session;
      console.log('Navbar updated, logged in:', this.isLoggedIn);
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error checking session:', err);
      this.isLoggedIn = false;
    }
  }

  async onAuthClick() {
    if (this.isLoggedIn) {
      try {
        await this.supabase.client.auth.signOut();
        this.isLoggedIn = false;
        window.dispatchEvent(new Event('supabase-auth-changed'));
        this.router.navigateByUrl('/home');
        this.cdr.detectChanges();
      } catch (err) {
        console.error('Logout error:', err);
      }
    } else {
      this.router.navigateByUrl('/login');
    }
  }
  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy() {
    if (this.unsubscribeFn) this.unsubscribeFn();
    window.removeEventListener('supabase-auth-changed', () => {
      this.checkSession();
    });
  }
}
