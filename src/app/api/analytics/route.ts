import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const totalProcurements = await prisma.procurement.count();
        const totalAlerts = await prisma.complianceAlert.count();
        const vendors = await prisma.vendor.count();

        // Simple average risk score
        const avgRisk = await prisma.procurement.aggregate({
            _avg: { riskScore: true }
        });

        const metrics = {
            summary: {
                totalProcurements,
                totalAlerts,
                totalVendors: vendors,
                averageRisk: Math.round(avgRisk._avg.riskScore || 0)
            }
        };

        return NextResponse.json(metrics);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
