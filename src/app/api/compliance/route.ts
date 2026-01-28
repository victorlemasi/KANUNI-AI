import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const alerts = await prisma.complianceAlert.findMany({
            orderBy: { timestamp: 'desc' },
            include: { procurement: true }
        });
        return NextResponse.json(alerts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
