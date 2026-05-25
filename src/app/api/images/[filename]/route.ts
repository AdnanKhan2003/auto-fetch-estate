import { getPresignedScreenshotUrl } from "@/lib/s3-client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;

    if (!filename)
      return new NextResponse("Filename is required", { status: 400 });

    const presignedUrl = await getPresignedScreenshotUrl(filename);

    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error("Error generating presigned URL: ", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
