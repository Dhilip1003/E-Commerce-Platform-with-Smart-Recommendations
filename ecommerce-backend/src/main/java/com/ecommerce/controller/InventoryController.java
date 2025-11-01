package com.ecommerce.controller;

import com.ecommerce.model.InventoryTransaction;
import com.ecommerce.model.Product;
import com.ecommerce.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {
    
    private final InventoryService inventoryService;
    
    @GetMapping("/check/{productId}")
    public ResponseEntity<Boolean> checkStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(inventoryService.checkStockAvailability(productId, quantity));
    }
    
    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts(
            @RequestParam(defaultValue = "10") int threshold) {
        return ResponseEntity.ok(inventoryService.getLowStockProducts(threshold));
    }
    
    @PostMapping("/update")
    public ResponseEntity<Void> updateInventory(@RequestBody Map<String, Object> request) {
        Long productId = Long.parseLong(request.get("productId").toString());
        Integer quantity = Integer.parseInt(request.get("quantity").toString());
        String type = request.get("type").toString();
        String reason = request.getOrDefault("reason", "").toString();
        
        inventoryService.updateInventory(
                productId,
                quantity,
                InventoryTransaction.TransactionType.valueOf(type),
                reason
        );
        
        return ResponseEntity.ok().build();
    }
}

