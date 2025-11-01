import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container">
      <div class="search-bar">
        <input type="text" [(ngModel)]="searchQuery" 
               placeholder="Search products..." 
               (keyup.enter)="search()">
        <button (click)="search()">Search</button>
      </div>
      
      <div *ngIf="recommendations.length > 0" class="recommendations">
        <h2>Recommended for You</h2>
        <div class="grid">
          <div *ngFor="let rec of recommendations" class="product-card">
            <a [routerLink]="['/products', rec.productId]">
              <h3>{{ rec.productName }}</h3>
              <p>Score: {{ rec.score | number:'1.2-2' }}</p>
            </a>
          </div>
        </div>
      </div>
      
      <h2>All Products</h2>
      <div class="grid">
        <div *ngFor="let product of products" class="product-card">
          <a [routerLink]="['/products', product.id]">
            <img [src]="product.imageUrl || '/assets/placeholder.jpg'" 
                 [alt]="product.name">
            <h3>{{ product.name }}</h3>
            <p>{{ product.description }}</p>
            <div class="price">
              <span *ngIf="product.discountPrice" class="old-price">
                ${{ product.price }}
              </span>
              <span class="current-price">
                ${{ product.discountPrice || product.price }}
              </span>
            </div>
            <p class="stock">Stock: {{ product.stockQuantity }}</p>
          </a>
        </div>
      </div>
      
      <div *ngIf="products.length === 0" class="no-products">
        <p>No products found</p>
      </div>
    </div>
  `,
  styles: [`
    .search-bar {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }
    .search-bar input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .search-bar button {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .product-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }
    .product-card:hover {
      transform: translateY(-5px);
    }
    .product-card a {
      text-decoration: none;
      color: inherit;
      display: block;
    }
    .product-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .product-card h3 {
      padding: 15px;
      margin: 0;
      color: #333;
    }
    .product-card p {
      padding: 0 15px;
      color: #666;
    }
    .price {
      padding: 10px 15px;
      font-weight: bold;
    }
    .old-price {
      text-decoration: line-through;
      color: #999;
      margin-right: 10px;
    }
    .current-price {
      color: #28a745;
      font-size: 1.2em;
    }
    .stock {
      font-size: 0.9em;
      color: #666;
    }
    .recommendations {
      margin-bottom: 40px;
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  recommendations: any[] = [];
  searchQuery: string = '';
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit() {
    this.loadProducts();
    this.loadRecommendations();
  }
  
  loadProducts() {
    this.apiService.getProducts().subscribe({
      next: (data: any) => {
        this.products = data.content || data;
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }
  
  loadRecommendations() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.apiService.getRecommendations(user.id).subscribe({
        next: (data: any) => {
          this.recommendations = data;
        }
      });
    } else {
      this.apiService.getGuestRecommendations().subscribe({
        next: (data: any) => {
          this.recommendations = data;
        }
      });
    }
  }
  
  search() {
    if (this.searchQuery.trim()) {
      this.apiService.searchProducts(this.searchQuery).subscribe({
        next: (data: any) => {
          this.products = data;
        }
      });
    } else {
      this.loadProducts();
    }
  }
}

