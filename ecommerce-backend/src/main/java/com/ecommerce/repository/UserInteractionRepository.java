package com.ecommerce.repository;

import com.ecommerce.model.UserInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, Long> {
    
    List<UserInteraction> findByUserId(Long userId);
    
    List<UserInteraction> findByProductId(Long productId);
    
    long countByProductIdAndType(Long productId, UserInteraction.InteractionType type);
}

