import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  addToCart(item: CartItem): void {
    const items = [...this.cartItems.value];
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ ...item, quantity: 1 });
    }
    this.cartItems.next(items);
  }

  removeFromCart(id: number): void {
    const filtered = this.cartItems.value.filter(i => i.id !== id);
    this.cartItems.next(filtered);
  }

  clearCart(): void {
    this.cartItems.next([]);
  }

  getItems(): CartItem[] {
    return this.cartItems.value;
  }
}
