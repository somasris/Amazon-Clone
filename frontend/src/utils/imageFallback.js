function makeSvgDataUri(title = "Product") {
  const safeTitle = String(title).slice(0, 28);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#232f3e'/>
        <stop offset='100%' stop-color='#37475a'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <rect x='60' y='60' width='680' height='680' rx='24' fill='#ffffff' fill-opacity='0.1'/>
    <text x='50%' y='48%' text-anchor='middle' fill='#ffffff' font-size='44' font-family='Arial, sans-serif'>Amazon Clone</text>
    <text x='50%' y='56%' text-anchor='middle' fill='#ffd814' font-size='34' font-family='Arial, sans-serif'>${safeTitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getSafeProductImage(url, title) {
  const value = String(url || "").trim();
  if (!value) return makeSvgDataUri(title);
  return value;
}

export function setFallbackImage(event, title) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = makeSvgDataUri(title);
}
