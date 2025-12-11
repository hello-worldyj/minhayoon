const API_BOOK = "/book";
const API_SUMMARY = "/summary";

document.getElementById("generate").addEventListener("click", generate);

async function generate() {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();

  if (!title) return alert("책 제목을 입력하세요!");

  const intro = document.getElementById("intro");
  const summary = document.getElementById("summary");

  intro.innerText = "📙 책 설명 생성 중...";
  summary.innerText = "";

  try {
    // 책 설명
    const bookRes = await fetch(API_BOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author })
    });

    const bookData = await bookRes.json();
    const desc = bookData.description || "설명이 없습니다!";

    intro.innerText = desc;

    // 요약
    const sumRes = await fetch(API_SUMMARY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author,
        description: desc,
        tone: "중립",
        lang: "한국어",
        num: 3
      })
    });

    const sumData = await sumRes.json();
    summary.innerText = sumData.summary || "요약 생성 실패";

  } catch (err) {
    intro.innerText = "오류 발생!";
    console.error(err);
  }
}
