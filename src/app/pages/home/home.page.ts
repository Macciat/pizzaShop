import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';

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

  featuredProducts = [
    { id: 'p1', image: 'assets/images/products/p1.jpg', name: 'Pepperoni Duo', price: 549 },
    { id: 'p2', image: 'assets/images/products/p2.jpg', name: 'Cheesy Combo', price: 499 },
    { id: 'p3', image: 'assets/images/products/p3.jpg', name: 'Hawaiian Pizza', price: 309 },
    { id: 'p4', image: 'assets/images/products/p4.jpg', name: 'Margherita', price: 279 },
    { id: 'p5', image: 'assets/images/products/p5.jpg', name: 'BBQ Chicken', price: 359 },
    { id: 'p6', image: 'assets/images/products/p6.jpg', name: 'Veggie Delight', price: 269 },
    { id: 'p7', image: 'assets/images/products/p7.jpg', name: 'Meat Lovers', price: 389 },
    { id: 'p8', image: 'assets/images/products/p8.jpg', name: 'Four Cheese', price: 329 },
    { id: 'p9', image: 'assets/images/products/p9.jpg', name: 'Spicy Italian', price: 349 },
    { id: 'p10', image: 'assets/images/products/p10.jpg', name: 'Garlic Bread', price: 129 },
    { id: 'p11', image: 'assets/images/products/p11.jpg', name: 'Potato Wedges', price: 119 },
    { id: 'p12', image: 'assets/images/products/p12.jpg', name: 'Chocolate Brownie', price: 99 }
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  onSlideClick(slide: any) {
    this.router.navigateByUrl(slide.link);
  }

  navigateTo(link: string) {
    this.router.navigateByUrl(link);
  }
}
