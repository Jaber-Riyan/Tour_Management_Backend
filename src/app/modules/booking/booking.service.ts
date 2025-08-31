import httpStatus from "http-status-codes";
import { User } from "../user/user.model"
import { BOOKING_STATUS, IBooking } from "./booking.interface"
import AppError from "../../errorHelpers/AppError";
import { Tour } from "../tour/tour.model";
import { Booking } from "./booking.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { v4 as uuidv4 } from "uuid"

const getTransactionId = () => {
    return `tran_${Date.now()}_${uuidv4()}`
}

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

        // Transaction Commit and End the Session
        await session.commitTransaction() // Transaction
        session.endSession()

        return updatedBooking
    }
    catch (error: any) {
        await session.abortTransaction() // Rollback
        session.endSession()
        throw error
    }
}

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