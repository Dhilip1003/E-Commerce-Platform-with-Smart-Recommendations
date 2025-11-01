import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <h1>Shopping Cart</h1>
      <div *ngIf="cart && cart.cartItems && cart.cartItems.length > 0">
        <div *ngFor="let item of cart.cartItems" class="cart-item">
          <div class="item-info">
            <h3>{{ item.product.name }}</h3>
            <p>${{ item.product.price }}</p>
          </div>
          <div class="item-quantity">
            <input type="number" [(ngModel)]="item.quantity" 
                   min="1" [max]="item.product.stockQuantity"
                   (change)="updateQuantity(item)">
          </div>
          <div class="item-total">
            ${{ item.product.price * item.quantity }}
          </div>
          <button (click)="removeItem(item)">Remove</button>
        </div>
        <div class="cart-total">
          <h2>Total: ${{ getTotal() }}</h2>
          <button class="btn-checkout" routerLink="/checkout">Checkout</button>
        </div>
      </div>
      <div *ngIf="!cart || !cart.cartItems || cart.cartItems.length === 0">
        <p>Your cart is empty</p>
        <a routerLink="/">Continue Shopping</a>
      </div>
    </div>
  `,
  styles: [`
    .cart-item {
      display: flex;
      align-items: center;
      gap: 20px;
      background: white;
      padding: 20px;
      margin-bottom: 10px;
      border-radius: 8px;
    }
    .item-info {
      flex: 1;
    }
    .item-quantity input {
      width: 60px;
      padding: 5px;
    }
    .cart-total {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: right;
    }
    .btn-checkout {
      padding: 15px 40px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
      text-decoration: none;
      display: inline-block;
    }
  `]
})
export class CartComponent implements OnInit {
  cart: any = null;
  currentUser: any = null;
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      this.loadCart();
    } else {
      alert('Please login to view cart');
    }
  }
  
  loadCart() {
    if (this.currentUser) {
      this.apiService.getCart(this.currentUser.id).subscribe({
        next: (data: any) => {
          this.cart = data;
        }
      });
    }
  }
  
  updateQuantity(item: any) {
    if (this.currentUser) {
      this.apiService.updateCartItem(
        this.currentUser.id, 
        item.id, 
        item.quantity
      ).subscribe({
        next: () => {
          this.loadCart();
        }
      });
    }
  }
  
  removeItem(item: any) {
    if (this.currentUser) {
      this.apiService.removeFromCart(this.currentUser.id, item.id).subscribe({
        next: () => {
          this.loadCart();
        }
      });
    }
  }
  
  getTotal(): number {
    if (!this.cart || !this.cart.cartItems) return 0;
    return this.cart.cartItems.reduce((sum: number, item: any) => 
      sum + (item.product.price * item.quantity), 0
    );
  }
}

