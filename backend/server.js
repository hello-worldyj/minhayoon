import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ─────────────────────────────
//  책 존재 여부 확인 함수
// ─────────────────────────────
async function checkBookExists(title, author) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
    title
  )}+inauthor:${encodeURIComponent(author)}&key=${process.env.GOOGLE_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  return data.items && data.items.length > 0;
}

// ─────────────────────────────
//  요약 API (설명 자동 생성 포함)
// ─────────────────────────────
app.post("/api/summary", async (req, res) => {
  try {
    const { title, author, tone, lang, num } = req.body;

    // 1) 존재하지 않는 책이면 차단
    const exists = await checkBookExists(title, author);
    if (!exists) {
      return res.json({ 
        intro: " ??? 제목/작가/오타 다시 확인.",
        summary: "..."
      });
    }

    // 2) 책 소개 자동 생성
    const introPrompt = `
당신은 책 소개 작성 전문가입니다.
책 제목: ${title}
작가: ${author}

이 책이 실제로 존재함을 확인했습니다.
이 책의 실제 내용을 기반으로, 새로운 내용 창작 없이
부드러운 ${lang}로 짧은 소개를 작성해주세요.
문체: ${tone}
`;

    const introRes = await openai.responses.create({
      model: "gpt-4o-mini",
      input: introPrompt
    });

    const introText = introRes.output_text;

    // 3) 요약 생성
    const summaryPrompt = `
책 제목: ${title}
작가: ${author}

소개:
${introText}

위의 소개를 기반으로 새로운 내용 창작 없이
${num}문장으로 요약해주세요.
언어: ${lang}
문체: ${tone}
`;

    const sumRes = await openai.responses.create({
      model: "gpt-4o-mini",
      input: summaryPrompt
    });

    res.json({
      intro: introText,
      summary: sumRes.output_text
    });

  } catch (err) {
    console.log(err);
    res.json({
      intro: "❌ 오류 발생",
      summary: ""
    });
  }
});

// ─────────────────────────────
//  헬스 체크
// ─────────────────────────────
app.get("/", (req, res) => {
  res.send("Server is running.");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on " + PORT));
