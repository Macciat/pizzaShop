import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject, OnDestroy } from '@angular/core';
import { IonicModule, MenuController, AlertController, ModalController } from '@ionic/angular';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SupabaseService } from './services/supabase';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from './services/cart.service';
import { RealtimeChannel } from '@supabase/supabase-js';

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule],
  selector: 'orders-modal',
  template: `
    <ion-header>
      <ion-toolbar color="danger">
        <ion-title>Your Orders</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list *ngIf="orders.length > 0; else empty">
        <ion-item *ngFor="let order of orders">
          <ion-label>
            <h2>Order #{{ order.id }}</h2>
            <p>{{ order.created_at | date:'medium' }}</p>
            <p><strong>Status:</strong> <ion-badge [color]="getStatusColor(order.status)">{{ order.status | uppercase }}</ion-badge></p>
            <p><strong>Total:</strong> ₱{{ order.total_amount | number:'1.2-2' }}</p>
            <p><strong>Items:</strong></p>
            <ion-list>
              <ion-item *ngFor="let item of order.order_items">
                <ion-label class="ion-text-wrap">
                  {{ item.quantity }}× {{ item.menu_items?.name || item.promos?.name || 'Unknown Item' }}
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-label>
        </ion-item>
      </ion-list>
      <ng-template #empty>
        <div class="ion-text-center" style="padding: 3rem;">
          <ion-icon name="receipt-outline" size="large" color="medium"></ion-icon>
          <p>No orders yet</p>
        </div>
      </ng-template>
    </ion-content>
  `,
})
export class OrdersModalComponent {
  orders: any[] = [];
  private modalCtrl = inject(ModalController);

  getStatusColor(status: string): string {
    return status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'medium';
  }

  async close() { await this.modalCtrl.dismiss(); }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, RouterModule, NavbarComponent, CommonModule, OrdersModalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit, OnDestroy {
  private menu = inject(MenuController);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private alertCtrl = inject(AlertController);
  private modalCtrl = inject(ModalController);
  private cartService = inject(CartService);

  public isLoggedIn = false;
  public userData: any = null;
  public cartCount = 0;
  public ordersCount = 0;
  public orders: any[] = [];
  private ordersChannel: RealtimeChannel | null = null;
  private userId: string | null = null;

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) this.menu.close();
    });
  }

  async ngOnInit(): Promise<void> {
    const { data } = await this.supabaseService.client.auth.getSession();
    this.isLoggedIn = !!data?.session;
    this.userData = data?.session;
    this.userId = data?.session?.user?.id ?? null;

    this.supabaseService.client.auth.onAuthStateChange((_event, session) => {
      this.isLoggedIn = !!session;
      this.userData = session;
      this.userId = session?.user?.id ?? null;
      if (this.userId) this.subscribeToOrders();
      else this.ordersCount = 0;
    });

    this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });

    if (this.userId) this.subscribeToOrders();
  }

  /* FIXED: EXACT SAME SYNTAX AS YOUR WORKING CART */
  private async loadOrders() {
    if (!this.userId) return;

    const { data, error } = await this.supabaseService.client
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total_amount,
        order_items (
          quantity,
          menu_items:menu_item_id ( id, name, price ),
          promos:promo_id ( id, name, price )
        )
      `)
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading orders:', error);
      return;
    }

    this.orders = data || [];
    this.ordersCount = data?.length || 0;
  }

  private subscribeToOrders() {
    if (this.ordersChannel) this.ordersChannel.unsubscribe();

    this.loadOrders();

    this.ordersChannel = this.supabaseService.client
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${this.userId}` },
        () => this.loadOrders()
      )
      .subscribe();
  }

  async openOrdersModal() {
    const modal = await this.modalCtrl.create({
      component: OrdersModalComponent,
      componentProps: { orders: this.orders },
      breakpoints: [0, 0.7, 0.95],
      initialBreakpoint: 0.95,
      cssClass: 'auto-height-modal'
    });
    await modal.present();
  }

  async logout(): Promise<void> {
    await this.supabaseService.client.auth.signOut();
    this.isLoggedIn = false;
    this.userData = null;
    this.userId = null;
    this.ordersCount = 0;
    this.orders = [];

    if (this.ordersChannel) {
      this.supabaseService.client.removeChannel(this.ordersChannel);
      this.ordersChannel = null;
    }

    const alert = await this.alertCtrl.create({
      header: 'Logged Out',
      message: 'You have been logged out successfully.',
      buttons: ['OK'],
    });
    await alert.present();
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    if (this.ordersChannel) {
      this.supabaseService.client.removeChannel(this.ordersChannel);
    }
  }
}