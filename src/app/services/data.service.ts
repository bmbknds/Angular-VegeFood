import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
  rating: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly productsUrl = 'assets/mock-data/products.json';
  private readonly categoriesUrl = 'assets/mock-data/categories.json';

  constructor(private readonly http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl);
  }

  getProductById(id: number): Observable<Product | undefined> {
    return new Observable(observer => {
      this.getProducts().subscribe(products => {
        const product = products.find(p => p.id === id);
        observer.next(product);
        observer.complete();
      });
    });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return new Observable(observer => {
      this.getProducts().subscribe(products => {
        const filteredProducts = products.filter(p => p.category === category);
        observer.next(filteredProducts);
        observer.complete();
      });
    });
  }
}
