document.getElementById("generateBtn").addEventListener("click", generate);

async function generate() {
  const titleVal = document.getElementById("titleInput").value.trim();
  const authorVal = document.getElementById("author").value.trim();
  const langVal = document.getElementById("lang").value;
  const toneVal = document.getElementById("tone").value;
  const numVal = document.getElementById("num").value;

  if (!titleVal) return alert("책 제목을 버리지 마세요.");

  document.getElementById("intro").innerText = "불러오는 중...";
  document.getElementById("summary").innerText = "생성 중...";

  try {
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titleVal,
        author: authorVal,
        lang: langVal,
        tone: toneVal,
        num: numVal
      })
    });

    const data = await res.json();

    document.getElementById("intro").innerText =
      data.intro || "소개가 있엇는데 없어요";

    document.getElementById("summary").innerText =
      data.summary || "요약 생성 실패! ㅋ 와 ㅊㅊ";

  } catch (err) {
    document.getElementById("intro").innerText = "오류 발생!";
    document.getElementById("summary").innerText = "서버와 연결 실패!ㅋ";
  }
}
