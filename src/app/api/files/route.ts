import { NextRequest, NextResponse } from 'next/server';
import { listFilesFromR2, getPresignedUrl } from '@/lib/r2-client';
import { AudioFile } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'background' | 'voiceover' | null;

    const files = await listFilesFromR2(type || undefined);

    const audioFiles: AudioFile[] = await Promise.all(
      files.map(async (file) => {
        const url = await getPresignedUrl(file.Key!);
        const type = file.Key!.startsWith('background/') ? 'background' : 'voiceover';
        const name = file.Key!.split('/')[1] || file.Key!;

        return {
          key: file.Key!,
          name,
          url,
          size: file.Size || 0,
          lastModified: file.LastModified || new Date(),
          type,
        };
      })
    );

    return NextResponse.json({ files: audioFiles });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
