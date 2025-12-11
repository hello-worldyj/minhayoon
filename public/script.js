async function generate() {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const intro = document.getElementById("intro");
  const summary = document.getElementById("summary");

  intro.value = "책 설명 생성 중...";
  summary.value = "";

  // 1) 책 설명 요청
  const bookRes = await fetch("/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author })
  });

  const bookData = await bookRes.json();
  const desc = bookData.description;

  intro.value = desc;

  // 2) 요약 생성 요청
  const tone = document.getElementById("tone").value;
  const lang = document.getElementById("lang").value;
  const num = document.getElementById("num").value;

  summary.value = "요약 생성 중...";

  const sumRes = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author, description: desc, tone, lang, num })
  });

  const sumData = await sumRes.json();
  summary.value = sumData.summary;
}

