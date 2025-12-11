import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===============================
//         SUMMARY API
// ===============================
app.post("/api/summary", async (req, res) => {
  try {
    const { title, author, description, tone, lang, num } = req.body;

    if (!title || !description) {
      return res.json({ summary: "제목이나 설명이 비어 있습니다." });
    }

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

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    res.json({ summary: response.output_text });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.json({ summary: "요약 중 오류 발생" });
  }
});

// ===============================
//         HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("Server is running.");
});

// ===============================
//         START SERVER
// ===============================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
