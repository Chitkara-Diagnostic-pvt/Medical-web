import { z } from 'zod'

export const createBookingSchema = z.object({
  testId: z.string().cuid('Invalid test ID'),
  slotId: z.string().cuid('Invalid slot ID'),
})

export const cancelBookingSchema = z.object({
  bookingId: z.string().cuid('Invalid booking ID'),
  reason: z.string().optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>