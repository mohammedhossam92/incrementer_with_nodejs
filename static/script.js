document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded successfully!');
    
    // DOM Elements
    const newCategoryInput = document.getElementById('new-category');
    const addCategoryBtn = document.getElementById('add-category');
    const deleteCategoryBtn = document.getElementById('delete-category');
    const categorySelect = document.getElementById('category-select');
    const incrementBtn = document.getElementById('increment');
    const incrementHalfBtn = document.getElementById('increment-half');
    const decrementBtn = document.getElementById('decrement');
    const decrementHalfBtn = document.getElementById('decrement-half');
    const resetBtn = document.getElementById('reset');
    const currentValueDisplay = document.getElementById('current-value');
    const tableBody = document.querySelector('#data-table tbody');
    
    // Check if elements exist
    if (!addCategoryBtn || !deleteCategoryBtn || !incrementBtn || !decrementBtn) {
        console.error('Some buttons not found in the DOM');
    } else {
        console.log('All buttons found in the DOM');
    }
    
    // Load initial data
    loadCategories();
    
    // Event Listeners
    addCategoryBtn.addEventListener('click', function() {
        console.log('Add category button clicked');
        addCategory();
    });
    
    deleteCategoryBtn.addEventListener('click', function() {
        console.log('Delete category button clicked');
        deleteCategory();
    });
    
    incrementBtn.addEventListener('click', function() {
        console.log('Increment button clicked');
        updateValue('increment');
    });
    
    incrementHalfBtn.addEventListener('click', function() {
        console.log('Increment half button clicked');
        updateValue('increment_half');
    });
    
    decrementBtn.addEventListener('click', function() {
        console.log('Decrement button clicked');
        updateValue('decrement');
    });
    
    decrementHalfBtn.addEventListener('click', function() {
        console.log('Decrement half button clicked');
        updateValue('decrement_half');
    });
    
    resetBtn.addEventListener('click', function() {
        console.log('Reset button clicked');
        resetCategory();
    });
    
    categorySelect.addEventListener('change', function() {
        console.log('Category selected:', categorySelect.value);
        updateCurrentValue();
    });
    
    // Functions
    async function loadCategories() {
        try {
            showLoading(true);
            const response = await fetch('/categories');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Categories loaded:', data);
            
            updateCategorySelect(data);
            updateTable(data);
            
            if (data.length > 0) {
                updateCurrentValue();
            }
            
            showLoading(false);
        } catch (error) {
            console.error('Error loading categories:', error);
            showLoading(false);
        }
    }
    
    function updateCategorySelect(categories) {
        categorySelect.innerHTML = '';
        
        if (categories.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'No categories available';
            option.disabled = true;
            categorySelect.appendChild(option);
            return;
        }
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    function updateTable(categories) {
        tableBody.innerHTML = '';
        
        if (categories.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.textContent = 'No data available';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }
        
        categories.forEach(category => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = category.name;
            
            const valueCell = document.createElement('td');
            valueCell.textContent = category.value;
            
            const updatedCell = document.createElement('td');
            updatedCell.textContent = category.last_updated;
            
            const clicksCell = document.createElement('td');
            clicksCell.textContent = category.clicks_today;
            
            row.appendChild(nameCell);
            row.appendChild(valueCell);
            row.appendChild(updatedCell);
            row.appendChild(clicksCell);
            
            tableBody.appendChild(row);
        });
    }
    
    async function addCategory() {
        const name = newCategoryInput.value.trim();
        
        if (!name) {
            showNotification('Please enter a category name', 'error');
            return;
        }
        
        try {
            showLoading(true);
            
            const response = await fetch('/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }
            
            showNotification('Category added successfully', 'success');
            newCategoryInput.value = '';
            await loadCategories();
            
        } catch (error) {
            console.error('Error adding category:', error);
            showNotification(error.message, 'error');
            showLoading(false);
        }
    }
    
    async function deleteCategory() {
        const name = categorySelect.value;
        
        if (!name) {
            showNotification('Please select a category to delete', 'error');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }
        
        try {
            showLoading(true);
            
            const response = await fetch(`/categories/${name}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }
            
            showNotification('Category deleted successfully', 'success');
            await loadCategories();
            
        } catch (error) {
            console.error('Error deleting category:', error);
            showNotification(error.message, 'error');
            showLoading(false);
        }
    }
    
    async function updateValue(action) {
        const name = categorySelect.value;
        
        if (!name) {
            showNotification('Please select a category first', 'error');
            return;
        }
        
        try {
            showLoading(true);
            
            const response = await fetch(`/categories/${name}/${action}`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            currentValueDisplay.textContent = data.value;
            
            await loadCategories();
            
        } catch (error) {
            console.error(`Error ${action} category:`, error);
            showNotification(error.message, 'error');
            showLoading(false);
        }
    }
    
    async function resetCategory() {
        const name = categorySelect.value;
        
        if (!name) {
            showNotification('Please select a category to reset', 'error');
            return;
        }
        
        if (!confirm(`Are you sure you want to reset "${name}" to zero?`)) {
            return;
        }
        
        try {
            showLoading(true);
            
            const response = await fetch(`/categories/${name}/reset`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }
            
            showNotification('Category reset successfully', 'success');
            currentValueDisplay.textContent = '0';
            await loadCategories();
            
        } catch (error) {
            console.error('Error resetting category:', error);
            showNotification(error.message, 'error');
            showLoading(false);
        }
    }
    
    function updateCurrentValue() {
        const name = categorySelect.value;
        
        if (!name) {
            currentValueDisplay.textContent = '0';
            return;
        }
        
        const rows = tableBody.querySelectorAll('tr');
        
        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            
            if (cells.length > 0 && cells[0].textContent === name) {
                currentValueDisplay.textContent = cells[1].textContent;
                break;
            }
        }
    }
    
    function showLoading(isLoading) {
        // You can implement a loading indicator here
        document.body.style.cursor = isLoading ? 'wait' : 'default';
        
        // Disable buttons during loading
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = isLoading;
        });
    }
    
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transform: translateX(0);
            transition: transform 0.5s, opacity 0.5s;
        }
        
        .notification.success {
            background-color: #4cc9f0;
        }
        
        .notification.error {
            background-color: #f72585;
        }
        
        .notification.hide {
            transform: translateX(100%);
            opacity: 0;
        }
    `;
    document.head.appendChild(style);
});