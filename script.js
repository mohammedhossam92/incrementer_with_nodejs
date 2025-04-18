document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const categorySelect = document.getElementById('category-select');
    const newCategoryInput = document.getElementById('new-category');
    const addCategoryBtn = document.getElementById('add-category');
    const deleteCategoryBtn = document.getElementById('delete-category');
    const currentValueDisplay = document.getElementById('current-value');
    const incrementBtn = document.getElementById('increment');
    const incrementHalfBtn = document.getElementById('increment-half');
    const decrementBtn = document.getElementById('decrement');
    const decrementHalfBtn = document.getElementById('decrement-half');
    const resetBtn = document.getElementById('reset');
    const dataTable = document.getElementById('data-table').querySelector('tbody');
    
    // App State
    let appData = {
        categories: [],
        counters: {}
    };
    
    // Fetch initial data
    async function fetchData() {
        try {
            const response = await fetch('/api/data');
            appData = await response.json();
            updateUI();
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load data. Please refresh the page.');
        }
    }
    
    // Update UI elements
    function updateUI() {
        // Update category dropdown
        const selectedCategory = categorySelect.value;
        
        categorySelect.innerHTML = '';
        appData.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
        
        // Restore selected category if it still exists
        if (selectedCategory && appData.categories.includes(selectedCategory)) {
            categorySelect.value = selectedCategory;
        }
        
        // Update current value display
        updateCurrentValueDisplay();
        
        // Update table
        dataTable.innerHTML = '';
        appData.categories.forEach(category => {
            const counter = appData.counters[category];
            const row = document.createElement('tr');
            
            const categoryCell = document.createElement('td');
            categoryCell.textContent = category;
            
            const valueCell = document.createElement('td');
            valueCell.textContent = counter.value;
            
            const lastUpdatedCell = document.createElement('td');
            lastUpdatedCell.textContent = formatDate(counter.lastUpdated);
            
            const addedTodayCell = document.createElement('td');
            addedTodayCell.textContent = counter.addedToday;
            
            row.appendChild(categoryCell);
            row.appendChild(valueCell);
            row.appendChild(lastUpdatedCell);
            row.appendChild(addedTodayCell);
            
            dataTable.appendChild(row);
        });
    }
    
    // Update current value display based on selected category
    function updateCurrentValueDisplay() {
        const selectedCategory = categorySelect.value;
        if (selectedCategory && appData.counters[selectedCategory]) {
            currentValueDisplay.textContent = appData.counters[selectedCategory].value;
        } else if (appData.categories.length > 0) {
            // Default to first category if none selected
            categorySelect.value = appData.categories[0];
            currentValueDisplay.textContent = appData.counters[appData.categories[0]].value;
        } else {
            currentValueDisplay.textContent = '0';
        }
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }
    
    // Add new category
    async function addCategory() {
        const category = newCategoryInput.value.trim();
        if (!category) {
            alert('Please enter a category name');
            return;
        }
        
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ category })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add category');
            }
            
            appData = await response.json();
            newCategoryInput.value = '';
            updateUI();
        } catch (error) {
            console.error('Error adding category:', error);
            alert(error.message);
        }
    }
    
    // Delete selected category
    async function deleteCategory() {
        const category = categorySelect.value;
        if (!category) {
            alert('Please select a category to delete');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete the category "${category}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`/api/categories/${category}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete category');
            }
            
            appData = await response.json();
            updateUI();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert(error.message);
        }
    }
    
    // Update counter
    async function updateCounter(action) {
        const category = categorySelect.value;
        if (!category) {
            alert('Please select a category');
            return;
        }
        
        try {
            const response = await fetch(`/api/counters/${category}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update counter');
            }
            
            appData = await response.json();
            updateUI();
        } catch (error) {
            console.error('Error updating counter:', error);
            alert(error.message);
        }
    }
    
    // Event Listeners
    addCategoryBtn.addEventListener('click', addCategory);
    deleteCategoryBtn.addEventListener('click', deleteCategory);
    incrementBtn.addEventListener('click', () => updateCounter('increment'));
    incrementHalfBtn.addEventListener('click', () => updateCounter('incrementHalf'));
    decrementBtn.addEventListener('click', () => updateCounter('decrement'));
    decrementHalfBtn.addEventListener('click', () => updateCounter('decrementHalf'));
    resetBtn.addEventListener('click', () => updateCounter('reset'));
    
    // Add change event listener for category select
    categorySelect.addEventListener('change', function() {
        updateCurrentValueDisplay();
    });
    
    // Initialize the app
    fetchData();
});