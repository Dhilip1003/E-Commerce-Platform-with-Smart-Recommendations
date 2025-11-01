import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <h1><a routerLink="/">E-Commerce</a></h1>
          <nav>
            <a routerLink="/" routerLinkActive="active">Products</a>
            <a routerLink="/cart" routerLinkActive="active">Cart ({{cartItemCount}})</a>
            <a routerLink="/orders" routerLinkActive="active">Orders</a>
            <a *ngIf="!currentUser" routerLink="/login">Login</a>
            <a *ngIf="currentUser" (click)="logout()">Logout</a>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: #007bff;
      color: white;
      padding: 15px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      margin: 0;
    }
    h1 a {
      color: white;
      text-decoration: none;
    }
    nav {
      display: flex;
      gap: 20px;
    }
    nav a {
      color: white;
      text-decoration: none;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    nav a:hover, nav a.active {
      background-color: rgba(255,255,255,0.2);
    }
  `]
})
export class HeaderComponent {
  currentUser: any = null;
  cartItemCount: number = 0;
  
  constructor(private apiService: ApiService) {
    // Load current user from localStorage
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      this.loadCartCount();
    }
  }
  
  loadCartCount() {
    if (this.currentUser) {
      this.apiService.getCart(this.currentUser.id).subscribe({
        next: (cart: any) => {
          this.cartItemCount = cart.cartItems ? cart.cartItems.length : 0;
        },
        error: () => {
          this.cartItemCount = 0;
        }
      });
    }
  }
  
  logout() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.cartItemCount = 0;
    window.location.href = '/';
  }
}

