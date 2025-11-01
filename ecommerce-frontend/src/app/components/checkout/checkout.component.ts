import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container">
      <h1>Checkout</h1>
      <div *ngIf="cart && cart.cartItems && cart.cartItems.length > 0">
        <form (ngSubmit)="placeOrder()">
          <div class="checkout-form">
            <div class="shipping-address">
              <h2>Shipping Address</h2>
              <input type="text" [(ngModel)]="shippingAddress.street" 
                     name="street" placeholder="Street" required>
              <input type="text" [(ngModel)]="shippingAddress.city" 
                     name="city" placeholder="City" required>
              <input type="text" [(ngModel)]="shippingAddress.state" 
                     name="state" placeholder="State" required>
              <input type="text" [(ngModel)]="shippingAddress.zipCode" 
                     name="zipCode" placeholder="ZIP Code" required>
              <input type="text" [(ngModel)]="shippingAddress.country" 
                     name="country" placeholder="Country" required>
            </div>
            
            <div class="payment-method">
              <h2>Payment Method</h2>
              <select [(ngModel)]="paymentMethod" name="paymentMethod" required>
                <option value="STRIPE">Stripe</option>
                <option value="PAYPAL">PayPal</option>
                <option value="CREDIT_CARD">Credit Card</option>
              </select>
              <input type="text" [(ngModel)]="paymentToken" 
                     name="paymentToken" placeholder="Payment Token" required>
            </div>
            
            <div class="order-summary">
              <h2>Order Summary</h2>
              <div *ngFor="let item of cart.cartItems">
                <p>{{ item.product.name }} x{{ item.quantity }} - 
                   ${{ item.product.price * item.quantity }}</p>
              </div>
              <h3>Total: ${{ getTotal() }}</h3>
            </div>
            
            <button type="submit" class="btn-place-order">Place Order</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .checkout-form {
      background: white;
      padding: 30px;
      border-radius: 8px;
    }
    .shipping-address, .payment-method, .order-summary {
      margin-bottom: 30px;
    }
    input, select {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .btn-place-order {
      padding: 15px 40px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cart: any = null;
  currentUser: any = null;
  shippingAddress: any = {};
  paymentMethod: string = 'STRIPE';
  paymentToken: string = '';
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      this.loadCart();
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
  
  placeOrder() {
    if (this.currentUser) {
      const checkoutData = {
        paymentMethod: this.paymentMethod,
        paymentToken: this.paymentToken,
        shippingAddress: this.shippingAddress
      };
      
      this.apiService.checkout(this.currentUser.id, checkoutData).subscribe({
        next: (order: any) => {
          alert('Order placed successfully! Order Number: ' + order.orderNumber);
          window.location.href = '/orders';
        },
        error: (err) => {
          alert('Error placing order: ' + (err.error?.message || 'Unknown error'));
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

