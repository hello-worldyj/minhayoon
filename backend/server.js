import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ====== public 정적 제공 (Cannot GET / 해결) ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// ====== OpenAI 클라이언트 ======
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ====== Google Books API ======
async function fetchBookInfo(title) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    title
  )}&key=${process.env.GOOGLE_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.items || data.items.length === 0) return null;

  const book = data.items[0].volumeInfo;

  return {
    title: book.title || "",
    author: (book.authors && book.authors[0]) || "",
    description: book.description || "",
  };
}

// ============= API: 요약 + 소개 생성 =============
app.post("/api/summary", async (req, res) => {
  try {
    const { title, lang, tone, num } = req.body;

    if (!title) return res.json({ error: "제목이 비었습니다." });

    // 책 정보 가져오기
    const info = await fetchBookInfo(title);

    if (!info) {
      return res.json({
        bookInfo: {
          title,
          author: "",
          description: "",
        },
        summary: "⚠️ 책을 찾을 수 없습니다. 제목을 다시 확인해주세요.",
      });
    }

    // 설명 없으면 안내
    if (!info.description) {
      return res.json({
        bookInfo: info,
        summary: "⚠️ 책 설명이 존재하지 않습니다.",
      });
    }

    const prompt = `
규칙:
1) 새로운 내용 상상 금지
2) 문체: ${tone}
3) 언어: ${lang}
4) 요약 문장 수: ${num}

책 제목: ${info.title}
작가: ${info.author}

설명:
${info.description}

출력 형식:
소개:
요약:
`;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    res.json({
      bookInfo: info,
      summary: response.output_text,
    });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.json({ summary: "요약 중 오류 발생" });
  }
});

// =========== 기본 라우트 ===========
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =========== 서버 시작 ===========
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
