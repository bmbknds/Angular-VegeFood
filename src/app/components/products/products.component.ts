import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Product } from '../../services/data.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  addedToCartMessage = '';

  constructor(
    private readonly dataService: DataService,
    private readonly cartService: CartService
  ) {}

  ngOnInit(): void {
    this.dataService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.addedToCartMessage = `${product.name} added to cart!`;
    
    // Clear message after 3 seconds
    setTimeout(() => {
      this.addedToCartMessage = '';
    }, 3000);
  }
}
