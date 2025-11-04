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
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RegisterPage {
  full_name = '';
  email = '';
  password = '';
  address = '';
  phone_number = '';
  provider_type = 'email';

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async register() {
    if (!this.full_name || !this.email || !this.password) {
      this.showAlert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Registering...',
    });
    await loading.present();

    try {
      const { data, error } = await this.supabase.client.auth.signUp({
        email: this.email,
        password: this.password,
        options: {
          data: {
            display_name: this.full_name,
            phone: this.phone_number,
            provider_type: this.provider_type,
          },
        },
      });

      if (error) throw error;

      await this.supabase.client.from('users').insert([
        {
          id: data.user?.id,
          email: this.email,
          full_name: this.full_name,
          address: this.address,
          phone_number: this.phone_number,
          profile_image: 'default_profile.png',
          provider_type: this.provider_type,
        },
      ]);

      await loading.dismiss();
      this.showAlert('Success', 'Account created successfully!');
      this.router.navigateByUrl('/login');

    } catch (err: any) {
      await loading.dismiss();
      const message = this.mapError(err.message);
      this.showAlert('Registration Failed', message);
    }
  }

  mapError(message: string): string {
    if (message.includes('User already registered')) {
      return 'This email is already registered.';
    }
    if (message.includes('Missing email')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('disabled')) {
      return 'This sign-up method is not available right now.';
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

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
