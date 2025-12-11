document.getElementById("generateBtn").addEventListener("click", async () => {
  const title = document.getElementById("titleInput").value.trim();

  if (!title) return alert("책 제목을 버리지 마세요.");

  const res = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      lang: "ko",
      tone: "부드럽고 이해하기 쉬운",
      num: 5
    })
  });

  const data = await res.json();

  document.getElementById("descriptionText").innerText =
    data.bookInfo?.description || "설명이 있었는데 없어요";

  document.getElementById("summaryText").innerText =
    data.summary || "요약 생성 실패! ㅋ 와 ㅊㅊ";
});
