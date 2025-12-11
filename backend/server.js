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

// ===============================
//          OPENAI CLIENT
// ===============================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===============================
//        BOOK SEARCH API
// ===============================
app.post("/api/book", async (req, res) => {
  try {
    const { title, author } = req.body;

    if (!title) return res.json({ description: null });

    const query = `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0)
      return res.json({ description: null });

    const desc = data.items[0].volumeInfo.description || null;

    res.json({ description: desc });
  } catch (err) {
    console.error("BOOK ERROR:", err);
    res.json({ description: null });
  }
});

// ===============================
//        SUMMARY API
// ===============================
app.post("/api/summary", async (req, res) => {
  try {
    const { title, author, description, tone, lang, num } = req.body;

    if (!description)
      return res.json({ summary: "설명이 없어요." });

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

    const result = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    res.json({ summary: result.output_text });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.json({ summary: "요약 중 오류 발생" });
  }
});

// ===============================
//     STATIC FRONTEND SERVING
// ===============================

// public → backend/public 폴더를 정적 파일로 서빙
app.use(express.static(path.join(__dirname, "public")));

// 모든 라우트는 index.html 반환 (SPA 방식)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================
//         START SERVER
// ===============================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
