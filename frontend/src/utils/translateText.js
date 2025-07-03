export async function translateText(text, targetLang) {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      target: targetLang,
    }),
  });

  const data = await res.json();
  return data.translatedText;
}
