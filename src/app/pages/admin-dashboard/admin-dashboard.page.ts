import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from 'src/app/services/supabase';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminPage implements OnInit {
  private supabase = inject(SupabaseService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  public orders: any[] = [];
  public menuItems: any[] = [];
  public promos: any[] = [];
  public userEmail: string | null = null;
  public isAdmin = false;

  async ngOnInit() {
    const { data } = await this.supabase.client.auth.getSession();
    this.userEmail = data?.session?.user?.email || null;
    this.isAdmin = this.userEmail === 'qlabsumayod@tip.edu.ph';

    if (this.isAdmin) {
      await this.loadData();
    }
  }

  async loadData() {
    const { data: orders, error: orderErr } = await this.supabase.client
      .from('orders')
      .select(`
        id,
        user_id,
        total_amount,
        payment_method,
        delivery_fee,
        tax,
        status,
        created_at,
        order_items (
          quantity,
          menu_items:menu_item_id ( name, price ),
          promos:promo_id ( name, price )
        )
      `)
      .order('created_at', { ascending: false });

    const { data: menu } = await this.supabase.client.from('menu_items').select('*');
    const { data: promos } = await this.supabase.client.from('promos').select('*');

    this.orders = orders || [];
    this.menuItems = menu || [];
    this.promos = promos || [];

    if (orderErr) {
      console.error('Order fetch error:', orderErr);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load orders',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  async updateOrderStatus(orderId: number, newStatus: string) {
    const { error } = await this.supabase.client
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      const toast = await this.toastCtrl.create({
        message: 'Failed to update status',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Order status updated',
        duration: 1500,
        color: 'success',
      });
      await toast.present();
      this.loadData();
    }
  }

  async deleteOrder(orderId: number) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Order',
      message: 'Are you sure you want to delete this order? This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.supabase.client
              .from('order_items')
              .delete()
              .eq('order_id', orderId);

            await this.supabase.client
              .from('orders')
              .delete()
              .eq('id', orderId);

            const toast = await this.toastCtrl.create({
              message: 'Order deleted permanently.',
              duration: 2000,
              color: 'danger',
            });
            await toast.present();
            this.loadData();
          }
        }
      ]
    });
    await alert.present();
  }

  async addMenuItem() {
    const alert = await this.alertCtrl.create({
      header: 'Add Menu Item',
      inputs: [
        { name: 'name', placeholder: 'Item name' },
        { name: 'description', placeholder: 'Description' },
        { name: 'price', type: 'number', placeholder: 'Price' },
        { name: 'image_url', placeholder: 'Image URL' },
      ],
      buttons: [
        'Cancel',
        {
          text: 'Add',
          handler: async (data) => {
            await this.supabase.client.from('menu_items').insert([data]);
            this.loadData();
          },
        },
      ],
    });
    await alert.present();
  }

   async editMenuItem(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Menu Item',
      inputs: [
        { name: 'name', value: item.name, placeholder: 'Item name' },
        { name: 'description', value: item.description, placeholder: 'Description' },
        { name: 'price', type: 'number', value: item.price, placeholder: 'Price' },
        { name: 'image_url', value: item.image_url || '', placeholder: 'Image URL' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (data) => {
            const { error } = await this.supabase.client
              .from('menu_items')
              .update({
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                image_url: data.image_url || null,
              })
              .eq('id', item.id);

            if (error) {
              const toast = await this.toastCtrl.create({
                message: 'Failed to update item',
                duration: 2000,
                color: 'danger',
              });
              await toast.present();
            } else {
              const toast = await this.toastCtrl.create({
                message: 'Menu item updated',
                duration: 1500,
                color: 'success',
              });
              await toast.present();
              await this.loadData();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteMenuItem(id: number) {
    await this.supabase.client.from('menu_items').delete().eq('id', id);
    this.loadData();
  }

  async addPromo() {
    const alert = await this.alertCtrl.create({
      header: 'Add Promo',
      inputs: [
        { name: 'title', placeholder: 'Promo Title' },
        { name: 'description', placeholder: 'Description' },
        { name: 'image_url', placeholder: 'Image URL' },
      ],
      buttons: [
        'Cancel',
        {
          text: 'Add',
          handler: async (data) => {
            await this.supabase.client.from('promos').insert([data]);
            this.loadData();
          },
        },
      ],
    });
    await alert.present();
  }

  async deletePromo(id: number) {
    await this.supabase.client.from('promos').delete().eq('id', id);
    this.loadData();
  }
}