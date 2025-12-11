import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

// =======================
// 책 설명 생성 API
// =======================
app.post("/api/book", async (req, res) => {
  try {
    const { title, author } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "당신은 책 정보를 생성하는 도우미입니다." },
        { role: "user", content: `책 제목: ${title}\n저자: ${author}\n이 책의 설명을 생성해줘.` }
      ]
    });

    res.json({
      description: completion.choices[0].message.content.trim()
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =======================
// 요약 생성 API
// =======================
app.post("/api/summary", async (req, res) => {
  try {
    const { title, author, description, tone, lang, num } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "당신은 텍스트 요약을 생성하는 도우미입니다." },
        {
          role: "user",
          content:
            `제목: ${title}\n저자: ${author}\n설명: ${description}\n` +
            `톤: ${tone}\n언어: ${lang}\n문단 수: ${num}\n위 내용으로 요약문을 작성해줘.`
        }
      ]
    });

    res.json({
      summary: completion.choices[0].message.content.trim()
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =======================
// 서버 실행
// =======================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on", PORT));
