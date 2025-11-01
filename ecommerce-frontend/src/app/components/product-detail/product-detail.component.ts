import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container" *ngIf="product">
      <div class="product-detail">
        <div class="product-image">
          <img [src]="product.imageUrl || '/assets/placeholder.jpg'" 
               [alt]="product.name">
        </div>
        <div class="product-info">
          <h1>{{ product.name }}</h1>
          <p class="description">{{ product.description }}</p>
          <div class="price">
            <span *ngIf="product.discountPrice" class="old-price">
              ${{ product.price }}
            </span>
            <span class="current-price">
              ${{ product.discountPrice || product.price }}
            </span>
          </div>
          <p class="stock">In Stock: {{ product.stockQuantity }}</p>
          <div class="actions">
            <input type="number" [(ngModel)]="quantity" min="1" 
                   [max]="product.stockQuantity" value="1">
            <button (click)="addToCart()" [disabled]="!currentUser || product.stockQuantity === 0">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-detail {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      background: white;
      padding: 30px;
      border-radius: 8px;
    }
    .product-image img {
      width: 100%;
      border-radius: 8px;
    }
    .description {
      margin: 20px 0;
      color: #666;
    }
    .price {
      font-size: 1.5em;
      margin: 20px 0;
    }
    .actions {
      margin-top: 30px;
      display: flex;
      gap: 10px;
    }
    .actions input {
      width: 80px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .actions button {
      padding: 10px 30px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .actions button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  quantity: number = 1;
  currentUser: any = null;
  
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}
  
  ngOnInit() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apiService.getProduct(+id).subscribe({
        next: (data: any) => {
          this.product = data;
        }
      });
    }
  }
  
  addToCart() {
    if (this.currentUser && this.product) {
      this.apiService.addToCart(this.currentUser.id, this.product.id, this.quantity)
        .subscribe({
          next: () => {
            alert('Product added to cart!');
          },
          error: (err) => {
            alert('Error adding to cart: ' + err.error?.message);
          }
        });
    } else {
      alert('Please login to add items to cart');
    }
  }
}

