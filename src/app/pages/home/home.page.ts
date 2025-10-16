import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { register } from 'swiper/element/bundle'; 

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

  constructor() {}

  ngOnInit() {}

  onSlideClick(slide: any) {
    console.log('Clicked slide:', slide);
  }
}
