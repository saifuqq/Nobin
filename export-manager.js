// Export Manager
const ExportManager = {
    exportToPDF() {
        // แสดง loading toast
        showToast('กำลังสร้างไฟล์ PDF...', 'info');
        
        // สร้าง PDF ด้วย jsPDF
        const doc = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // เพิ่มหัวเอกสาร
        doc.setFontSize(20);
        doc.text('รายงานสินค้า Nobin Shop', 15, 15);
        
        // เพิ่มวันที่
        doc.setFontSize(12);
        doc.text(`วันที่: ${new Date().toLocaleDateString('th-TH')}`, 15, 25);

        // สร้างข้อมูลสำหรับตาราง
        const tableData = [];
        
        // รวบรวมข้อมูลสินค้าจากทุกหมวดหมู่
        Object.entries(products).forEach(([category, items]) => {
            items.forEach(product => {
                tableData.push([
                    product.baseName,
                    category,
                    product.status,
                    product.variants ? product.variants.map(v => `${v.type}: ${v.price}฿`).join('\n') : '-',
                    product.description || '-'
                ]);
            });
        });

        // สร้างตารางด้วย autoTable
        doc.autoTable({
            head: [['ชื่อสินค้า', 'หมวดหมู่', 'สถานะ', 'ราคา (บาท)', 'รายละเอียด']],
            body: tableData,
            startY: 35,
            styles: {
                fontSize: 10,
                cellPadding: 5
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 30 },
                2: { cellWidth: 20 },
                3: { cellWidth: 40 },
                4: { cellWidth: 'auto' }
            },
            headStyles: {
                fillColor: [231, 76, 60],
                textColor: 255,
                fontSize: 12,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            didDrawPage: function(data) {
                // เพิ่มเลขหน้า
                let pageSize = doc.internal.pageSize;
                let pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                doc.text(`หน้า ${data.pageCount}`, data.settings.margin.left, pageHeight - 10);
            }
        });

        // สรุปข้อมูล
        const totalProducts = tableData.length;
        const inStockProducts = tableData.filter(row => row[2] === 'มี').length;
        const outOfStockProducts = tableData.filter(row => row[2].includes('หมด')).length;

        doc.setFontSize(12);
        const summaryY = doc.previousAutoTable.finalY + 15;
        doc.text(`สรุป:`, 15, summaryY);
        doc.text(`- จำนวนสินค้าทั้งหมด: ${totalProducts} รายการ`, 20, summaryY + 7);
        doc.text(`- สินค้าที่มีในสต็อก: ${inStockProducts} รายการ`, 20, summaryY + 14);
        doc.text(`- สินค้าที่หมด: ${outOfStockProducts} รายการ`, 20, summaryY + 21);

        // สร้างชื่อไฟล์ที่มีวันที่และเวลา
        const now = new Date();
        const dateStr = now.toISOString().slice(0,10);
        const timeStr = now.toLocaleTimeString('th-TH').replace(/:/g, '-');
        const fileName = `nobin-shop-products-${dateStr}-${timeStr}.pdf`;

        try {
            // สร้าง Blob จาก PDF
            const pdfBlob = doc.output('blob');
            
            // สร้าง URL สำหรับ Blob
            const blobUrl = URL.createObjectURL(pdfBlob);
            
            // สร้าง element a สำหรับดาวน์โหลด
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = fileName;
            
            // เพิ่ม element เข้าไปใน DOM
            document.body.appendChild(downloadLink);
            
            // คลิกลิงก์อัตโนมัติเพื่อเริ่มดาวน์โหลด
            downloadLink.click();
            
            // ลบ element ออก
            document.body.removeChild(downloadLink);
            
            // เคลียร์ URL object
            URL.revokeObjectURL(blobUrl);

            // แสดง Toast แจ้งเตือนสำเร็จ
            showToast('ส่งออกรายการสินค้าเป็น PDF สำเร็จ', 'success');
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF:', error);
            showToast('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF', 'error');
        }
    }
};