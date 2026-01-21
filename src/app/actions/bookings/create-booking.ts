'use server'
import { requireAuth } from '@/lib/server-auth'
import z from 'zod'
import prisma from '@/lib/prisma'

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
                    startTime: true,
                    capacity: true,
                    maxCapacity: true,
                }
            })
            if (!slot || slot.testId !== testId) {  
                throw new Error('Invalid slot for test')
            }

            if(slot.capacity){

            }
            const existingBooking = await tx.booking.findFirst({
                where: {
                    userId: userId,
                    slotId: slotId,
                },
                select: {id: true},
            })
            if(existingBooking){
                throw new Error('Slot already booked')
            }
            const newbooking = await tx.booking.create({
                data: {
                    userId: userId,
                    testId: testId,
                    slotId: slotId,
                    status: 'PENDING',
                },
                select: {
                    id: true,
                },
            })
        })
    }catch(error){
        console.log(error);
    }

}