import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// ===========================
//  SUMMARY API
// ===========================
app.post("/api/summary", async (req, res) => {
  try {
    const { title, author, description, tone, lang, num } = req.body;

    const safeDesc = description
      ? description
      : "설명이 없어서 내용을 생성할 수 없어요.";

    const prompt = `
규칙:
1) 설명이 없으면 "? 오타 확인"라고 말하기
2) 새로운 내용 상상 금지
3) 문체: ${tone}
4) 언어: ${lang}
5) 문장 수: ${num}

책 제목: ${title}
작가: ${author}

설명:
${safeDesc}
`;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });

    res.json({ summary: response.output_text });

  } catch (e) {
    console.error("SUMMARY ERROR:", e);
    res.json({ summary: "요약 생성 중 오류가 발생했습니다." });
  }
});


// ===========================
//  ROOT TEST
// ===========================
app.get("/", (req, res) => {
  res.send("Server is running.");
});


// ===========================
//  START SERVER
// ===========================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
