function linearRegression(xs, ys) {
  const n = xs.length;

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

exports.predictYield = (history) => {
  if (history.length < 2) return null;

  const years = history.map(h => h.year);
  const yields = history.map(h => h.yield_kg);

  const { slope, intercept } = linearRegression(years, yields);

  const nextYear = Math.max(...years) + 1;
  return Math.round(slope * nextYear + intercept);
};
