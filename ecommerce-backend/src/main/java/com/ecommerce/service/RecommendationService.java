package com.ecommerce.service;

import com.ecommerce.model.Product;
import com.ecommerce.model.ProductRecommendation;
import com.ecommerce.model.User;
import com.ecommerce.model.UserInteraction;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserInteractionRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {
    
    private final UserInteractionRepository interactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    /**
     * Get personalized product recommendations for a user using collaborative filtering
     */
    @Cacheable(value = "recommendations", key = "#userId")
    public List<ProductRecommendation> getRecommendations(Long userId, int count) {
        log.info("Generating recommendations for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get user's interaction history
        List<UserInteraction> userInteractions = interactionRepository.findByUserId(userId);
        
        if (userInteractions.isEmpty()) {
            // If no interactions, return popular products
            return getPopularProducts(count);
        }
        
        // Extract product IDs the user has interacted with
        Set<Long> userProductIds = userInteractions.stream()
                .map(interaction -> interaction.getProduct().getId())
                .collect(Collectors.toSet());
        
        // Collaborative filtering: find similar users
        Map<Long, Double> productScores = new HashMap<>();
        
        // Get all users and their interactions
        List<User> allUsers = userRepository.findAll();
        
        for (User otherUser : allUsers) {
            if (otherUser.getId().equals(userId)) continue;
            
            List<UserInteraction> otherUserInteractions = interactionRepository.findByUserId(otherUser.getId());
            if (otherUserInteractions.isEmpty()) continue;
            
            // Calculate similarity
            double similarity = calculateUserSimilarity(userInteractions, otherUserInteractions);
            
            if (similarity > 0.3) { // Similarity threshold
                // Weight products by similarity
                for (UserInteraction interaction : otherUserInteractions) {
                    Long productId = interaction.getProduct().getId();
                    if (!userProductIds.contains(productId)) {
                        double weight = similarity * getInteractionWeight(interaction.getType());
                        productScores.merge(productId, weight, Double::sum);
                    }
                }
            }
        }
        
        // Add content-based recommendations
        addContentBasedRecommendations(userInteractions, productScores, userProductIds);
        
        // Sort by score and get top recommendations
        List<ProductRecommendation> recommendations = productScores.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(count)
                .map(entry -> {
                    Product product = productRepository.findById(entry.getKey())
                            .orElse(null);
                    if (product != null && product.getActive()) {
                        return new ProductRecommendation(
                                product.getId(),
                                product.getName(),
                                entry.getValue(),
                                "COLLABORATIVE"
                        );
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        
        // Fill remaining slots with popular products if needed
        if (recommendations.size() < count) {
            int remaining = count - recommendations.size();
            Set<Long> recommendedIds = recommendations.stream()
                    .map(ProductRecommendation::getProductId)
                    .collect(Collectors.toSet());
            
            List<ProductRecommendation> popular = getPopularProducts(remaining + recommendedIds.size())
                    .stream()
                    .filter(rec -> !recommendedIds.contains(rec.getProductId()))
                    .limit(remaining)
                    .collect(Collectors.toList());
            
            recommendations.addAll(popular);
        }
        
        return recommendations;
    }
    
    /**
     * Calculate similarity between two users based on their interactions
     */
    private double calculateUserSimilarity(List<UserInteraction> user1Interactions, 
                                          List<UserInteraction> user2Interactions) {
        Set<Long> user1Products = user1Interactions.stream()
                .map(i -> i.getProduct().getId())
                .collect(Collectors.toSet());
        
        Set<Long> user2Products = user2Interactions.stream()
                .map(i -> i.getProduct().getId())
                .collect(Collectors.toSet());
        
        // Jaccard similarity
        Set<Long> intersection = new HashSet<>(user1Products);
        intersection.retainAll(user2Products);
        
        Set<Long> union = new HashSet<>(user1Products);
        union.addAll(user2Products);
        
        if (union.isEmpty()) return 0.0;
        
        return (double) intersection.size() / union.size();
    }
    
    /**
     * Get weight for different interaction types
     */
    private double getInteractionWeight(UserInteraction.InteractionType type) {
        switch (type) {
            case PURCHASE: return 5.0;
            case ADD_TO_CART: return 2.0;
            case VIEW: return 1.0;
            case RATING: return 3.0;
            default: return 1.0;
        }
    }
    
    /**
     * Add content-based recommendations based on user's preferred categories
     */
    private void addContentBasedRecommendations(List<UserInteraction> userInteractions,
                                                Map<Long, Double> productScores,
                                                Set<Long> userProductIds) {
        // Get preferred categories from user interactions
        Map<Long, Long> categoryPreferences = userInteractions.stream()
                .collect(Collectors.groupingBy(
                        i -> i.getProduct().getCategory().getId(),
                        Collectors.counting()
                ));
        
        // Find products in preferred categories
        for (Map.Entry<Long, Long> entry : categoryPreferences.entrySet()) {
            Long categoryId = entry.getKey();
            Long interactionCount = entry.getValue();
            
            List<Product> categoryProducts = productRepository.findByCategoryIdAndActiveTrue(categoryId);
            for (Product product : categoryProducts) {
                if (!userProductIds.contains(product.getId()) && product.getActive()) {
                    double score = interactionCount * 0.5; // Content-based weight
                    productScores.merge(product.getId(), score, Double::sum);
                }
            }
        }
    }
    
    /**
     * Get popular products based on purchase count and views
     */
    private List<ProductRecommendation> getPopularProducts(int count) {
        return productRepository.findTopByOrderByPurchaseCountDescViewCountDesc(count)
                .stream()
                .filter(Product::getActive)
                .map(product -> new ProductRecommendation(
                        product.getId(),
                        product.getName(),
                        calculatePopularityScore(product),
                        "POPULAR"
                ))
                .sorted(Comparator.comparing(ProductRecommendation::getScore).reversed())
                .limit(count)
                .collect(Collectors.toList());
    }
    
    /**
     * Calculate popularity score based on purchases and views
     */
    private double calculatePopularityScore(Product product) {
        long purchases = product.getPurchaseCount() != null ? product.getPurchaseCount() : 0;
        long views = product.getViewCount() != null ? product.getViewCount() : 0;
        return (purchases * 10.0) + (views * 0.1);
    }
    
    /**
     * Get recommendations for new/guest users
     */
    public List<ProductRecommendation> getGuestRecommendations(int count) {
        return getPopularProducts(count);
    }
}

