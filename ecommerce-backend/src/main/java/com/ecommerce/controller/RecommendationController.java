package com.ecommerce.controller;

import com.ecommerce.model.ProductRecommendation;
import com.ecommerce.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecommendationController {
    
    private final RecommendationService recommendationService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProductRecommendation>> getUserRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int count) {
        return ResponseEntity.ok(recommendationService.getRecommendations(userId, count));
    }
    
    @GetMapping("/guest")
    public ResponseEntity<List<ProductRecommendation>> getGuestRecommendations(
            @RequestParam(defaultValue = "10") int count) {
        return ResponseEntity.ok(recommendationService.getGuestRecommendations(count));
    }
}

