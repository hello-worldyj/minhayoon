const API_BOOK = "/api/book";
const API_SUMMARY = "/api/summary";

async function generate() {
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const lang = langInput.value;
  const tone = toneInput.value;
  const num = numInput.value;

  if (!title) return alert("책 제목을 입력해주세요!");

  intro.innerText = "불러오는 중...";
  summary.innerText = "";

  try {
    // 📌 1) 책 설명 요청
    const bookRes = await fetch(API_BOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author })
    });

    const bookData = await bookRes.json();
    const desc = bookData.description;

    // ❗ 설명 없으면 여기서 STOP
    if (!desc) {
      intro.innerText = "설명이 없어요!";
      summary.innerText = "책 설명이 없어서 요약을 만들 수 없어요.";
      return; // ← OpenAI 호출 절대 안함
    }

    intro.innerText = desc;

    // 📌 2) 요약 생성
    const sumRes = await fetch(API_SUMMARY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author,
        description: desc,
        tone,
        lang,
        num
      })
    });

    const sumData = await sumRes.json();
    summary.innerText = sumData.summary;

  } catch (e) {
    intro.innerText = "설명을 불러오지 못했어요.";
    summary.innerText = "요약 생성 실패.";
  }
}
