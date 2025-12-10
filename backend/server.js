import express from "express";
import cors from "cors";
import { OpenAI } from "openai";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 책 정보 불러오기
app.post("/book", async (req, res) => {
  try {
    const { title, author } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `책 제목: ${title}\n작가: ${author}\n이 책의 실제 책 설명(출판사 제공)을 그대로 제공해줘. 존재하지 않으면 "없음"이라고만 답해.`
        }
      ]
    });

    const text = response.choices[0].message.content.trim();

    return res.json({
      description: text === "없음" ? "" : text
    });

  } catch (e) {
    return res.status(500).json({ error: "BOOK_ERROR" });
  }
});

// 요약 생성
app.post("/summary", async (req, res) => {
  try {
    const { title, author, description, tone, lang, num } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
제목: ${title}
작가: ${author}
설명: ${description}

위 설명 내용을 기반으로 ${num}문단 요약을 만들어줘.
톤: ${tone}
언어: ${lang}

설명을 기반으로만 요약해야 하고, 새로운 내용을 만들면 절대 안 돼.
          `
        }
      ]
    });

    return res.json({
      summary: response.choices[0].message.content.trim()
    });

  } catch (e) {
    return res.status(500).json({ error: "SUMMARY_ERROR" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
