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
  summary.innerText = "생성 중...";

  try {
    const bookRes = await fetch(API_BOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author })
    });

    const bookData = await bookRes.json();
    const desc = bookData.description || "설명이 없어요!";

    intro.innerText = desc;

    const sumRes = await fetch(API_SUMMARY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author, description: desc, tone, lang, num })
    });

    const sumData = await sumRes.json();
    summary.innerText = sumData.summary;

  } catch (e) {
    intro.innerText = "설명을 불러오지 못했어요.";
    summary.innerText = "요약 생성 실패.";
  }
}

function copyText(id) {
  const t = document.getElementById(id).innerText;
  navigator.clipboard.writeText(t);
}
