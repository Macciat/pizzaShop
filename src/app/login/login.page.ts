import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  AlertController,
  LoadingController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginPage {
  email = '';
  password = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async login() {
    if (!this.email || !this.password) {
      this.showAlert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Logging in...',
    });
    await loading.present();

    try {
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      });

      if (error) throw error;

      await loading.dismiss();
      window.dispatchEvent(new Event('supabase-auth-changed'));

      this.showAlert('Welcome', 'Login successful!');
      this.router.navigateByUrl('/menu', { replaceUrl: true });

    } catch (err: any) {
      await loading.dismiss();
      const message = this.mapError(err.message);
      this.showAlert('Login Failed', message);
    }
  }

  mapError(message: string): string {
    if (message.includes('Invalid login credentials')) {
      return 'Incorrect email or password.';
    }
    if (message.includes('Missing email')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('disabled')) {
      return 'This sign-in method is not available right now.';
    }
    return message;
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message,
      cssClass: 'custom-alert',
      buttons: ['OK'],
    });
    await alert.present();
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }
}
