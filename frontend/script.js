async function generate() {
  const titleVal = title.value.trim();
  const authorVal = author.value.trim();
  const langVal = lang.value;
  const toneVal = tone.value;
  const numVal = num.value;

  intro.innerText = "불러오는 중...";
  summary.innerText = "생성 중...";

  // 책 설명
  const introRes = await fetch("/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: titleVal, author: authorVal })
  });

  const introData = await introRes.json();
  intro.innerText = introData.description || "설명이 없어요!";

  // 요약
  const sumRes = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: titleVal,
      author: authorVal,
      description: introData.description,
      tone: toneVal,
      lang: langVal,
      num: numVal
    })
  });

  const sumData = await sumRes.json();
  summary.innerText = sumData.summary;
}
