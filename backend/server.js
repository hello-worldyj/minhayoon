import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// === 네 API 키를 여기 넣어 ===
const client = new OpenAI({
  apiKey: "YOUR_OPENAI_KEY"
});

// frontend 정적 서비스
app.use(express.static("../frontend"));


// 📌 Google Books API — 책 설명 가져오기
app.get("/book", async (req, res) => {
  try {
    const { title, author } = req.query;

    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
      title
    )}+inauthor:${encodeURIComponent(author)}&maxResults=1`;

    const { data } = await axios.get(url);

    if (!data.items || data.items.length === 0) {
      return res.json({
        description: null
      });
    }

    const info = data.items[0].volumeInfo;
    const description = info.description || null;

    res.json({ description });
  } catch (err) {
    console.error(err);
    res.json({ description: null });
  }
});


// 📌 요약 생성
app.post("/summary", async (req, res) => {
  try {
    const { title, author, description, lang, tone, num } = req.body;

    // 설명 없으면 절대 창작 금지
    if (!description) {
      return res.json({
        summary:
          lang === "en"
            ? "There is no description available for this book."
            : "이 책에 대한 설명이 없습니다."
      });
    }

    const result = await client.responses.create({
      model: "gpt-4o-mini",
      input: `
      Title: ${title}
      Author: ${author}

      Output language: ${lang}
      Tone: ${tone}
      Length: ${num} sentences

      Book Description:
      ${description}

      RULES:
      - NEVER invent new story content.
      - ONLY summarize using given description. The summary must be correct if you can't find one online, just say check spelling.
      - Output must be ONLY in ${lang}.
      `
    });

    res.json({
      summary: result.output_text
    });
  } catch (err) {
    console.error(err);
    res.json({ summary: "Error generating summary" });
  }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
