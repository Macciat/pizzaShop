import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { SupabaseService } from '../../services/supabase';

register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage implements OnInit {
  slides = [
    { image: 'assets/images/slide1.jpeg', link: '/menu' },
    { image: 'assets/images/slide2.jpeg', link: '/about' },
    { image: 'assets/images/slide3.jpeg', link: '/cart' }
  ];

  quickMenu = [
    { image: 'assets/images/promo1.png', title: 'Best Sellers', tagline: 'Fan favorites you can’t miss.', link: '/menu?category=best-sellers' },
    { image: 'assets/images/promo5.png', title: 'Family Feast', tagline: 'Big meals for big moments.', link: '/menu?category=family' },
    { image: 'assets/images/promo6.png', title: 'Weekend Promo', tagline: 'Exclusive offers every weekend.', link: '/promos' }
  ];

  featuredProducts: any[] = [];

  constructor(
    private router: Router,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    await this.loadFeaturedProducts();
  }

  async loadFeaturedProducts() {
    try {
      const { data, error } = await this.supabase.client
        .from('menu_items')
        .select('*')
        .limit(10);

      if (error) {
        console.error('Supabase error:', error);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No menu items found');
        return;
      }
      this.featuredProducts = data;

      console.log('HOME PAGE LOADED — IMAGES READY:', this.featuredProducts);

    } catch (err) {
      console.error('LOAD FAILED:', err);
    }
  }

  onSlideClick(slide: any) {
    this.router.navigateByUrl(slide.link);
  }

  navigateTo(link: string) {
    this.router.navigateByUrl(link);
  }
}