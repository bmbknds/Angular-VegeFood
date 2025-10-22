import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './data.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  code: string;
  discount: number; // Percentage discount
  description: string;
}

export interface ShippingOption {
  method: string;
  cost: number;
  estimatedDays: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cartItemsSubject: BehaviorSubject<CartItem[]>;
  public readonly cartItems: Observable<CartItem[]>;
  
  private readonly savedItemsSubject: BehaviorSubject<CartItem[]>;
  public readonly savedItems: Observable<CartItem[]>;
  
  private readonly appliedCouponSubject: BehaviorSubject<Coupon | null>;
  public readonly appliedCoupon: Observable<Coupon | null>;
  
  private readonly shippingMethodSubject: BehaviorSubject<ShippingOption>;
  public readonly shippingMethod: Observable<ShippingOption>;

  // Available coupons (in real app, would come from backend)
  private readonly availableCoupons: Coupon[] = [
    { code: 'SAVE10', discount: 10, description: '10% off your order' },
    { code: 'SAVE20', discount: 20, description: '20% off your order' },
    { code: 'WELCOME', discount: 15, description: '15% off for new customers' },
    { code: 'FREESHIP', discount: 0, description: 'Free shipping' }
  ];

  // Shipping options
  private readonly shippingOptions: ShippingOption[] = [
    { method: 'Standard', cost: 5, estimatedDays: '5-7 business days' },
    { method: 'Express', cost: 15, estimatedDays: '2-3 business days' },
    { method: 'Overnight', cost: 25, estimatedDays: '1 business day' }
  ];

  constructor() {
    // Initialize cart
    const storedCart = localStorage.getItem('cart');
    this.cartItemsSubject = new BehaviorSubject<CartItem[]>(
      storedCart ? JSON.parse(storedCart) : []
    );
    this.cartItems = this.cartItemsSubject.asObservable();

    // Initialize saved items (wishlist)
    const storedSaved = localStorage.getItem('savedItems');
    this.savedItemsSubject = new BehaviorSubject<CartItem[]>(
      storedSaved ? JSON.parse(storedSaved) : []
    );
    this.savedItems = this.savedItemsSubject.asObservable();

    // Initialize coupon
    const storedCoupon = localStorage.getItem('appliedCoupon');
    this.appliedCouponSubject = new BehaviorSubject<Coupon | null>(
      storedCoupon ? JSON.parse(storedCoupon) : null
    );
    this.appliedCoupon = this.appliedCouponSubject.asObservable();

    // Initialize shipping method
    const storedShipping = localStorage.getItem('shippingMethod');
    this.shippingMethodSubject = new BehaviorSubject<ShippingOption>(
      storedShipping ? JSON.parse(storedShipping) : this.shippingOptions[0]
    );
    this.shippingMethod = this.shippingMethodSubject.asObservable();
  }

  public get cartItemsValue(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  public get savedItemsValue(): CartItem[] {
    return this.savedItemsSubject.value;
  }

  public get cartCount(): number {
    return this.cartItemsValue.reduce((total, item) => total + item.quantity, 0);
  }

  public get savedCount(): number {
    return this.savedItemsValue.reduce((total, item) => total + item.quantity, 0);
  }

  public get subtotal(): number {
    return this.cartItemsValue.reduce(
      (total, item) => total + (item.product.price * item.quantity), 
      0
    );
  }

  public get discount(): number {
    const coupon = this.appliedCouponSubject.value;
    if (!coupon) return 0;
    
    if (coupon.code === 'FREESHIP') return 0; // Free shipping doesn't affect subtotal
    
    return (this.subtotal * coupon.discount) / 100;
  }

  public get shippingCost(): number {
    const coupon = this.appliedCouponSubject.value;
    if (coupon?.code === 'FREESHIP') return 0;
    
    return this.shippingMethodSubject.value.cost;
  }

  public get tax(): number {
    const taxRate = 0.1; // 10% tax
    return (this.subtotal - this.discount) * taxRate;
  }

  public get total(): number {
    return this.subtotal - this.discount + this.shippingCost + this.tax;
  }

  // Cart operations
  addToCart(product: Product, quantity: number = 1): void {
    const items = this.cartItemsValue;
    const existingItem = items.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({ product, quantity });
    }

    this.updateCart(items);
  }

  updateQuantity(productId: number, quantity: number): void {
    const items = this.cartItemsValue;
    const item = items.find(i => i.product.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.updateCart(items);
      }
    }
  }

  removeFromCart(productId: number): void {
    const items = this.cartItemsValue.filter(item => item.product.id !== productId);
    this.updateCart(items);
  }

  clearCart(): void {
    this.updateCart([]);
    this.removeCoupon();
  }

  private updateCart(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
    this.cartItemsSubject.next(items);
  }

  // Save for Later (Wishlist) operations
  saveForLater(productId: number): void {
    const cartItems = this.cartItemsValue;
    const itemIndex = cartItems.findIndex(item => item.product.id === productId);
    
    if (itemIndex !== -1) {
      const item = cartItems[itemIndex];
      
      // Add to saved items
      const savedItems = this.savedItemsValue;
      const existingSaved = savedItems.find(saved => saved.product.id === productId);
      
      if (existingSaved) {
        existingSaved.quantity += item.quantity;
      } else {
        savedItems.push({ ...item });
      }
      
      // Remove from cart
      cartItems.splice(itemIndex, 1);
      
      this.updateCart(cartItems);
      this.updateSavedItems(savedItems);
    }
  }

  moveToCart(productId: number): void {
    const savedItems = this.savedItemsValue;
    const itemIndex = savedItems.findIndex(item => item.product.id === productId);
    
    if (itemIndex !== -1) {
      const item = savedItems[itemIndex];
      
      // Add to cart
      this.addToCart(item.product, item.quantity);
      
      // Remove from saved items
      savedItems.splice(itemIndex, 1);
      this.updateSavedItems(savedItems);
    }
  }

  removeFromSaved(productId: number): void {
    const items = this.savedItemsValue.filter(item => item.product.id !== productId);
    this.updateSavedItems(items);
  }

  private updateSavedItems(items: CartItem[]): void {
    localStorage.setItem('savedItems', JSON.stringify(items));
    this.savedItemsSubject.next(items);
  }

  // Coupon operations
  applyCoupon(code: string): { success: boolean; message: string } {
    const coupon = this.availableCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (!coupon) {
      return { success: false, message: 'Invalid coupon code' };
    }

    localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
    this.appliedCouponSubject.next(coupon);
    
    return { success: true, message: `Coupon applied: ${coupon.description}` };
  }

  removeCoupon(): void {
    localStorage.removeItem('appliedCoupon');
    this.appliedCouponSubject.next(null);
  }

  // Shipping operations
  getShippingOptions(): ShippingOption[] {
    return this.shippingOptions;
  }

  setShippingMethod(method: string): void {
    const option = this.shippingOptions.find(opt => opt.method === method);
    if (option) {
      localStorage.setItem('shippingMethod', JSON.stringify(option));
      this.shippingMethodSubject.next(option);
    }
  }
}
