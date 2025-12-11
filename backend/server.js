app.post("/api/summary", async (req, res) => {
  try {
    const { title, author, description, tone, lang, num } = req.body;
  
    const safeDesc = description
      ? description
      : "설명이 없어서 내용을 생성할 수 없어요.";
  
    const prompt = `
규칙:
1) 설명이 없으면 "설명이 없어요"라고 말하기
2) 새로운 내용 상상 금지
3) 문체: ${tone}
4) 언어: ${lang}
5) 문장 수: ${num}

책 제목: ${title}
작가: ${author}

설명:
${safeDesc}
`;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });

    res.json({ summary: response.output_text });

  } catch (e) {
    console.log("SUMMARY ERROR:", e);
    res.json({ summary: "요약 생성 중 오류가 발생했습니다." });
  }
});
