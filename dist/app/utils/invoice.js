"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePdf = void 0;
// =================== PDF GENERATOR ===================
const pdfkit_1 = __importDefault(require("pdfkit"));
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = require("http-status-codes");
const generatePdf = (invoiceData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
            const buffer = [];
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
            const col1 = 50; // Tour Title start
            const col2 = 350; // Guests
            const col3 = 450; // Amount
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
    }
    catch (error) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Pdf creation error ${error.message}`);
    }
});
exports.generatePdf = generatePdf;
