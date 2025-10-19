import { NextResponse } from "next/server";
import { generateAltText, BedrockInvocationError } from "@/lib/altTextService";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("image");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Missing 'image' file in form data." }, { status: 400 });
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported image type: ${file.type}` }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "Image exceeds the 5 MB limit." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await generateAltText(buffer, file.type);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BedrockInvocationError) {
      console.error("[alt-text] bedrock invocation failed:", err);
      return NextResponse.json(
        { error: "The image model failed to produce a result. Please try again." },
        { status: 502 },
      );
    }
    throw err;
  }
}
