const API_BOOK = "/api/book";
const API_SUMMARY = "/api/summary";

async function generate() {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const lang = document.getElementById("lang").value;
  const tone = document.getElementById("tone").value;
  const num = document.getElementById("num").value;

  if (!title) {
    alert("책 제목을 입력해주세요!");
    return;
  }

  document.getElementById("intro").innerText = "불러오는 중...";
  document.getElementById("summary").innerText = "";

  try {
    // 📌 1) 책 설명 가져오기
    const introRes = await fetch(API_BOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author }),
    });

    const introData = await introRes.json();

    // 📌 검색 실패한 경우
    if (introData.error) {
      document.getElementById("intro").innerText = "책을 찾을 수 없어요!";
      document.getElementById("summary").innerText = "";
      return;
    }

    const intro = introData.description || "설명이 없어요!";
    document.getElementById("intro").innerText = intro;

    // 📌 2) 요약 생성 요청
    const sumRes = await fetch(API_SUMMARY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author,
        description: intro,
        tone,
        lang,
        num,
      }),
    });

    const sumData = await sumRes.json();

    if (sumData.error) {
      document.getElementById("summary").innerText = "요약 생성 실패";
      return;
    }

    document.getElementById("summary").innerText = sumData.summary;

  } catch (err) {
    console.log(err);
    document.getElementById("intro").innerText = "오류 발생!";
    document.getElementById("summary").innerText = "요약 실패!";
  }
}

function copyText(id) {
  const text = document.getElementById(id).innerText;
  navigator.clipboard.writeText(text)
    .then(() => alert("복사 완료"))
    .catch(() => alert("복사 실패!!"));
}
