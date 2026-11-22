// 시나리오 데이터 규칙 — 시뮬레이터(docs/sim)와 유지보수 편집기(docs/editor)가 함께 씁니다.
window.RADR_SCN = (() => {
  const clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
  function merge(a, b) {
    if (b === undefined || b === null) return clone(a);
    if (a === undefined || a === null) return clone(b);
    if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(b) ? clone(b) : clone(a);
    if (typeof a === 'object') {
      if (typeof b !== 'object') return clone(a);
      const o = {};
      new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => { o[k] = merge(a[k], b[k]) });
      return o;
    }
    return typeof a === typeof b ? b : a;
  }
  // 기본 데이터(data.js) 위에 설정(config.js · 브라우저 저장본)을 덮어씁니다.
  function mergeCfg(def, ov) {
    if (!ov || typeof ov !== 'object') return clone(def);
    const c = merge(def, ov);
    if (ov.sizes && typeof ov.sizes === 'object' && Object.keys(ov.sizes).length) c.sizes = clone(ov.sizes); // 규모는 통째로 교체 (삭제 반영)
    if (Array.isArray(ov.phases) && ov.phases.length) {
      const byId = {}; def.phases.forEach(p => byId[p.id] = p); const seen = {};
      c.phases = ov.phases.filter(p => p && typeof p === 'object').map(p => { const d = byId[p.id]; if (d) { seen[p.id] = 1; return merge(d, p) } return clone(p) }); // 단계 순서·추가는 설정을 따름
      def.phases.forEach(p => { if (!seen[p.id]) c.phases.push(Object.assign(clone(p), { on: false })) });
    } else c.phases = clone(def.phases);
    return c;
  }
  return {
    // 내장 단계 ID — 3D 애니메이션이 이 ID(=기본 순서 번호)에 연결됩니다.
    PH_IDS: ['alert', 'assess', 'debris', 'cut', 'excavate', 'backfill', 'compact', 'pour', 'cure', 'fod', 'mark'],
    // 절단 반폭 한계(m): 장비 이동로(z=28)와 지형 패치(±20 m) 안에 들어가야 함
    S_MAX: 14,
    clone, mergeCfg,
  };
})();
