document.getElementById("generateBtn").addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const description = document.getElementById("description").value.trim();
  const tone = document.getElementById("tone").value;
  const lang = document.getElementById("lang").value;
  const num = document.getElementById("num").value;

  const summaryBox = document.getElementById("summary");
  summaryBox.innerText = "생성 중...";

  const res = await fetch("/api/summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title,
      author,
      description,  // ★ 여기가 핵심 (반드시 서버로 전달)
      tone,
      lang,
      num
    })
  });

  const data = await res.json();
  summaryBox.innerText = data.summary;
});
