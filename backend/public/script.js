async function generate() {
  intro.innerText = "불러오는 중...";
  summary.innerText = "생성 중...";

  const body = {
    title: title.value,
    author: author.value,
    tone: tone.value,
    lang: lang.value,
    num: num.value
  };

  const res = await fetch("/api/summary", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
  });

  const data = await res.json();

  intro.innerText = data.intro;
  summary.innerText = data.summary;
}
