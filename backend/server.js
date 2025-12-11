import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// -----------------------------
//  HELPER: fetch description from Google Books
// -----------------------------
async function fetchDescriptionFromGoogle(title, author) {
  try {
    if (!title) return null;
    const q = `intitle:${encodeURIComponent(title)}${author ? "+inauthor:" + encodeURIComponent(author) : ""}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${q}`;
    const resp = await fetch(url);
    const data = await resp.json();
    const desc = data?.items?.[0]?.volumeInfo?.description ?? null;
    return desc;
  } catch (e) {
    console.error("Google Books fetch error:", e);
    return null;
  }
}

// -----------------------------
//  BOOK API (optional; used by frontend)
// -----------------------------
app.post("/api/book", async (req, res) => {
  try {
    const { title, author } = req.body;
    if (!title) return res.json({ description: null });

    const desc = await fetchDescriptionFromGoogle(title, author);
    res.json({ description: desc });
  } catch (e) {
    console.error("BOOK ERROR:", e);
    res.json({ description: null });
  }
});

// -----------------------------
//  SUMMARY API
//   - if description missing from client, server tries to fetch it
//   - robust parsing of OpenAI responses
// -----------------------------
app.post("/api/summary", async (req, res) => {
  try {
    const { title, author, description: clientDescription, tone = "기본 말투", lang = "한국어", num = 5 } = req.body;

    // normalize description
    let description = typeof clientDescription === "string" ? clientDescription.trim() : "";

    // If no description from client, try Google Books
    if (!description) {
      console.log("summary: description not sent by client — trying Google Books lookup");
      const fetched = await fetchDescriptionFromGoogle(title, author);
      if (fetched) {
        description = fetched;
        console.log("summary: got description from Google Books (len:", description.length, ")");
      } else {
        console.log("summary: no description found from Google Books");
      }
    } else {
      console.log("summary: description received from client (len:", description.length, ")");
    }

    if (!description) {
      // still empty — return clear message
      return res.json({ summary: "설명이 없어요." });
    }

    // Build prompt
    const prompt = `
규칙:
1) 설명이 없으면 "설명이 없어요"라고 말하기
2) 새로운 내용 상상 금지
3) 문체: ${tone}
4) 언어: ${lang}
5) 문장 수: ${num}

책 제목: ${title}
작가: ${author}

설명:
${description}
`;

    // Call OpenAI Responses API
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      // optional: limit tokens if you want
      // max_output_tokens: 800,
    });

    // Try multiple ways to extract text (robust)
    let summaryText = null;

    if (response.output_text && response.output_text.trim()) {
      summaryText = response.output_text.trim();
    }

    // fallback: try to flatten response.output array
    if (!summaryText && Array.isArray(response.output)) {
      try {
        summaryText = response.output
          .map((o) => {
            // some items have content array with {type:'output_text', text:'...'}
            if (o?.content && Array.isArray(o.content)) {
              return o.content.map((c) => (c?.text ?? c?.content ?? "")).join("");
            }
            // other forms:
            if (typeof o === "string") return o;
            if (o?.text) return o.text;
            return "";
          })
          .join(" ")
          .trim();
      } catch (e) {
        console.warn("summary: fallback parsing error", e);
      }
    }

    if (!summaryText) {
      console.error("SUMMARY: no text found in OpenAI response:", JSON.stringify(response, null, 2));
      return res.json({ summary: "요약 생성 중 오류가 발생했습니다." });
    }

    return res.json({ summary: summaryText });
  } catch (err) {
    console.error("SUMMARY ERROR (outer):", err);
    return res.json({ summary: "요약 중 오류 발생" });
  }
});

// -----------------------------
//  STATIC FILES (public inside backend)
// -----------------------------
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -----------------------------
//  START
// -----------------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
