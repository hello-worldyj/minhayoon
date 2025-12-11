import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ⭐ static 파일 서빙
app.use(express.static("public"));

// ⭐ OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ⭐ 요약 API
app.post("/api/summary", async (req, res) => {
  try {
    console.log("📥 들어온 요청:", req.body);

    const { title, author, description, tone, lang, num } = req.body;

    if (!description || description.trim() === "") {
      return res.json({ summary: "설명이 없어요." });
    }

    const prompt = `
다음 설명을 기반으로 ${num}문장으로 요약하세요.
- 언어: ${lang}
- 톤: ${tone}
- 새로운 내용 추가 금지

제목: ${title}
작가: ${author}

설명:
${description}
`;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    res.json({ summary: response.output_text });
  } catch (error) {
    console.error("❌ SUMMARY ERROR:", error);
    res.json({ summary: "요약 중 오류 발생" });
  }
});

// ⭐ 메인 페이지
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// ⭐ 서버 시작
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
