package com.foodhub.controller;

import com.foodhub.entity.Category;
import com.foodhub.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // Public Category endpoints
    @GetMapping("/api/public/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/api/public/categories/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    // Owner CRUD
    @PostMapping("/api/owner/categories")
    public ResponseEntity<Category> createCategoryByOwner(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }

    @PutMapping("/api/owner/categories/{id}")
    public ResponseEntity<Category> updateCategoryByOwner(@PathVariable Long id, @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/api/owner/categories/{id}")
    public ResponseEntity<?> deleteCategoryByOwner(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Category deleted successfully");
        return ResponseEntity.ok(response);
    }

    // Admin CRUD
    @PostMapping("/api/admin/categories")
    public ResponseEntity<Category> createCategoryByAdmin(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }

    @PutMapping("/api/admin/categories/{id}")
    public ResponseEntity<Category> updateCategoryByAdmin(@PathVariable Long id, @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/api/admin/categories/{id}")
    public ResponseEntity<?> deleteCategoryByAdmin(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Category deleted successfully");
        return ResponseEntity.ok(response);
    }
}
