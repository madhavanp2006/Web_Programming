package com.foodhub.service;

import com.foodhub.entity.Category;
import com.foodhub.exception.BadRequestException;
import com.foodhub.exception.ResourceNotFoundException;
import com.foodhub.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    public Category createCategory(Category category) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            throw new BadRequestException("Category with name '" + category.getName() + "' already exists");
        }
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = getCategoryById(id);
        
        categoryRepository.findByName(categoryDetails.getName()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Category with name '" + categoryDetails.getName() + "' already exists");
            }
        });

        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
