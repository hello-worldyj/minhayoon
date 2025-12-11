async function generate() {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const lang = document.getElementById("lang").value;
  const tone = document.getElementById("tone").value;
  const num = document.getElementById("num").value;

  document.getElementById("output").textContent = "불러오는 중...";

  // 책 설명 요청
  const bookRes = await fetch(`/book?title=${title}&author=${author}`);
  const bookData = await bookRes.json();

  const description = bookData.description;

  // 요약 생성 요청
  const summaryRes = await fetch("/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      author,
      description,
      lang,
      tone,
      num
    })
  });

  const summaryData = await summaryRes.json();
  document.getElementById("output").textContent = summaryData.summary;
}
