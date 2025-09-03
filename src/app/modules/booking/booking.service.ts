import httpStatus from "http-status-codes";
import { User } from "../user/user.model"
import { BOOKING_STATUS, IBooking } from "./booking.interface"
import AppError from "../../errorHelpers/AppError";
import { Tour } from "../tour/tour.model";
import { Booking } from "./booking.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { v4 as uuidv4 } from "uuid"
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { getTransactionId } from "../../utils/getTransactionId";

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
    const transactionId = getTransactionId()

    const session = await Booking.startSession()
    session.startTransaction()

    try {
        const user = await User.findById(userId)

        if (!user?.phone || !user?.address) {
            throw new AppError(httpStatus.BAD_REQUEST, "Please Update Your Profile to Book a Tour")
        }

        const tour = await Tour.findById(payload.tour).select("costFrom")

        if (!tour?.costFrom) {
            throw new AppError(httpStatus.BAD_REQUEST, "No Tour Cost Found!")
        }

        const amount = Number(tour.costFrom) * Number(payload.guestCount)

        const booking = await Booking.create([
            {
                user: userId,
                status: BOOKING_STATUS.PENDING,
                ...payload
            }
        ], { session })

        const payment = await Payment.create([
            {
                booking: booking[0]._id,
                status: PAYMENT_STATUS.UNPAID,
                transactionId: transactionId,
                amount: amount
            }
        ], { session })

        const updatedBooking = await Booking
            .findByIdAndUpdate(
                booking[0]._id,
                { payment: payment[0]._id },
                { new: true, runValidators: true, session }
            )
            .populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment")

        const userAddress = (updatedBooking?.user as any).address
        const userEmail = (updatedBooking?.user as any).email
        const userPhoneNumber = (updatedBooking?.user as any).phone
        const userName = (updatedBooking?.user as any).name

        const sslPayload: ISSLCommerz = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: amount,
            transactionId: transactionId
        }

        const sslPayment = await SSLService.sslPaymentInit(sslPayload)

        // console.log(sslPayment);

        // Transaction Commit and End the Session
        await session.commitTransaction() // Transaction
        session.endSession()

        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updatedBooking
        }
    }
    catch (error: any) {
        await session.abortTransaction() // Rollback
        session.endSession()
        throw error
    }
}

// Frontend(localhost:5173) -> User -> Tour -> Booking(Pending) -> Payment(Unpaid) -> SSLCommerz Page -> Payment Complete -> Backend(localhost:5000) -> Update Booking(CONFIRM) & Payment(PAID) -> Redirect to Frontend -> Frontend(localhost:5173/payment/success)

// Frontend(localhost:5173) -> User -> Tour -> Booking(Pending) -> Payment(Unpaid) -> SSLCommerz Page -> Payment Fail/Cancel -> Backend(localhost:5000) -> Update Booking(FAILED) & Payment(FAILED) -> Redirect to Frontend -> Frontend(localhost:5173/payment/fail)

const getUserBookings = () => {
    return {}
}

const getBookingById = async () => {
    return {}
}

const getAllBookings = async () => {
    return {}
}

const updateBookingStatus = async () => {
    return {}
}

export const BookingService = {
    createBooking,
    getUserBookings,
    getBookingById,
    getAllBookings,
    updateBookingStatus
}