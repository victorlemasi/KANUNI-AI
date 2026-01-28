import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const procurements = await prisma.procurement.findMany({
            orderBy: { timestamp: 'desc' },
            include: { alerts: true }
        });
        return NextResponse.json(procurements);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        const procurement = await prisma.procurement.create({
            data: {
                fileName: data.fileName,
                fileSize: data.fileSize,
                riskScore: data.riskScore,
                riskLevel: data.riskLevel,
                topConcern: data.topConcern,
                analysisMode: data.mode,
                findings: JSON.stringify(data.findings),
                suggestions: JSON.stringify(data.suggestions),
                pillarAlignment: JSON.stringify(data.pillarAlignment),
                textPreview: data.textPreview,
                alerts: {
                    create: (data.alerts || []).map((msg: string) => ({
                        type: 'ANOMALY',
                        severity: data.riskLevel,
                        message: msg
                    }))
                }
            }
        });

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                procurementId: procurement.id,
                action: 'ANALYSIS',
                details: `Document ${data.fileName} analyzed in ${data.mode} mode.`
            }
        });

        return NextResponse.json(procurement);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
