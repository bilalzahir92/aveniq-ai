import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/require-user";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
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
        model: "models/gemini-embedding-001",
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
        "Failed to generate embedding."
    );
  }

  if (!data?.embedding?.values) {
    throw new Error(
      "Gemini did not return an embedding."
    );
  }

  return data.embedding.values;
}

async function getRelevantChunks(supabase, question) {
  const queryEmbedding =
    await generateEmbedding(question);

  const { data, error } =
    await supabase.rpc(
      "match_document_chunks",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 5,
      }
    );

  if (error) {
    console.error(
      "SUPABASE VECTOR SEARCH ERROR:",
      error
    );

    throw new Error(error.message);
  }

  return data || [];
}

async function getDocuments(supabase, documentIds) {
  if (!documentIds.length) {
    return [];
  }

  const { data, error } =
    await supabase
      .from("documents")
      .select("id, name, created_at")
      .in("id", documentIds);

  if (error) {
    console.error(
      "SUPABASE DOCUMENT LOOKUP ERROR:",
      error
    );

    throw new Error(error.message);
  }

  return data || [];
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

    const { messages } =
      await request.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        {
          error:
            "Invalid messages format.",
        },
        {
          status: 400,
        }
      );
    }

    const lastUserMessage =
      [...messages]
        .reverse()
        .find(
          (message) =>
            message.role === "user" &&
            !message.loading
        );

    if (
      !lastUserMessage?.content?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a message.",
        },
        {
          status: 400,
        }
      );
    }

    const question =
      lastUserMessage.content.trim();

    const relevantChunks =
      await getRelevantChunks(
        supabase,
        question
      );

    const knowledge =
      relevantChunks.length > 0
        ? relevantChunks
            .map(
              (chunk, index) =>
                `DOCUMENT CHUNK ${
                  index + 1
                }:

${chunk.content}`
            )
            .join(
              "\n\n==============================\n\n"
            )
        : "";

    const systemInstruction = `
You are AVENIQ AI, a professional real estate knowledge assistant.

Answer the user's question using the relevant uploaded document knowledge provided in the conversation.

Important rules:
- Use the uploaded document knowledge when it is relevant.
- Do not invent facts that are not present in the provided knowledge.
- If the answer cannot be found in the uploaded documents, clearly say that the information is not available in the uploaded documents.
- Give clear, concise and professional answers.
`;

    const contents = messages
      .filter(
        (message) =>
          !message.loading
      )
      .map((message) => ({
        role:
          message.role === "assistant"
            ? "model"
            : "user",
        parts: [
          {
            text: message.content,
          },
        ],
      }));

    if (knowledge) {
      const lastIndex =
        contents.length - 1;

      if (
        contents[lastIndex]?.role ===
        "user"
      ) {
        contents[lastIndex] = {
          role: "user",
          parts: [
            {
              text: `
Relevant uploaded document knowledge:

${knowledge}

--------------------------------

User question:

${question}
`,
            },
          ],
        };
      }
    }

    const response =
      await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        systemInstruction,
        contents,
      });

    const documentIds = [
      ...new Set(
        relevantChunks
          .map(
            (chunk) =>
              chunk.document_id
          )
          .filter(Boolean)
      ),
    ];

    const documents =
      await getDocuments(
        supabase,
        documentIds
      );

    const documentMap = new Map(
      documents.map((document) => [
        document.id,
        document,
      ])
    );

    const sources = documentIds
      .map((documentId) => {
        const document =
          documentMap.get(
            documentId
          );

        if (!document) {
          return null;
        }

        const matchingChunk =
          relevantChunks.find(
            (chunk) =>
              chunk.document_id ===
              documentId
          );

        const extension =
          document.name
            ?.split(".")
            .pop()
            ?.toUpperCase() || "FILE";

        return {
          id: document.id,
          name: document.name,
          type: extension,
          date: document.created_at,
          similarity:
            matchingChunk?.similarity ??
            0,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      reply: response.text,
      sources,
    });
  } catch (error) {
    console.error(
      "GEMINI ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Gemini request failed.",
      },
      {
        status: 500,
      }
    );
  }
}