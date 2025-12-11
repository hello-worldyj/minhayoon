import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ───────────────────────────────
// 유사도 계산 (오타 감지)
// ───────────────────────────────
function similarity(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const longerLength = longer.length;

  let sameCount = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) sameCount++;
  }
  return sameCount / longerLength;
}

// ───────────────────────────────
// 책 검색 (오타 포함 검증)
// ───────────────────────────────
async function searchBooks(title, author) {
  const q = `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(
    author
  )}`;

  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=10&key=${process.env.GOOGLE_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.items) return [];

  const results = data.items.map((item) => {
    const info = item.volumeInfo;
    return {
      id: item.id,
      title: info.title || "",
      authors: info.authors ? info.authors.join(", ") : "",
    };
  });

  // 유사도 필터링
  const filtered = results.filter((b) => {
    const tScore = similarity(title, b.title);
    const aScore = similarity(author, b.authors);
    return tScore > 0.6 || aScore > 0.6;
  });

  return filtered;
}

// ───────────────────────────────
// 요약 API
// ───────────────────────────────
app.post("/api/summary", async (req, res) => {
  try {
    const { title, author, lang, tone, num } = req.body;

    // 1) 책 검색
    const books = await searchBooks(title, author);

    // 2) 아예 없음
    if (books.length === 0) {
      return res.json({
        status: "no_match",
        message: "❌ 실제 책을 찾을 수 없습니다. 제목/작가를 다시 확인해주세요.",
        candidates: [],
      });
    }

    // 3) 후보가 여러 개 → 선택하도록 반환
    if (books.length > 1) {
      return res.json({
        status: "multiple",
        message: "여러 개의 비슷한 책이 발견되었습니다.",
        candidates: books,
      });
    }

    // 4) 정확히 1개 → 요약 진행
    const book = books[0];

    const introPrompt = `
책 제목: ${book.title}
작가: ${book.authors}

이 책은 실제 존재합니다.
이 책의 실제 내용을 기반으로 짧은 소개를 ${lang}로 작성하세요.
문체: ${tone}
`;

    const introRes = await openai.responses.create({
      model: "gpt-4o-mini",
      input: introPrompt,
    });

    const introText = introRes.output_text;

    const summaryPrompt = `
아래 소개를 기반으로 새로운 내용 창작 없이
${num}문장으로 요약하세요.

소개:
${introText}

언어: ${lang}
문체: ${tone}
`;

    const sumRes = await openai.responses.create({
      model: "gpt-4o-mini",
      input: summaryPrompt,
    });

    res.json({
      status: "ok",
      intro: introText,
      summary: sumRes.output_text,
      book,
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: "error",
      intro: "",
      summary: "",
    });
  }
});

app.listen(10000, () => console.log("SERVER RUNNING"));
