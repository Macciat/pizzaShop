import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class CartPage implements OnInit {
  cartItems: any[] = [];
  userId: string | null = null;
  deliveryFee: number = 50;
  paymentMethod: string = 'cod';

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  async ionViewWillEnter() {
    await this.loadCart();
  }

  async loadUser() {
    const { data: sessionData, error: sessionError } = await this.supabase.client.auth.getSession();
    if (sessionError) return;
    this.userId = sessionData?.session?.user?.id ?? null;
  }

  async loadCart() {
    if (!this.userId) await this.loadUser();
    if (!this.userId) return;

    const { data, error } = await this.supabase.client
      .from('cart')
      .select(`
        id,
        quantity,
        added_at,
        menu_items:menu_item_id ( id, name, price, description, image_url ),
        promos:promo_id ( id, name, price, description, image_url )
      `)
      .eq('user_id', this.userId);

    if (error) return;

    this.cartItems = (data || []).map((row: any) => {
      const item = row.menu_items || row.promos;
      return {
        id: row.id,
        quantity: row.quantity,
        name: item?.name ?? 'Unknown Item',
        price: item?.price ?? 0,
        description: item?.description ?? '',
        image_url: item?.image_url ?? '',
        menu_item_id: row.menu_items?.id ?? null,
        promo_id: row.promos?.id ?? null,
      };
    });
  }

  getTotal() {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  async addToCart(item: any) {
    if (!this.userId) return;

    const { data: existingItem } = await this.supabase.client
      .from('cart')
      .select('id, quantity')
      .eq('user_id', this.userId)
      .eq(item.promo_id ? 'promo_id' : 'menu_item_id', item.promo_id || item.menu_item_id)
      .maybeSingle();

    if (existingItem) {
      await this.supabase.client
        .from('cart')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);
    } else {
      await this.supabase.client.from('cart').insert({
        user_id: this.userId,
        menu_item_id: item.menu_item_id,
        promo_id: item.promo_id,
        quantity: 1,
      });
    }

    await this.loadCart();
  }

  async removeFromCart(cartId: string) {
    await this.supabase.client.from('cart').delete().eq('id', cartId);
    await this.loadCart();
  }

  async checkout() {
    const total = this.getTotal() + this.getTotal() * 0.12 + this.deliveryFee;
    const alert = await this.alertCtrl.create({
      header: 'Confirm Order',
      message: `
        <strong>Total:</strong> ₱${total.toFixed(2)}<br>
        <strong>Payment:</strong> ${this.paymentMethod.toUpperCase()}
      `,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
