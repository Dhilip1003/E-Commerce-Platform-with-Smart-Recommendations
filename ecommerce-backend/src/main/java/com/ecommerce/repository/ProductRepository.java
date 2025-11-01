package com.ecommerce.repository;

import com.ecommerce.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Page<Product> findByActiveTrue(Pageable pageable);
    
    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);
    
    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.purchaseCount DESC, p.viewCount DESC")
    List<Product> findTopByOrderByPurchaseCountDescViewCountDesc(int limit);
    
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);
    
    List<Product> findByCategoryId(Long categoryId);
}

