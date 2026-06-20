import { getPresignedScreenshotUrl } from "@/lib/s3-client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filepath: string[] }> },
) {
  try {
    const { filepath } = await params;

    if (!filepath || filepath.length === 0)
      return new NextResponse("Filename is required", { status: 400 });

    const s3Key = filepath.join("/");
    const presignedUrl = await getPresignedScreenshotUrl(s3Key);

    // Fetch the image from S3 on the SERVER SIDE
    const imageResponse = await fetch(presignedUrl);

    if (!imageResponse.ok) {
      return new NextResponse("Failed to fetch image from S3", {
        status: imageResponse.status,
      });
    }

    const arrayBuffer = await imageResponse.arrayBuffer();

    // Return the raw image buffer so the browser never interacts with S3 directly
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type":
          imageResponse.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching image: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
