import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const GOOGLE_API = "https://www.googleapis.com/books/v1/volumes";

// 🔥 없는 책 제목일 때 절대 소설 생성하지 않음
app.post("/api/book", async (req, res) => {
  try {
    const { title, author } = req.body;

    const query = author
      ? `${title}+inauthor:${author}`
      : title;

    const url = `${GOOGLE_API}?q=${encodeURIComponent(query)}&langRestrict=ko&maxResults=1`;

    const response = await axios.get(url);

    if (!response.data.items || response.data.items.length === 0) {
      return res.json({ description: null });
    }

    const book = response.data.items[0].volumeInfo;
    const description = book.description || null;

    return res.json({ description });

  } catch (error) {
    console.error(error);
    return res.json({ description: null });
  }
});


// 🟢 톤 3개 처리 — 정상 / 짝사랑 말투 / 친구 말투
function tonePrompt(tone) {
  if (tone === "normal") return "전체적으로 자연스럽고 깔끔한 말투로 작성해줘.";
  if (tone === "love") return "상대에게 다정하고 사랑스러운 말투로, 많은 감정이 섞여서 표현해줘.";
  if (tone === "friend") return "편하게 친구한테 말하듯 가볍고 캐주얼하게 작성해줘 걍 프랜들리.";
  return "";
}


// 🟢 요약 생성
app.post("/api/summary", async (req, res) => {
  try {
    const { title, author, description, lang, num, tone } = req.body;

    if (!description) {
      return res.json({ summary: "책 설명이 없어서 요약을 만들 수 없어요." });
    }

    const prompt = `
제목: ${title}
작가: ${author || "정보 없음"}

책 설명:
${description}

요약 조건:
- 문장 수: ${num}개
- 언어: ${lang}
- 톤: ${tone}

톤 설명:
${tonePrompt(tone)}

위 조건에 맞게 책 내용을 요약해줘. 없으면 오타,스팰링/ 찾을수 없음 이라고 사용저한테 보여조.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const summary = response.choices[0].message.content.trim();

    return res.json({ summary });

  } catch (error) {
    console.error(error);
    return res.json({ summary: "요약 생성 중 오류가 발생했어요." });
  }
});


// 🔥 Render용 포트 처리
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
