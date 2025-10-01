"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.PaymentService = void 0;
const cloudinary_config_1 = require("../../config/cloudinary.config");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const invoice_1 = require("../../utils/invoice");
const sendEmail_1 = require("../../utils/sendEmail");
const booking_interface_1 = require("../booking/booking.interface");
const booking_model_1 = require("../booking/booking.model");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const payment_interface_1 = require("./payment.interface");
const payment_model_1 = require("./payment.model");
const http_status_codes_1 = __importStar(require("http-status-codes"));
const user_model_1 = require("../user/user.model");
const initPayment = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findOne({ booking: bookingId });
    if (!payment) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Payment Not Found. You have not booked this tour");
    }
    if (payment.status === payment_interface_1.PAYMENT_STATUS.PAID) {
        return {
            success: true,
            message: "Payment already completed"
        };
    }
    const booking = yield booking_model_1.Booking.findById(payment.booking);
    const userAddress = (booking === null || booking === void 0 ? void 0 : booking.user).address;
    const userEmail = (booking === null || booking === void 0 ? void 0 : booking.user).email;
    const userPhoneNumber = (booking === null || booking === void 0 ? void 0 : booking.user).phone;
    const userName = (booking === null || booking === void 0 ? void 0 : booking.user).name;
    const sslPayload = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId
    };
    const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
    return {
        paymentUrl: sslPayment.GatewayPageURL
    };
});
const successPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // Update Booking Status to COMPLETE
    // Update Payment Status to PAID
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        // Update Payment Status 
        let updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({
            transactionId: query.transactionId
        }, {
            status: payment_interface_1.PAYMENT_STATUS.PAID
        }, {
            new: true,
            runValidators: true,
            session
        });
        if (!updatedPayment) {
            throw new AppError_1.default(401, "Payment Not Found");
        }
        // Update Booking Status 
        const updatedBooking = yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.COMPLETE
        }, {
            new: true,
            runValidators: true,
            session
        })
            .populate("tour", "title location description startDate endDate")
            .populate("user", "name email address phone ");
        if (!updatedBooking) {
            throw new AppError_1.default(401, "Booking Not Found");
        }
        // Invoice PDF Payload
        const invoiceData = {
            bookingDate: updatedBooking.createdAt,
            guestCount: updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.guestCount,
            totalAmount: updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.amount,
            transactionId: updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.transactionId,
            tourTitle: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.tour).title,
            userName: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).name
        };
        // Send Mail With Invoice Payment 
        const pdfBuffer = yield (0, invoice_1.generatePdf)(invoiceData);
        const cloudinaryResult = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(pdfBuffer, "invoice");
        if (!cloudinaryResult) {
            throw new AppError_1.default(401, "Error uploading pdf");
        }
        updatedPayment = yield payment_model_1.Payment.findByIdAndUpdate(updatedPayment._id, { invoiceUrl: cloudinaryResult.secure_url }, { new: true, runValidators: true, session });
        if (!updatedPayment) {
            throw new AppError_1.default(401, "Payment Not Found");
        }
        const invoiceEmailData = {
            name: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).name,
            email: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).email,
            phone: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).phone,
            address: (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).address,
            paymentId: updatedPayment._id,
            transactionId: updatedPayment.transactionId,
            amount: updatedPayment.amount,
            bookingDate: new Date(updatedBooking.createdAt).toLocaleString(),
            invoiceLink: updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.invoiceUrl
        };
        yield (0, sendEmail_1.sendEmail)({
            to: updatedBooking.user.email,
            subject: "Your Booking Invoice",
            templateName: "invoice",
            templateData: invoiceEmailData,
            attachments: [
                {
                    filename: "invoice.pdf",
                    content: pdfBuffer,
                    contentType: "application/pdf"
                }
            ]
        });
        // Transaction Commit and End the Session
        yield session.commitTransaction(); // Transaction
        session.endSession();
        return {
            success: true,
            message: "Payment Complete Successfully"
        };
    }
    catch (error) {
        yield session.abortTransaction(); // Rollback
        session.endSession();
        throw error;
    }
});
const failPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // Update Booking Status to FAILED
    // Update Payment Status to FAILED
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        // Update Payment Status 
        const updatePayment = yield payment_model_1.Payment.findOneAndUpdate({
            transactionId: query.transactionId
        }, {
            status: payment_interface_1.PAYMENT_STATUS.FAILED
        }, {
            new: true,
            runValidators: true,
            session
        });
        // Update Booking Status 
        yield booking_model_1.Booking.findByIdAndUpdate(updatePayment === null || updatePayment === void 0 ? void 0 : updatePayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.FAILED
        }, {
            runValidators: true,
            session
        });
        // Transaction Commit and End the Session
        yield session.commitTransaction(); // Transaction
        session.endSession();
        return {
            success: false,
            message: "Payment Failed"
        };
    }
    catch (error) {
        yield session.abortTransaction(); // Rollback
        session.endSession();
        throw error;
    }
});
const cancelPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // Update Booking Status to CANCEL
    // Update Payment Status to CANCELLED
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        // Update Payment Status 
        const updatePayment = yield payment_model_1.Payment.findOneAndUpdate({
            transactionId: query.transactionId
        }, {
            status: payment_interface_1.PAYMENT_STATUS.CANCELLED
        }, {
            new: true,
            runValidators: true,
            session
        });
        // Update Booking Status 
        yield booking_model_1.Booking.findByIdAndUpdate(updatePayment === null || updatePayment === void 0 ? void 0 : updatePayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.CANCEL
        }, {
            runValidators: true,
            session
        });
        // Transaction Commit and End the Session
        yield session.commitTransaction(); // Transaction
        session.endSession();
        return {
            success: false,
            message: "Payment Canceled"
        };
    }
    catch (error) {
        yield session.abortTransaction(); // Rollback
        session.endSession();
        throw error;
    }
});
const getInvoiceDownloadUrl = (paymentId, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findById(paymentId)
        .populate("booking");
    const user = yield user_model_1.User.findById((payment === null || payment === void 0 ? void 0 : payment.booking).user);
    if (decodedToken.userId !== (user === null || user === void 0 ? void 0 : user.id)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "You Are Not Valid User Of This Invoice");
    }
    if (!payment) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Payment Not Found");
    }
    if (!payment.invoiceUrl) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "No Invoice Found");
    }
    return payment.invoiceUrl;
});
exports.PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl
};
