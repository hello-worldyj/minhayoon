const API_BOOK = '/api/book';
const API_SUMMARY = '/api/summary';

async function generate() {
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const lang = document.getElementById('lang').value;
  const tone = document.getElementById('tone').value;
  const num = document.getElementById('num').value;

  if (!title) {
    alert('책 제목을 입력해주세요.');
    return;
  }

  document.getElementById('intro').innerText = '책 정보를 불러오는 중...';
  document.getElementById('summary').innerText = '요약을 만드는 중...';

  try {
    // 1) 책 설명 가져오기
    const introRes = await fetch(API_BOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author })
    });
    const introData = await introRes.json();

    const intro = introData.description || '설명이 없습니다.';
    document.getElementById('intro').innerText = intro;

    // 2) 요약 생성 요청
    const sumRes = await fetch(API_SUMMARY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        author,
        description: intro,
        tone,
        lang,
        num
      })
    });
    const sumData = await sumRes.json();

    document.getElementById('summary').innerText = sumData.summary || '요약 생성 실패';

  } catch (error) {
    document.getElementById('intro').innerText = '책 정보를 불러오는 데 실패했습니다.';
    document.getElementById('summary').innerText = '요약 생성 중 오류가 발생했습니다.';
    console.error(error);
    alert('오류가 발생했습니다. 콘솔을 확인해주세요.');
  }
}

function copyText(id) {
  const text = document.getElementById(id).innerText;
  navigator.clipboard.writeText(text)
    .then(() => alert('복사 완료!'))
    .catch(() => alert('복사에 실패했습니다.'));
}
