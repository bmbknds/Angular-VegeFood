import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService, CartItem, Coupon, ShippingOption } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  savedItems: CartItem[] = [];
  appliedCoupon: Coupon | null = null;
  shippingOptions: ShippingOption[] = [];
  selectedShipping = '';
  couponCode = '';
  couponMessage = '';
  couponMessageType: 'success' | 'error' = 'success';

  constructor(public readonly cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cartItems.subscribe(items => {
      this.cartItems = items;
    });

    this.cartService.savedItems.subscribe(items => {
      this.savedItems = items;
    });

    this.cartService.appliedCoupon.subscribe(coupon => {
      this.appliedCoupon = coupon;
    });

    this.shippingOptions = this.cartService.getShippingOptions();
    
    this.cartService.shippingMethod.subscribe(method => {
      this.selectedShipping = method.method;
    });
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number, productName: string): void {
    if (confirm(`Are you sure you want to remove "${productName}" from your cart?`)) {
      this.cartService.removeFromCart(productId);
    }
  }

  increaseQuantity(item: CartItem): void {
    this.updateQuantity(item.product.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item.product.id, item.quantity - 1);
    }
  }

  saveForLater(productId: number): void {
    this.cartService.saveForLater(productId);
  }

  moveToCart(productId: number): void {
    this.cartService.moveToCart(productId);
  }

  removeFromSaved(productId: number, productName: string): void {
    if (confirm(`Are you sure you want to remove "${productName}" from saved items?`)) {
      this.cartService.removeFromSaved(productId);
    }
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.couponMessage = 'Please enter a coupon code';
      this.couponMessageType = 'error';
      return;
    }

    const result = this.cartService.applyCoupon(this.couponCode);
    this.couponMessage = result.message;
    this.couponMessageType = result.success ? 'success' : 'error';
    
    if (result.success) {
      this.couponCode = '';
      setTimeout(() => {
        this.couponMessage = '';
      }, 3000);
    }
  }

  removeCoupon(): void {
    this.cartService.removeCoupon();
    this.couponMessage = 'Coupon removed';
    this.couponMessageType = 'success';
    setTimeout(() => {
      this.couponMessage = '';
    }, 2000);
  }

  onShippingChange(): void {
    this.cartService.setShippingMethod(this.selectedShipping);
  }

  get subtotal(): number {
    return this.cartService.subtotal;
  }

  get discount(): number {
    return this.cartService.discount;
  }

  get shippingCost(): number {
    return this.cartService.shippingCost;
  }

  get tax(): number {
    return this.cartService.tax;
  }

  get total(): number {
    return this.cartService.total;
  }
}
