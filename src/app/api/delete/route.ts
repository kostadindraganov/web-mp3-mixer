import { NextRequest, NextResponse } from 'next/server';
import { deleteFromR2 } from '@/lib/r2-client';

export async function DELETE(request: NextRequest) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'No key provided' }, { status: 400 });
    }

    await deleteFromR2(key);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
