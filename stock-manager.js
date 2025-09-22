// Product stock management functions
const stockManager = {
    // Toggle product stock status
    toggleProductStock(category, idx) {
        const product = products[category][idx];
        if (!product) return;

        // Toggle status
        if (product.status === 'ของหมด' || product.status === '❌ ของหมด') {
            product.status = 'มี';
            product.inStock = true;
            // Update cart items
            if (Array.isArray(cart)) {
                cart.forEach(item => {
                    if (item.baseName === product.baseName && item.category === category) {
                        item.isOutOfStock = false;
                    }
                });
            }
            showToast(`สินค้า "${product.baseName}" กลับมามีในสต็อกแล้ว`, 'success');
        } else {
            product.status = 'ของหมด';
            product.inStock = false;
            // Update cart items
            if (Array.isArray(cart)) {
                cart.forEach(item => {
                    if (item.baseName === product.baseName && item.category === category) {
                        item.isOutOfStock = true;
                    }
                });
            }
            showToast(`สินค้า "${product.baseName}" ถูกแจ้งว่าสินค้าหมดแล้ว`, 'warning');
        }

        // Save to localStorage
        localStorage.setItem('products', JSON.stringify(products));

        // Update UI
        if (typeof updateCartDisplay === 'function') {
            updateCartDisplay();
        }
        if (typeof renderProducts === 'function') {
            renderProducts();
        }
        if (typeof renderAdminProductListByCategory === 'function') {
            renderAdminProductListByCategory();
        }
    }
};

// Export to global scope
window.stockManager = stockManager;