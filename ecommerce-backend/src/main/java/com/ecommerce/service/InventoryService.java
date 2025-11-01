package com.ecommerce.service;

import com.ecommerce.model.InventoryTransaction;
import com.ecommerce.model.Product;
import com.ecommerce.repository.InventoryTransactionRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {
    
    private final ProductRepository productRepository;
    private final InventoryTransactionRepository transactionRepository;
    
    @Transactional
    public void updateInventory(Long productId, Integer quantityChange,
                                InventoryTransaction.TransactionType type, String reason) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        int newQuantity = product.getStockQuantity() + quantityChange;
        if (newQuantity < 0) {
            throw new RuntimeException("Insufficient inventory. Current: " + 
                    product.getStockQuantity() + ", Requested: " + Math.abs(quantityChange));
        }
        
        product.setStockQuantity(newQuantity);
        productRepository.save(product);
        
        // Record transaction
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setProduct(product);
        transaction.setType(type);
        transaction.setQuantity(Math.abs(quantityChange));
        transaction.setReason(reason);
        transactionRepository.save(transaction);
        
        log.info("Inventory updated for product {}: {} ({}), new quantity: {}", 
                productId, quantityChange, type, newQuantity);
    }
    
    public boolean checkStockAvailability(Long productId, Integer requestedQuantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return product.getStockQuantity() >= requestedQuantity;
    }
    
    public List<Product> getLowStockProducts(int threshold) {
        return productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() <= threshold && p.getActive())
                .toList();
    }
    
    @Scheduled(fixedRate = 3600000) // Every hour
    public void checkLowStock() {
        int threshold = 10; // Default threshold
        List<Product> lowStockProducts = getLowStockProducts(threshold);
        
        if (!lowStockProducts.isEmpty()) {
            log.warn("Low stock alert: {} products below threshold", lowStockProducts.size());
            // In a real application, send notifications here
        }
    }
}

