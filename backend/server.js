import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ⭐ public 폴더 제공(prefix 없이)
app.use(express.static("public"));

// OpenAI 클라이언트
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ⭐ 요약 API
app.post("/api/summary", async (req, res) => {
  try {
    console.log("📥 들어온 내용:", req.body);

    const { title, author, description, tone, lang, num } = req.body;

    if (!description || description.trim() === "") {
      return res.json({ summary: "설명이 없어요." });
    }

    const prompt = `
설명을 기반으로 문장 ${num}개로 요약해줘.
- 언어: ${lang}
- 톤: ${tone}
- 새로운 내용 금지

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
    console.error(err);
    res.json({ summary: "요약 중 오류 발생" });
  }
});

// 기본 라우트
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// 서버 시작
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("🚀 Server running on " + PORT));
