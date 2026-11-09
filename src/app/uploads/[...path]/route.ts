import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];

    // Path traversal prevention
    const sanitizedSegments = pathSegments.filter(
      (segment) => segment !== '..' && segment !== '.' && !segment.includes('/') && !segment.includes('\\')
    );

    if (sanitizedSegments.length === 0) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const relativePath = sanitizedSegments.join(path.sep);
    const filePath = path.join(process.cwd(), 'public', 'uploads', relativePath);

    // Ensure filePath is strictly within public/uploads
    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
    const resolvedFilePath = path.resolve(filePath);
    if (!resolvedFilePath.startsWith(uploadsRoot)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Verify file exists
    try {
      const fileStat = await stat(resolvedFilePath);
      if (!fileStat.isFile()) {
        return new NextResponse('Not a file', { status: 404 });
      }
    } catch {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const fileBuffer = await readFile(resolvedFilePath);
    const ext = path.extname(resolvedFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving upload:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
