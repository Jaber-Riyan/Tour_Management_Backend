// =================== PDF GENERATOR ===================
import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";

export interface IInvoiceData {
    transactionId: string;
    bookingDate: Date;
    userName: string;
    tourTitle: string;
    guestCount: number;
    totalAmount: number;
}

export const generatePdf = async (
    invoiceData: IInvoiceData
): Promise<Buffer<ArrayBufferLike>> => {
    try {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: "A4", margin: 50 });

            const buffer: Uint8Array[] = [];
            doc.on("data", (chunk) => buffer.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffer)));
            doc.on("error", (err) => reject(err));

            // ========== HEADER ==========
            doc
                .fillColor("#007bff")
                .fontSize(26)
                .text("PH Tour Management", { align: "left" });

            doc
                .fontSize(10)
                .fillColor("gray")
                .text("123 Main Street, Dhaka, Bangladesh")
                .text("Email: support@phtour.com | Phone: +880 1700-000000");

            doc.moveDown(1);

            doc
                .fillColor("black")
                .fontSize(22)
                .text("INVOICE", { align: "right" });

            doc
                .fontSize(10)
                .text(`Date: ${new Date().toLocaleDateString()}`, {
                    align: "right",
                });

            doc.moveDown(2);

            // ========== CUSTOMER INFO ==========
            doc
                .fontSize(14)
                .fillColor("#333")
                .text("Bill To:", { underline: true });

            doc
                .fontSize(12)
                .text(`Name: ${invoiceData.userName}`)
                .text(`Transaction ID: ${invoiceData.transactionId}`)
                .text(`Booking Date: ${invoiceData.bookingDate.toDateString()}`);

            doc.moveDown(2);

            // ========== BOOKING DETAILS ==========
            doc.fontSize(14).fillColor("#333").text("Booking Details", {
                underline: true,
            });
            doc.moveDown(0.5);

            // Table column widths
            const tableTop = doc.y;
            const col1 = 50;   // Tour Title start
            const col2 = 350;  // Guests
            const col3 = 450;  // Amount
            const rowHeight = 25;

            // Table Header Background
            doc.rect(col1, tableTop, 500, rowHeight).fill("#007bff").stroke();
            doc.fillColor("white").fontSize(12)
                .text("Tour Title", col1 + 10, tableTop + 7)
                .text("Guests", col2 + 10, tableTop + 7)
                .text("Amount", col3 + 10, tableTop + 7);

            // Reset fill for rows
            doc.fillColor("black");

            // Row
            const rowY = tableTop + rowHeight;
            doc.rect(col1, rowY, 500, rowHeight).stroke(); // border box
            doc.fontSize(12)
                .text(invoiceData.tourTitle, col1 + 10, rowY + 7, { width: 280 })
                .text(`${invoiceData.guestCount}`, col2 + 10, rowY + 7, { width: 50 })
                .text(`BDT ${invoiceData.totalAmount.toFixed(2)}`, col3 + 10, rowY + 7, { width: 80 });

            doc.moveDown(5);

            // ========== SUMMARY ==========
            const subtotal = invoiceData.totalAmount;
            const total = subtotal;

            doc.moveDown(2);

            doc.fontSize(14).fillColor("#333").text("Summary", {
                align: "center",
                underline: true,
            });

            doc.moveDown(0.5);

            // Summary box
            const boxWidth = 250;
            const boxHeight = 70;
            const pageWidth = doc.page.width;
            const startX = (pageWidth - boxWidth) / 2; // center horizontally
            const startY = doc.y;

            doc
                .rect(startX, startY, boxWidth, boxHeight)
                .strokeColor("#007bff")
                .lineWidth(1)
                .stroke();

            doc.fontSize(12).fillColor("black");
            doc.text(`Subtotal: BDT ${subtotal.toFixed(2)}`, startX + 15, startY + 10);
            doc.text(`Tax (0%): NO TAX`, startX + 15, startY + 30);
            doc.text(`Total: BDT ${total.toFixed(2)}`, startX + 15, startY + 50, {
                width: boxWidth - 30,
                align: "right",
            });

            doc.moveDown(6);

            // ========== FOOTER ==========
            doc
                .fontSize(12)
                .fillColor("gray")
                .text("Thank you for booking with PH Tour Management!", {
                    align: "center",
                });

            doc
                .fontSize(10)
                .text("This is a system generated invoice.", { align: "center" });

            doc.end();
        });
    } catch (error: any) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Pdf creation error ${error.message}`
        );
    }
};
