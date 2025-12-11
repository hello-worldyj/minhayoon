document.getElementById("generateBtn").addEventListener("click", async () => {
  const payload = {
    title: document.getElementById("title").value,
    author: document.getElementById("author").value,
    description: document.getElementById("description").value,
    tone: document.getElementById("tone").value,
    lang: document.getElementById("lang").value,
    num: document.getElementById("num").value,
  };

  console.log("📤 서버로 보냄:", payload);

  document.getElementById("summary").innerText = "요약 생성 중...";

  const res = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  document.getElementById("summary").innerText = data.summary;
});
