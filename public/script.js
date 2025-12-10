document.getElementById("generateBtn").addEventListener("click", async () => {
  const content = document.getElementById("bookContent").value;
  const tone = document.getElementById("tone").value;
  const style = document.getElementById("style").value;

  if (!content.trim()) {
    document.getElementById("result").innerText = "책 내용을 입력해주세요!";
    return;
  }

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, tone, style })
  });

  const data = await response.json();
  document.getElementById("result").innerText = data.summary;
});
