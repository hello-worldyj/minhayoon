const API_BOOK = "/book";
const API_SUMMARY = "/summary";

async function generate() {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const tone = document.getElementById("tone").value;
  const lang = document.getElementById("lang").value;
  const num = document.getElementById("num").value;

  const intro = document.getElementById("intro");
  const summary = document.getElementById("summary");

  if (!title) return alert("책 제목을 입력해주세요!");

  intro.innerText = "책 정보 불러오는 중…";
  summary.innerText = "";

  try {
    // 📘 책 설명 요청
    const bookRes = await fetch(API_BOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author })
    });

    const bookData = await bookRes.json();
    const desc = bookData.description || "";

    // 설명 없음 → STOP
    if (!desc) {
      intro.innerText = "책 설명이 없어요!";
      summary.innerText = "설명이 없어서 요약을 만들 수 없어요.";
      return;
    }

    intro.innerText = desc;

    // ✏️ 요약 생성
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
    intro.innerText = "문제가 발생했어요!";
  }
}

// 복사
function copyText(id) {
  const t = document.getElementById(id).innerText;
  navigator.clipboard.writeText(t);
}
