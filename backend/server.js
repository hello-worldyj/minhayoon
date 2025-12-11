import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // 🔥 Render 환경변수에서 읽음
});

// 책 설명 API
app.post("/api/book", async (req, res) => {
  const { title, author } = req.body;

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
      title
    )}+inauthor:${encodeURIComponent(author)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.json({ description: null });
    }

    const desc = data.items[0].volumeInfo.description || null;
    res.json({ description: desc });
  } catch {
    res.json({ description: null });
  }
});

// 요약 생성 API
app.post("/api/summary", async (req, res) => {
  const { title, author, description, tone, lang, num } = req.body;

  const safeDesc = description
    ? description
    : "설명이 없어서 내용을 생성할 수 없어요.";

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
${safeDesc}
`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ summary: result.choices[0].message.content });
  } catch (error) {
    console.log(error);
    res.json({ summary: "요약 생성 중 오류가 발생했습니다." });
  }
});

app.listen(10000, () => console.log("Server running on 10000"));
