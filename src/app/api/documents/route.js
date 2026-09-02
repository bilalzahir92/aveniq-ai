import mammoth from "mammoth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "";

    let text = "";

    if (extension === "docx") {
      const result = await mammoth.extractRawText({
        buffer,
      });

      text = result.value;
    } else if (extension === "txt") {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        {
          error:
            "PDF processing is temporarily unavailable. Please upload DOCX or TXT.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      name: file.name,
      type: extension.toUpperCase(),
      text: text.trim(),
    });
  } catch (error) {
    console.error("DOCUMENT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error.message || "Failed to process the document.",
      },
      { status: 500 }
    );
  }
}