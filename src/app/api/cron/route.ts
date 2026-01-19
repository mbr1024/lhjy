import { updateData } from '@/lib/crawler';

export async function GET() {
    // Trigger update logic
    const success = await updateData();

    if (success) {
        return Response.json({ status: 'ok', message: 'Data updated successfully' });
    } else {
        return Response.json({ status: 'error', message: 'Failed to update data' }, { status: 500 });
    }
}
