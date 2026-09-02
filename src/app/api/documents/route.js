import mammoth from "mammoth";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/require-user";

export const runtime = "nodejs";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

function createChunks(text) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(
      start + CHUNK_SIZE,
      text.length
    );

    const chunk = text.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= text.length) {
      break;
    }

    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

async function generateEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing."
    );
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        model:
          "models/gemini-embedding-001",
        content: {
          parts: [
            {
              text,
            },
          ],
        },
        outputDimensionality: 768,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "GEMINI EMBEDDING ERROR:",
      data
    );

    throw new Error(
      data?.error?.message ||
        "Failed to generate Gemini embedding."
    );
  }

  const embedding =
    data?.embedding?.values;

  if (!embedding) {
    throw new Error(
      "Gemini did not return an embedding."
    );
  }

  return embedding;
}

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const supabase = await createClient();

    const { data, error } =
      await supabase
        .from("documents")
        .select("id, name, content, created_at")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "SUPABASE DOCUMENT LIST ERROR:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      documents: data || [],
    });
  } catch (error) {
    console.error(
      "DOCUMENT LIST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to load documents.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const supabase = await createClient();

    const formData =
      await request.formData();

    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        {
          error: "No file uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "";

    let text = "";

    if (extension === "docx") {
      const result =
        await mammoth.extractRawText({
          buffer,
        });

      text = result.value;
    } else if (extension === "txt") {
      text = buffer.toString(
        "utf-8"
      );
    } else {
      return NextResponse.json(
        {
          error:
            "Only DOCX and TXT files are currently supported.",
        },
        {
          status: 400,
        }
      );
    }

    text = text.trim();

    if (!text) {
      return NextResponse.json(
        {
          error:
            "The document does not contain any readable text.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: document,
      error: documentError,
    } = await supabase
      .from("documents")
      .insert({
        name: file.name,
        content: text,
        user_id: user.id,
      })
      .select()
      .single();

    if (documentError) {
      console.error(
        "SUPABASE DOCUMENT ERROR:",
        documentError
      );

      return NextResponse.json(
        {
          error:
            documentError.message,
        },
        {
          status: 500,
        }
      );
    }

    const chunks = createChunks(text);

    if (!chunks.length) {
      await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);

      return NextResponse.json(
        {
          error:
            "No usable text chunks were created.",
        },
        {
          status: 400,
        }
      );
    }

    const chunkRows = [];

    for (
      let i = 0;
      i < chunks.length;
      i++
    ) {
      const embedding =
        await generateEmbedding(
          chunks[i]
        );

      if (embedding.length !== 768) {
        throw new Error(
          `Invalid embedding dimension. Expected 768 but received ${embedding.length}.`
        );
      }

      chunkRows.push({
        document_id: document.id,
        content: chunks[i],
        embedding,
      });
    }

    const {
      error: chunksError,
    } = await supabase
      .from("document_chunks")
      .insert(chunkRows);

    if (chunksError) {
      console.error(
        "SUPABASE CHUNKS ERROR:",
        chunksError
      );

      await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);

      return NextResponse.json(
        {
          error:
            chunksError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Document uploaded, extracted, chunked and embedded successfully.",
      document: {
        id: document.id,
        name: file.name,
        type: extension.toUpperCase(),
      },
      chunks: chunks.length,
      text,
    });
  } catch (error) {
    console.error(
      "DOCUMENT PROCESSING ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to process the document.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const supabase = await createClient();

    const { documentId } =
      await request.json();

    if (!documentId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Document ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      error: chunksError,
    } = await supabase
      .from("document_chunks")
      .delete()
      .eq(
        "document_id",
        documentId
      );

    if (chunksError) {
      console.error(
        "SUPABASE CHUNKS DELETE ERROR:",
        chunksError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            chunksError.message,
        },
        {
          status: 500,
        }
      );
    }

    const {
      error: documentError,
    } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId);

    if (documentError) {
      console.error(
        "SUPABASE DOCUMENT DELETE ERROR:",
        documentError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            documentError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Document deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DOCUMENT DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to delete document.",
      },
      {
        status: 500,
      }
    );
  }
}