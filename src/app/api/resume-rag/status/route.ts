import { NextResponse } from "next/server";

export async function GET() {
  const configured = Boolean(process.env.HF_TOKEN?.trim() || process.env.HUGGINGFACE_HUB_TOKEN?.trim());
  return NextResponse.json({
    ok: true,
    provider: configured ? "huggingface_rag" : "local_rag",
    huggingFaceConfigured: configured,
    model: process.env.HF_RAG_MODEL?.trim() || "Qwen/Qwen2.5-7B-Instruct",
    note: configured
      ? "Hugging Face RAG will run after local retrieval."
      : "HF_TOKEN is not set; the system uses local RAG retrieval and rule-based personalization.",
  });
}
