import { getPresignedScreenshotUrl } from "@/lib/s3-client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filepath: string[] }> },
) {
  try {
    const { filepath } = await params;
    console.log("[DEBUG] API IMAGES HIT WITH FILEPATH: ", filepath);

    if (!filepath || filepath.length === 0)
      return new NextResponse("Filename is required", { status: 400 });

    const s3Key = filepath.join("/");
    const presignedUrl = await getPresignedScreenshotUrl(s3Key);

    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error("Error generating presigned URL: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
