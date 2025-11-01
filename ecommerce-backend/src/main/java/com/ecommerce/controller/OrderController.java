package com.ecommerce.controller;

import com.ecommerce.model.Order;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {
    
    private final OrderService orderService;
    private final PaymentService paymentService;
    
    @PostMapping("/{userId}/checkout")
    public ResponseEntity<Order> checkout(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> checkoutRequest) {
        
        Order.PaymentMethod paymentMethod = Order.PaymentMethod.valueOf(
                checkoutRequest.get("paymentMethod").toString().toUpperCase());
        String paymentToken = checkoutRequest.get("paymentToken").toString();
        @SuppressWarnings("unchecked")
        Map<String, String> addressMap = (Map<String, String>) checkoutRequest.get("shippingAddress");
        
        Order.Address shippingAddress = new Order.Address(
                addressMap.get("street"),
                addressMap.get("city"),
                addressMap.get("state"),
                addressMap.get("zipCode"),
                addressMap.get("country")
        );
        
        // Process payment
        String transactionId = paymentService.processPayment(
                null, // Amount will be calculated from cart
                paymentMethod.name(),
                paymentToken,
                "USD"
        );
        
        // Create order
        Order order = orderService.createOrderFromCart(
                userId,
                paymentMethod,
                transactionId,
                shippingAddress
        );
        
        return ResponseEntity.ok(order);
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable Long orderId) {
        return orderService.getOrderById(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<Order> getOrderByNumber(@PathVariable String orderNumber) {
        return orderService.getOrderByOrderNumber(orderNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }
}

