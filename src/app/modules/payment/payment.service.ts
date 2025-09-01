import AppError from "../../errorHelpers/AppError";
import { BOOKING_STATUS } from "../booking/booking.interface"
import { Booking } from "../booking/booking.model"
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
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
        const updatePayment = await Payment.findOneAndUpdate(
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

        // Update Booking Status 
        await Booking.findByIdAndUpdate(
            updatePayment?.booking,
            {
                status: BOOKING_STATUS.COMPLETE
            },
            {
                new: true,
                runValidators: true,
                session
            }
        )

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