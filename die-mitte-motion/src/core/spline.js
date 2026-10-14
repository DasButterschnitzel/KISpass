// Monotone cubic interpolation (Fritsch–Carlson) for camera paths:
// C1-continuous through every key, no overshoot between keys.

export function monotone(ts, vs) {
  const n = ts.length;
  const d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      m[i] = k * a * d[i];
      m[i + 1] = k * b * d[i];
    }
  }
  return (t) => {
    if (t <= ts[0]) return vs[0];
    if (t >= ts[n - 1]) return vs[n - 1];
    let i = 0;
    while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * vs[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * vs[i + 1] + (u3 - u2) * h * m[i + 1];
  };
}

/** Camera path from keys { t, z, F:[x,y], S:[x,y] }; zoom is interpolated in log space. */
export function cameraPath(keys) {
  const ts = keys.map((k) => k.t);
  const lz = monotone(ts, keys.map((k) => Math.log(k.z)));
  const fx = monotone(ts, keys.map((k) => k.F[0]));
  const fy = monotone(ts, keys.map((k) => k.F[1]));
  const sx = monotone(ts, keys.map((k) => k.S[0]));
  const sy = monotone(ts, keys.map((k) => k.S[1]));
  return (t) => ({ z: Math.exp(lz(t)), F: [fx(t), fy(t)], S: [sx(t), sy(t)] });
}
