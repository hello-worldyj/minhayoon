import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 정적 파일 서비스
app.use(express.static("public"));

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===================================
//             요약 API
// ===================================
app.post("/api/summary", async (req, res) => {
  try {
    const { title, author, description, tone, lang, num } = req.body;

    console.log("📥 SUMMARY REQUEST:", req.body);

    // description 반드시 있어야 함
    if (!description || description.trim() === "") {
      return res.json({ summary: "설명이 없어요." });
    }

    const prompt = `
규칙:
- 설명이 없으면 "설명이 없어요"라고 말하기
- 새로운 내용 상상 금지
- 문체: ${tone}
- 언어: ${lang}
- 문장 수: ${num}

책 제목: ${title}
작가: ${author}

설명:
${description}
    `;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    console.log("📤 SUMMARY SUCCESS");

    res.json({ summary: response.output_text });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.json({ summary: "요약 중 오류 발생" });
  }
});

// ===================================
//             루트 경로
// ===================================
app.get("/", (req, res) => {
  res.send("Server is running.");
});

// ===================================
//             서버 시작
// ===================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
