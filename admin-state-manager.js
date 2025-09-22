// Admin Panel State Manager
const AdminStateManager = {
    hasUnsavedChanges: false,
    
    // แจ้งเตือนการมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
    markUnsavedChanges() {
        this.hasUnsavedChanges = true;
        this.updateSaveButton();
        this.setupBeforeUnloadWarning();
    },
    
    // ล้างสถานะการเปลี่ยนแปลงหลังบันทึก
    clearUnsavedChanges() {
        this.hasUnsavedChanges = false;
        this.updateSaveButton();
        this.removeBeforeUnloadWarning();
    },
    
    // อัพเดทสถานะปุ่มบันทึก
    updateSaveButton() {
        const saveButton = document.getElementById('adminSaveChanges');
        if (saveButton) {
            saveButton.disabled = !this.hasUnsavedChanges;
            saveButton.classList.toggle('opacity-50', !this.hasUnsavedChanges);
            saveButton.classList.toggle('hover:bg-blue-600', this.hasUnsavedChanges);
        }
    },
    
    // ตั้งค่าการเตือนก่อนออกจากหน้า
    setupBeforeUnloadWarning() {
        window.onbeforeunload = (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?';
                return e.returnValue;
            }
        };
    },
    
    // ลบการเตือนก่อนออกจากหน้า
    removeBeforeUnloadWarning() {
        window.onbeforeunload = null;
    },
    
    // บันทึกการเปลี่ยนแปลงทั้งหมด
    async saveAllChanges() {
        try {
            showToast('กำลังบันทึกการเปลี่ยนแปลงทั้งหมด...', 'info');
            
            // บันทึกข้อมูลสินค้า
            saveProducts();
            
            // บันทึกการเปลี่ยนแปลงที่ค้างอยู่ทั้งหมด
            const backupData = {
                products: {},
                timestamp: new Date().toISOString(),
                changes: []
            };

            for (const change of this.pendingChanges) {
                backupData.changes.push(change);
                switch (change.type) {
                    case 'product':
                        if (window.GoogleSheetSync) {
                            await GoogleSheetSync.updateProductStatus(change.data.product, change.data.category);
                            // เก็บข้อมูลสินค้าลงในข้อมูลสำรอง
                            if (!backupData.products[change.data.category]) {
                                backupData.products[change.data.category] = [];
                            }
                            backupData.products[change.data.category].push(change.data.product);
                        }
                        break;
                    case 'theme':
                        if (window.localStorage) {
                            localStorage.setItem('theme', change.data);
                        }
                        break;
                }
            }

            // สำรองข้อมูลลง Google Sheet
            try {
                if (window.GoogleSheetSync) {
                    showToast('กำลังสำรองข้อมูลลง Google Sheet...', 'info');
                    
                    // สร้าง JSON string ของข้อมูลทั้งหมด
                    const backupJson = JSON.stringify(backupData, null, 2);
                    
                    // สร้างข้อมูลสำหรับบันทึกลง sheet
                    const backupRow = [
                        new Date().toISOString(),  // เวลาที่บันทึก
                        backupJson,                // ข้อมูลทั้งหมด
                        'auto-backup'              // ประเภทการบันทึก
                    ];

                    // บันทึกลง Google Sheet
                    await GoogleSheetSync.appendToSheet(
                        this.BACKUP_SHEET_ID,
                        'Backups',   // ชื่อ sheet
                        [backupRow]  // ข้อมูลที่จะเพิ่ม (เป็น array ของ rows)
                    );

                    showToast('สำรองข้อมูลสำเร็จ', 'success');
                }
            } catch (backupError) {
                console.error('เกิดข้อผิดพลาดในการสำรองข้อมูล:', backupError);
                showToast('ไม่สามารถสำรองข้อมูลได้: ' + backupError.message, 'warning');
            }
            
            // บันทึกการตั้งค่าอื่นๆ
            if (window.localStorage) {
                localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
                localStorage.setItem('lastSaved', new Date().toISOString());
            }
            
            this.clearUnsavedChanges();
            showToast('บันทึกการเปลี่ยนแปลงทั้งหมดเรียบร้อย ✅', 'success');
            
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการบันทึก:', error);
            showToast('เกิดข้อผิดพลาดในการบันทึก: ' + error.message, 'error');
        }
    },
    
    // เพิ่มปุ่มบันทึกในแผงควบคุม
    addSaveButton() {
        // หา container สำหรับปุ่มในแผงควบคุม
        const buttonContainer = document.querySelector('.admin-panel-footer .flex');
        if (!buttonContainer) return;
        
        // สร้างปุ่มบันทึกการเปลี่ยนแปลง
        const saveButton = document.createElement('button');
        saveButton.id = 'adminSaveChanges';
        saveButton.className = 'bg-green-500 text-white px-6 py-2 rounded-xl shadow font-semibold text-lg flex items-center gap-2 transition-all duration-200 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-500';
        saveButton.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>บันทึกการเปลี่ยนแปลงทั้งหมด</span>
        `;
        
        saveButton.onclick = () => this.saveAllChanges();
        saveButton.disabled = true;
        
        // เพิ่มปุ่มบันทึกเข้าไปในตำแหน่งแรกของ container
        buttonContainer.insertBefore(saveButton, buttonContainer.firstChild);
    }
};