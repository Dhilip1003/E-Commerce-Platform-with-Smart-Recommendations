package com.ecommerce.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRecommendation {
    
    private Long productId;
    private String productName;
    private Double score;
    private String recommendationType; // COLLABORATIVE, CONTENT_BASED, POPULAR
    
    public ProductRecommendation(Long productId, String productName, Double score) {
        this.productId = productId;
        this.productName = productName;
        this.score = score;
    }
}

