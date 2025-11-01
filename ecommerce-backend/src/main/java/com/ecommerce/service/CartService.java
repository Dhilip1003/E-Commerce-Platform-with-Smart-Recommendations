package com.ecommerce.service;

import com.ecommerce.model.*;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ShoppingCartRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {
    
    private final ShoppingCartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserInteractionRepository interactionRepository;
    
    @Transactional
    public ShoppingCart getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    ShoppingCart cart = new ShoppingCart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }
    
    @Transactional
    public CartItem addToCart(Long userId, Long productId, Integer quantity) {
        ShoppingCart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getActive()) {
            throw new RuntimeException("Product is not available");
        }
        
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }
        
        // Check if item already exists in cart
        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();
        
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
            
            // Track interaction
            trackInteraction(userId, productId, UserInteraction.InteractionType.ADD_TO_CART);
            
            return item;
        } else {
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            
            cartItem = cartItemRepository.save(cartItem);
            
            // Track interaction
            trackInteraction(userId, productId, UserInteraction.InteractionType.ADD_TO_CART);
            
            return cartItem;
        }
    }
    
    @Transactional
    public void removeFromCart(Long userId, Long cartItemId) {
        ShoppingCart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user");
        }
        
        cartItemRepository.delete(item);
    }
    
    @Transactional
    public void updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity) {
        if (quantity <= 0) {
            removeFromCart(userId, cartItemId);
            return;
        }
        
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        Product product = item.getProduct();
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }
        
        item.setQuantity(quantity);
        cartItemRepository.save(item);
    }
    
    public ShoppingCart getCart(Long userId) {
        return getOrCreateCart(userId);
    }
    
    @Transactional
    public void clearCart(Long userId) {
        ShoppingCart cart = getOrCreateCart(userId);
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }
    
    private void trackInteraction(Long userId, Long productId, UserInteraction.InteractionType type) {
        try {
            UserInteraction interaction = new UserInteraction();
            interaction.setUser(userRepository.findById(userId).orElse(null));
            interaction.setProduct(productRepository.findById(productId).orElse(null));
            interaction.setType(type);
            interactionRepository.save(interaction);
        } catch (Exception e) {
            log.warn("Failed to track interaction: {}", e.getMessage());
        }
    }
}

