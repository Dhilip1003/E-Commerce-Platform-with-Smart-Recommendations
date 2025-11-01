package com.ecommerce.service;

import com.ecommerce.model.*;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ShoppingCartRepository;
import com.ecommerce.repository.UserInteractionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ShoppingCartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserInteractionRepository interactionRepository;
    private final InventoryService inventoryService;
    
    @Transactional
    public Order createOrderFromCart(Long userId, Order.PaymentMethod paymentMethod, 
                                    String paymentTransactionId, Order.Address shippingAddress) {
        ShoppingCart cart = cartRepository.findByUser(
                new User() {{ setId(userId); }}
        ).orElseThrow(() -> new RuntimeException("Cart not found"));
        
        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        Order order = new Order();
        order.setUser(cart.getUser());
        order.setPaymentMethod(paymentMethod);
        order.setPaymentTransactionId(paymentTransactionId);
        order.setShippingAddress(shippingAddress);
        order.setStatus(Order.OrderStatus.PENDING);
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            
            // Check stock availability
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            
            BigDecimal unitPrice = product.getDiscountPrice() != null && 
                    product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                    ? product.getDiscountPrice()
                    : product.getPrice();
            
            orderItem.setUnitPrice(unitPrice);
            orderItem.setSubtotal(unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            
            totalAmount = totalAmount.add(orderItem.getSubtotal());
            
            // Track user interaction
            UserInteraction interaction = new UserInteraction();
            interaction.setUser(order.getUser());
            interaction.setProduct(product);
            interaction.setType(UserInteraction.InteractionType.PURCHASE);
            interactionRepository.save(interaction);
            
            // Update product purchase count
            product.setPurchaseCount(product.getPurchaseCount() + cartItem.getQuantity());
            productRepository.save(product);
        }
        
        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);
        
        // Update inventory
        for (CartItem cartItem : cart.getCartItems()) {
            inventoryService.updateInventory(cartItem.getProduct().getId(), 
                    -cartItem.getQuantity(), 
                    InventoryTransaction.TransactionType.OUT, 
                    "Order: " + order.getOrderNumber());
        }
        
        // Clear cart
        cart.getCartItems().clear();
        cartRepository.save(cart);
        
        log.info("Order created: {} for user: {}", order.getOrderNumber(), userId);
        
        return order;
    }
    
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
    
    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }
    
    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}

