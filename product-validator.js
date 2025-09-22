// Product Validator
const ProductValidator = {
    // ตรวจสอบความสมบูรณ์ของข้อมูลสินค้า
    isValidProduct(product) {
        return product 
            && product.baseName 
            && product.variants 
            && product.variants.length > 0 
            && product.variants.every(v => v.price && v.type);
    },

    // ตรวจสอบและลบสินค้าที่ไม่สมบูรณ์
    cleanupProducts() {
        let totalRemoved = 0;
        
        Object.keys(products).forEach(category => {
            const originalLength = products[category].length;
            
            // กรองเอาเฉพาะสินค้าที่มีข้อมูลครบถ้วน
            products[category] = products[category].filter(product => {
                const isValid = this.isValidProduct(product);
                if (!isValid) {
                    console.log('Removing invalid product:', product);
                }
                return isValid;
            });
            
            const removedCount = originalLength - products[category].length;
            totalRemoved += removedCount;
            
            if (removedCount > 0) {
                console.log(`ลบสินค้าที่ไม่สมบูรณ์ในหมวด ${category} จำนวน ${removedCount} รายการ`);
            }
        });
        
        if (totalRemoved > 0) {
            showToast(`ลบสินค้าที่ไม่สมบูรณ์ทั้งหมด ${totalRemoved} รายการ`, 'warning');
        }
        
        // บันทึกการเปลี่ยนแปลง
        saveProducts();
        
        return totalRemoved;
    }
};