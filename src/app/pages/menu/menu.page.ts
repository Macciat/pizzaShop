import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MenuPage {
  promoTabs = ['Best Sellers', 'Family Feast', 'Weekend Promo'];
  menuTabs = ['Pizzas', 'Pasta', 'Drinks', 'Desserts', 'Sides'];
  activePromoTab = this.promoTabs[0];
  activeMenuTab = this.menuTabs[0];
  bestSellers: any[] = [];
  familyFeast: any[] = [];
  weekendPromo: any[] = [];
  pizzas: any[] = [];
  pasta: any[] = [];
  drinks: any[] = [];
  desserts: any[] = [];
  sides: any[] = [];
  selectedItem: any = null;
  isModalOpen = false;
  quantity = 1;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    await this.loadPromos();
    await this.loadMenuItems();
  }

  async loadPromos() {
    const { data, error } = await this.supabase.client.from('promos').select('*');
    if (error) return;
    this.bestSellers = data.filter(p => p.promo_type === 'Best Sellers');
    this.familyFeast = data.filter(p => p.promo_type === 'Family Feast');
    this.weekendPromo = data.filter(p => p.promo_type === 'Weekend Promo');
  }

  async loadMenuItems() {
    const { data, error } = await this.supabase.client.from('menu_items').select('*');
    if (error) return;
    this.pizzas = data.filter(i => i.category === 'Pizzas');
    this.pasta = data.filter(i => i.category === 'Pasta');
    this.drinks = data.filter(i => i.category === 'Drinks');
    this.desserts = data.filter(i => i.category === 'Desserts');
    this.sides = data.filter(i => i.category === 'Sides');
  }

  setPromoTab(tab: string) {
    this.activePromoTab = tab;
  }

  setMenuTab(tab: string) {
    this.activeMenuTab = tab;
  }

  openModal(item: any) {
    this.selectedItem = item;
    this.isModalOpen = true;
    this.quantity = 1;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedItem = null;
  }

  async addToCart() {
    if (!this.selectedItem) return;
    await this.addItemToCart(this.selectedItem, this.quantity);
    this.closeModal();
  }

  async addToCartFromCard(item: any, event: Event) {
    event.stopPropagation(); // prevent modal from opening
    await this.addItemToCart(item, 1);
  }

  private async addItemToCart(item: any, qty: number) {
    const { data: sessionData, error: sessionError } = await this.supabase.client.auth.getSession();
    if (sessionError) return;
    const userId = sessionData?.session?.user?.id;
    if (!userId) {
      const alert = await this.alertCtrl.create({
        header: 'Login Required',
        message: 'You must be logged in to add items to your cart.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const isPromo = !!item.promo_type;
    const idField = isPromo ? 'promo_id' : 'menu_item_id';
    const idValue = item.id;

    const { data: existingItem } = await this.supabase.client
      .from('cart')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq(idField, idValue)
      .maybeSingle();

    if (existingItem) {
      await this.supabase.client
        .from('cart')
        .update({ quantity: existingItem.quantity + qty })
        .eq('id', existingItem.id);
    } else {
      await this.supabase.client.from('cart').insert({
        user_id: userId,
        menu_item_id: isPromo ? null : idValue,
        promo_id: isPromo ? idValue : null,
        quantity: qty,
      });
    }

    const alert = await this.alertCtrl.create({
      header: 'Added to Cart',
      message: `${item.name} added to your cart.`,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
