import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

// Google Books API
app.post('/api/book', async (req, res) => {
  const { title, author } = req.body;
  if (!title) return res.status(400).json({ error: "책 제목이 필요합니다." });

  try {
    const query = encodeURIComponent(`${title} ${author || ''}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${process.env.GOOGLE_KEY}&maxResults=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.json({ description: "" });
    }

    const info = data.items[0].volumeInfo;
    res.json({ description: info.description || "" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// OpenAI 요약 API
app.post('/api/summary', async (req, res) => {
  const { title, author, description, tone, lang, num } = req.body;

  if (!description)
    return res.status(400).json({ error: "책 설명이 필요합니다." });

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_KEY
    });

    const prompt = `
    책 제목: ${title}
    저자: ${author}
    책 설명: ${description}
    요청 사항: ${num}개의 문장으로, 톤: ${tone}, 언어: ${lang}으로 요약해줘.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const summary = completion.choices[0].message.content.trim();
    res.json({ summary });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
