async function getIntro() {
  const titleVal = document.getElementById("title").value.trim();
  const authorVal = document.getElementById("author").value.trim();

  document.getElementById("intro").innerText = "불러오는 중...";

  const res = await fetch("/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: titleVal, author: authorVal }),
  });

  const data = await res.json();
  document.getElementById("intro").innerText = data.description || "설명 없음";
}

async function generate() {
  const description = document.getElementById("intro").innerText;

  const payload = {
    title: title.value,
    author: author.value,
    description,
    tone: tone.value,
    lang: lang.value,
    num: num.value,
  };

  summary.innerText = "요약 생성 중...";

  const res = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  summary.innerText = data.summary;
}
