import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    const folderRaw = (formData.get('folder') as string) || 'banners';
    const safeFolder = ['brands', 'products', 'banners', 'categories', 'general'].includes(folderRaw) ? folderRaw : 'banners';

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only JPEG, PNG, WebP, SVG, AVIF, and GIF images are accepted.' },
        { status: 400 }
      );
    }

    // Limit size: 8MB
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum allowed size is 8 MB.' },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const width = safeFolder === 'banners' ? 1600 : safeFolder === 'brands' ? 400 : 800;
    const output = isSvg
      ? bytes
      : await sharp(bytes, { animated: false })
        .resize({ width, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 80 })
        .toBuffer();
    const outputType = isSvg ? 'image/svg+xml' : 'image/webp';

    // Build safe filename
    const ext = isSvg ? 'svg' : 'webp';
    const prefix = safeFolder === 'brands' ? 'brand' : safeFolder === 'products' ? 'prod' : safeFolder === 'categories' ? 'category' : 'banner';
    const safeName = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;

    // Resolve upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, output);

    const publicUrl = `/uploads/${safeFolder}/${safeName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeName,
      size: output.length,
      type: outputType,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
