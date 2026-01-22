'use server'
import { requireAuth } from '@/lib/server-auth'
import z from 'zod'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

const createBookingSchema = z.object({
    testId: z.string().cuid(),
    slotId: z.string().cuid()
})
type BookingResult = { error: string } | void;
export async function createBooking(
    testId: string,
    slotId: string
):Promise<BookingResult>{

    const validatedData = createBookingSchema.safeParse({testId, slotId})
    if(!validatedData.success){
        return {error: validatedData.error.message}
    }
    const session = await requireAuth();
    const userId = session?.user.id;
    if(!userId){
        return {error: 'Not authenticated'}
    }
    if(session.user.role !== 'USER'){
        return {error: 'Only users can create bookings'}
    }
    try{
        const booking = await prisma.$transaction(async(tx)=>{
            const test = await tx.test.findFirst({
                where: {
                    id: testId,
                    isActive: true
                },
            })
            if(!test){
                throw new Error('Test not found or inactive')
            }
            const slot  = await tx.timeslot.findUnique({
                where: {id: slotId},
                select: {
                    testId: true,
                    date: true,
                    startTime: true,
                    currentBooked: true,
                    maxBooked: true,
                    isActive: true
                }
            })
            if (!slot || slot.testId !== testId) {  
                throw new Error('Invalid slot for test')
            }
            if (!slot.isActive) {
                throw new Error('This time slot is no longer available')
            }
            if(slot.currentBooked >= slot.maxBooked){
                throw new Error("slot is fully booked. Choose another slot")
            }
            const slotDate = new Date(`${slot.date}T${slot.startTime}:00`)
            if(slotDate < new Date()){
                throw new Error("Cannot book the past time slot")
            }

            const existingBooking = await tx.booking.findFirst({
                where: {
                    userId: userId,
                    slotId: slotId,
                    status: {in: ['PENDING','CONFIRMED']}
                },
                select: {id: true},
            })
            if(existingBooking){
                throw new Error('You already have a booking for this time slot')
            }
            const newbooking = await tx.booking.create({
                data: {
                    userId: userId,
                    testId: testId,
                    slotId: slotId,
                    amount: test.price,
                    status: "PENDING",
                },
                select: {
                    id: true,
                    bookingNumber: true,
                }
            })
            await tx.timeslot.update({
                where:{
                    id: slotId,
                },
                data:{
                    currentBooked : {increment: 1}
                }
            })
            return;
        })
        
    }catch(error){
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error
        }
        
        console.error('Booking creation error:', error)

        return {
            error: error instanceof Error 
                ? error.message 
                : 'Failed to create booking. Please try again.'
        }
    }

}