import { updateData } from '@/lib/crawler';

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    // Trigger update logic
    const success = await updateData();

    if (success) {
        return Response.json({ status: 'ok', message: 'Data updated successfully' });
    } else {
        return Response.json({ status: 'error', message: 'Failed to update data' }, { status: 500 });
    }
}
