import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// path 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// public 폴더 정적 파일 서빙
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

// -------------------- BOOK API --------------------
app.post("/book", async (req, res) => {
  try {
    const { title, author } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
너는 책 정보 검증 도우미다.
- 실제 존재하는 책이 아닐 경우 반드시 "해당 책은 존재하지 않습니다."라고 답한다.
- 절대 창작하지 않는다.
          `
        },
        {
          role: "user",
          content: `책 제목: ${title}, 작가: ${author}`
        }
      ]
    });

    res.json({ description: completion.choices[0].message.content.trim() });

  } catch (err) {
    res.status(500).json({ error: "book API error" });
  }
});

// -------------------- SUMMARY API --------------------
app.post("/summary", async (req, res) => {
  try {
    const { title, author, description, tone, lang, num } = req.body;

    if (
      description.includes("존재하지 않습니다") ||
      description.includes("찾을 수 없습니다")
    ) {
      return res.json({
        summary: "책 정보가 없어 요약을 만들 수 없습니다."
      });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
너는 주어진 설명 안에서만 요약하는 요약가이다.
창작 금지.
          `
        },
        {
          role: "user",
          content: `
제목: ${title}
작가: ${author}
설명: ${description}
요약 문장 수: ${num}
톤: ${tone}
언어: ${lang}
          `
        }
      ]
    });

    res.json({ summary: completion.choices[0].message.content.trim() });

  } catch (err) {
    res.status(500).json({ error: "summary API error" });
  }
});

// -------------------- 마지막: HTML 기본 라우팅 --------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -------------------- SERVER --------------------
app.listen(10000, () => {
  console.log("Server running on 10000");
});
