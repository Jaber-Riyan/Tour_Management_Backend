import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { sendEmail } from "../../utils/sendEmail";
import { BOOKING_STATUS } from "../booking/booking.interface"
import { Booking } from "../booking/booking.model"
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { ITour } from "../tour/tour.interface";
import { IUser } from "../user/user.interface";
import { PAYMENT_STATUS } from "./payment.interface"
import { Payment } from "./payment.model"
import httpStatus from "http-status-codes"

const initPayment = async (bookingId: string) => {

    const payment = await Payment.findOne({ booking: bookingId })

    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment Not Found. You have not booked this tour")
    }

    if (payment.status === PAYMENT_STATUS.PAID) {
        return {
            success: true,
            message: "Payment already completed"
        }
    }

    const booking = await Booking.findById(payment.booking)

    const userAddress = (booking?.user as any).address
    const userEmail = (booking?.user as any).email
    const userPhoneNumber = (booking?.user as any).phone
    const userName = (booking?.user as any).name

    const sslPayload: ISSLCommerz = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId
    }

    const sslPayment = await SSLService.sslPaymentInit(sslPayload)

    return {
        paymentUrl: sslPayment.GatewayPageURL
    }

};

const successPayment = async (query: Record<string, string>) => {
    // Update Booking Status to COMPLETE
    // Update Payment Status to PAID

    const session = await Booking.startSession()
    session.startTransaction()

    try {
        // Update Payment Status 
        let updatedPayment = await Payment.findOneAndUpdate(
            {
                transactionId: query.transactionId
            },
            {
                status: PAYMENT_STATUS.PAID
            },
            {
                new: true,
                runValidators: true,
                session
            }
        )

        if (!updatedPayment) {
            throw new AppError(401, "Payment Not Found")
        }

        // Update Booking Status 
        const updatedBooking = await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            {
                status: BOOKING_STATUS.COMPLETE
            },
            {
                new: true,
                runValidators: true,
                session
            }
        )
            .populate("tour", "title location description startDate endDate")
            .populate("user", "name email address phone ")

        if (!updatedBooking) {
            throw new AppError(401, "Booking Not Found")
        }

        // Invoice PDF Payload
        const invoiceData: IInvoiceData = {
            bookingDate: (updatedBooking.createdAt as unknown as Date),
            guestCount: updatedBooking?.guestCount,
            totalAmount: updatedPayment?.amount,
            transactionId: updatedPayment?.transactionId,
            tourTitle: (updatedBooking?.tour as unknown as ITour).title,
            userName: (updatedBooking?.user as unknown as IUser).name
        }

        // Send Mail With Invoice Payment 
        const pdfBuffer = await generatePdf(invoiceData)

        const cloudinaryResult = await uploadBufferToCloudinary(pdfBuffer, "invoice")

        if (!cloudinaryResult) {
            throw new AppError(401, "Error uploading pdf")
        }

        updatedPayment = await Payment.findByIdAndUpdate(updatedPayment._id, { invoiceUrl: cloudinaryResult.secure_url }, { new: true, runValidators: true, session })

        if (!updatedPayment) {
            throw new AppError(401, "Payment Not Found")
        }

        const invoiceEmailData = {
            name: (updatedBooking?.user as unknown as IUser).name,
            email: (updatedBooking?.user as unknown as IUser).email,
            phone: (updatedBooking?.user as unknown as IUser).phone,
            address: (updatedBooking?.user as unknown as IUser).address,
            paymentId: updatedPayment._id,
            transactionId: updatedPayment.transactionId,
            amount: updatedPayment.amount,
            bookingDate: new Date(updatedBooking.createdAt).toLocaleString(),
            invoiceLink: updatedPayment?.invoiceUrl
        }

        await sendEmail({
            to: (updatedBooking.user as unknown as IUser).email,
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
        })

        // Transaction Commit and End the Session
        await session.commitTransaction() // Transaction
        session.endSession()

        return {
            success: true,
            message: "Payment Complete Successfully"
        }
    }
    catch (error) {
        await session.abortTransaction() // Rollback
        session.endSession()
        throw error
    }

}

const failPayment = async (query: Record<string, string>) => {
    // Update Booking Status to FAILED
    // Update Payment Status to FAILED

    const session = await Booking.startSession()
    session.startTransaction()

    try {
        // Update Payment Status 
        const updatePayment = await Payment.findOneAndUpdate(
            {
                transactionId: query.transactionId
            },
            {
                status: PAYMENT_STATUS.FAILED
            },
            {
                new: true,
                runValidators: true,
                session
            }
        )

        // Update Booking Status 
        await Booking.findByIdAndUpdate(
            updatePayment?.booking,
            {
                status: BOOKING_STATUS.FAILED
            },
            {
                runValidators: true,
                session
            }
        )

        // Transaction Commit and End the Session
        await session.commitTransaction() // Transaction
        session.endSession()

        return {
            success: false,
            message: "Payment Failed"
        }
    }
    catch (error) {
        await session.abortTransaction() // Rollback
        session.endSession()
        throw error
    }
}

const cancelPayment = async (query: Record<string, string>) => {
    // Update Booking Status to CANCEL
    // Update Payment Status to CANCELLED

    const session = await Booking.startSession()
    session.startTransaction()

    try {
        // Update Payment Status 
        const updatePayment = await Payment.findOneAndUpdate(
            {
                transactionId: query.transactionId
            },
            {
                status: PAYMENT_STATUS.CANCELLED
            },
            {
                new: true,
                runValidators: true,
                session
            }
        )

        // Update Booking Status 
        await Booking.findByIdAndUpdate(
            updatePayment?.booking,
            {
                status: BOOKING_STATUS.CANCEL
            },
            {
                runValidators: true,
                session
            }
        )

        // Transaction Commit and End the Session
        await session.commitTransaction() // Transaction
        session.endSession()

        return {
            success: false,
            message: "Payment Canceled"
        }
    }
    catch (error) {
        await session.abortTransaction() // Rollback
        session.endSession()
        throw error
    }
}

export const PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment
}