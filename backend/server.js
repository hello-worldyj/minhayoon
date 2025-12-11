import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
- 어떤 경우에도 창작하거나 지어내지 않는다.
- 인터넷에 존재하는 사실만 사용하고, 모르면 "정보를 찾을 수 없습니다."라고 말한다.
          `
        },
        {
          role: "user",
          content: `책 제목: ${title}, 작가: ${author}, 설명을 알려줘.`
        }
      ]
    });

    const desc = completion.choices[0].message.content.trim();
    res.json({ description: desc });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "book API error" });
  }
});

// -------------------- SUMMARY API --------------------
app.post("/summary", async (req, res) => {
  try {
    const { title, author, description, tone, lang, num } = req.body;

    // description이 "존재하지 않습니다"인 경우 요약 생성 금지
    if (
      description.includes("존재하지 않습니다") ||
      description.includes("찾을 수 없습니다")
    ) {
      return res.json({
        summary: "책 정보가 없어 요약을 생성할 수 없습니다."
      });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
너는 전문 요약가이다.
- 사용자가 준 설명(description) 안에서만 요약한다.
- 내용을 추가하거나 창작하지 않는다.
          `
        },
        {
          role: "user",
          content: `
제목: ${title}
저자: ${author}
설명: ${description}

요약 문장 수: ${num}
톤: ${tone}
언어: ${lang}
          `
        }
      ]
    });

    const summary = completion.choices[0].message.content.trim();
    res.json({ summary });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "summary API error" });
  }
});

// -------------------- SERVER --------------------
app.listen(10000, () => {
  console.log("Server running on port 10000");
});
