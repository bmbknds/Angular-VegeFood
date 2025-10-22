import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  total = 0;
  
  // Form fields
  firstName = '';
  lastName = '';
  email = '';
  address = '';
  city = '';
  zipCode = '';
  cardNumber = '';
  
  orderPlaced = false;

  constructor(
    private readonly cartService: CartService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems.subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.total;
    });
  }

  getTotalWithTaxAndShipping(): number {
    return this.total + 5 + (this.total * 0.1);
  }

  onSubmit(): void {
    // In real app, would process payment and create order
    this.orderPlaced = true;
    this.cartService.clearCart();
    
    // Redirect to home after 3 seconds
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 3000);
  }
}
