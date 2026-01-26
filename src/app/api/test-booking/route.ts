import { NextRequest, NextResponse } from 'next/server'
import { createBooking } from '@/app/actions/bookings/create-booking'
import { getServerSession } from '@/lib/server-auth'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { testId, slotId } = body

        if (!testId || !slotId) {
            return NextResponse.json(
                { error: 'testId and slotId are required' },
                { status: 400 }
            )
        }

        const result = await createBooking(testId, slotId)

        if ('error' in result) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { 
                success: true, 
                booking: result.booking 
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}