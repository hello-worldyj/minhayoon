import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // ⭐ public 폴더 정적 제공

// ⭐ OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===============================
// 📘 1) 책 설명 자동 가져오기
// ===============================
app.post("/api/book", async (req, res) => {
  const { title, author } = req.body;
  console.log("📘 BOOK API:", title, author);

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
      title
    )}+inauthor:${encodeURIComponent(author)}&key=${process.env.GOOGLE_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.json({ description: null });
    }

    const desc = data.items[0].volumeInfo.description || null;

    console.log("📘 가져온 책 설명:", desc);

    return res.json({ description: desc });
  } catch (err) {
    console.error("❌ BOOK API ERROR:", err);
    return res.json({ description: null });
  }
});

// ===============================
// ✨ 2) 요약 생성 API
// ===============================
app.post("/api/summary", async (req, res) => {
  try {
    const { title, author, description, tone, lang, num } = req.body;

    if (!description) {
      return res.json({ summary: "설명이 없어요." });
    }

    const prompt = `
주어진 책 설명을 기반으로 요약을 생성하세요.

규칙:
- 문장 수: ${num}
- 언어: ${lang}
- 말투: ${tone}
- 새로운 내용 상상 금지

제목: ${title}
작가: ${author}

설명:
${description}
    `;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    return res.json({ summary: response.output_text });
  } catch (err) {
    console.error("❌ SUMMARY ERROR:", err);
    return res.json({ summary: "요약 중 오류 발생" });
  }
});

// ===============================
// 메인 페이지
// ===============================
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// ===============================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("🚀 Server running on port " + PORT));
