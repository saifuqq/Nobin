// ฟังก์ชันควบคุมสถานะสินค้าในฟอร์มเพิ่ม/แก้ไขสินค้า
function setProductStock(inStock) {
    const currentProduct = getCurrentEditingProduct();
    if (!currentProduct) return;

    // อัพเดทสถานะสินค้า
    currentProduct.status = inStock ? 'มี' : 'ของหมด';
    currentProduct.inStock = inStock;

    // อัพเดท UI
    updateStockButtonsState(inStock);
    
    // แสดงการแจ้งเตือน
    showToast(
        inStock 
            ? `สินค้า "${currentProduct.baseName}" กลับมามีในสต็อกแล้ว` 
            : `สินค้า "${currentProduct.baseName}" ถูกแจ้งว่าสินค้าหมดแล้ว`,
        inStock ? 'success' : 'warning'
    );

    // แจ้งเตือนว่ามีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
    if (window.AdminStateManager) {
        AdminStateManager.markUnsavedChanges();
    }

    // บันทึกการเปลี่ยนแปลง
    saveProducts();

    // อัพเดทการแสดงผลสินค้า
    if (typeof renderProducts === 'function') {
        renderProducts();
    }
    if (typeof renderAdminProductListByCategory === 'function') {
        renderAdminProductListByCategory();
    }
}

// ฟังก์ชันอัพเดทสถานะปุ่มควบคุมสต็อก
function updateStockButtonsState(inStock) {
    const markInStock = document.getElementById('markInStock');
    const markOutOfStock = document.getElementById('markOutOfStock');
    
    if (markInStock && markOutOfStock) {
        // ปรับสถานะปุ่ม
        markInStock.disabled = inStock;
        markOutOfStock.disabled = !inStock;
        
        // ปรับความโปร่งใสของปุ่มที่ถูก disable
        markInStock.style.opacity = inStock ? '0.5' : '1';
        markOutOfStock.style.opacity = inStock ? '1' : '0.5';
    }
}

// ฟังก์ชันดึงข้อมูลสินค้าที่กำลังแก้ไข
function getCurrentEditingProduct() {
    const category = document.getElementById('editProductCategory').value;
    const index = parseInt(document.getElementById('editProductIndex').value);
    
    if (!products[category] || !products[category][index]) {
        showToast('ไม่พบข้อมูลสินค้า', 'error');
        return null;
    }
    
    return products[category][index];
}

// อัพเดท showEditProductModal function เพื่อแสดงสถานะสต็อกเมื่อเปิดฟอร์ม
const originalShowEditProductModal = window.showEditProductModal;
window.showEditProductModal = function(category, index) {
    originalShowEditProductModal(category, index);
    
    if (category && index !== undefined) {
        const product = products[category][index];
        if (product) {
            updateStockButtonsState(product.status === 'มี');
        }
    } else {
        // กรณีเพิ่มสินค้าใหม่
        updateStockButtonsState(true);
    }
};