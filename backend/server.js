import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// ------- Public 폴더 정적 제공 ---------
app.use(express.static(path.join(__dirname, "..", "public")));

// ------- OpenAI 초기화 ---------
const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

// ------- 책 설명 API ---------
app.post("/book", async (req, res) => {
  try {
    const { title, author } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "너는 책 정보를 간단히 찾아주는 도우미야." },
        { role: "user", content: `책 제목: ${title}, 작가: ${author} 설명 알려줘.` }
      ]
    });

    const text = completion.choices[0].message.content.trim();
    res.json({ description: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "book API error" });
  }
});

// ------- 요약 생성 API ---------
app.post("/summary", async (req, res) => {
  try {
    const { title, author, description, tone, lang, num } = req.body;

    const msg = `
제목: ${title}
작가: ${author}
설명: ${description}

톤: ${tone}
언어: ${lang}
문단 수: ${num}

요약 생성해줘.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "너는 책 요약을 만드는 도우미야." },
        { role: "user", content: msg }
      ]
    });

    const text = completion.choices[0].message.content.trim();
    res.json({ summary: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "summary API error" });
  }
});

// ------- 기본 / 라우트 (Cannot GET / 해결 핵심) ---------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// ------- 서버 시작 ---------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
