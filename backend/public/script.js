const API_BOOK = "https://hayoon-m8u6.onrender.com/book";
const API_SUMMARY = "https://hayoon-m8u6.onrender.com/summary";

async function generate() {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const tone = document.getElementById("tone").value.trim();
  const lang = document.getElementById("lang").value.trim();
  const num = document.getElementById("num").value.trim();

  const intro = document.getElementById("intro");
  const summaryBox = document.getElementById("summary");

  if (!title) return alert("책 제목을 입력해주세요.");

  intro.innerText = "책 설명 불러오는 중...";
  summaryBox.innerText = "";

  try {
    // 1) 책 설명 요청
    const bookRes = await fetch(API_BOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author })
    });

    const bookData = await bookRes.json();
    const desc = bookData.description;

    // 2) 없는 책이면 중단
    if (
      desc.includes("존재하지 않습니다") ||
      desc.includes("찾을 수 없습니다")
    ) {
      intro.innerText = desc;
      summaryBox.innerText = "요약 생성 불가";
      return;
    }

    intro.innerText = desc;

    // 3) 요약 생성 요청
    const sumRes = await fetch(API_SUMMARY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author,
        description: desc,
        tone,
        lang,
        num,
      })
    });

    const sumData = await sumRes.json();
    summaryBox.innerText = sumData.summary;

  } catch (err) {
    intro.innerText = "오류 발생!";
    summaryBox.innerText = "";
  }
}

function copyText(id) {
  const t = document.getElementById(id).innerText;
  navigator.clipboard.writeText(t);
}
