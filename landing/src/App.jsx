import { useEffect, useRef, useState } from 'react';
import {
  PHASES, TOTAL_MIN, EQUIP, EQUIP_ORDER, SIZES, HOTSPOTS, CONTROLS, KEYS, QUIZ_SETS, GRADES,
  LEVELS, XP_RULES, BADGES, AI_SAMPLES, LESSON, FAQ, simLink,
} from './data.js';

const pad = (n) => String(n).padStart(2, '0');
const hm = (m) => `${Math.floor(m / 60)}:${pad(m % 60)}`;
const NAV = [
  ['overview', '개요'], ['procedure', '11단계 절차'], ['screen', '화면 안내'], ['controls', '조작법'],
  ['modes', '모드'], ['game', '레벨·배지'], ['equipment', '장비'], ['teacher', '교관 가이드'], ['faq', 'FAQ'],
];

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="wrap navin">
        <a className="brand" href="#top" onClick={() => setOpen(false)}>
          <img src="./favicon.svg" alt="" width="24" height="24" />
          <span>RADR 피해복구 훈련</span>
        </a>
        <nav className={open ? 'links open' : 'links'} aria-label="페이지 목차">
          {NAV.map(([id, t]) => <a key={id} href={'#' + id} onClick={() => setOpen(false)}>{t}</a>)}
        </nav>
        <a className="btn pri sm" href={simLink()}>훈련 시작</a>
        <button className="menu" aria-label="목차 열기" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap herogrid">
        <div className="herotext">
          <p className="eyebrow">RADR · Rapid Airfield Damage Repair</p>
          <h1>활주로 피해복구,<br />3D로 보고 문제로 확인합니다</h1>
          <p className="lead">
            공습으로 파인 활주로 크레이터를 11단계 절차에 따라 복구하는 과정을 실사형 3D로 재생합니다.
            장비 9종의 움직임과 지층 단면을 직접 돌려 보고, 평가 모드와 AI 교관으로 배운 내용을 확인한 뒤
            결과를 교관에게 제출할 수 있습니다. 설치 없이 PC와 휴대폰 브라우저에서 바로 열립니다.
          </p>
          <div className="cta">
            <a className="btn pri" href={simLink()}>학습 시작하기</a>
            <a className="btn" href={simLink({ mode: 'quiz' })}>평가 바로가기</a>
            <a className="btn ghost" href="#screen">화면 사용법 먼저 보기 ↓</a>
          </div>
          <dl className="stats">
            <div><dt>복구 절차</dt><dd>11단계</dd></div>
            <div><dt>투입 장비</dt><dd>9종</dd></div>
            <div><dt>평가 유형</dt><dd>3종</dd></div>
            <div><dt>예시 총 소요</dt><dd>{hm(TOTAL_MIN)}</dd></div>
          </dl>
        </div>
        <figure className="shot herofig">
          <img src="./shots/hero.jpg" alt="굴삭기가 절단선 안쪽을 파내 덤프트럭에 싣는 장면. 크레이터 직경·깊이·융기부 치수가 표시되어 있다." width="1440" height="860" />
        </figure>
      </div>
    </section>
  );
}

function Overview() {
  const feats = [
    ['blast', '피해 순간부터 재현', '사이렌, 폭발 불꽃과 연기, 튀어 오르는 파편, 포장에 남는 방사형 균열과 그을음까지 피해 상황을 먼저 보여 줍니다.'],
    ['cut', '실제 장비 동작', '절단기 블레이드 회전, 굴삭기 붐·암·버킷과 유압실린더, 덤프 적재함 상승, 롤러 진동, 바퀴와 궤도 구름까지 단계별로 움직입니다.'],
    ['section', '단면으로 지층 확인', '「단면」 카메라는 크레이터 중심을 잘라 기존 슬래브, 쇄석 되메움, 급속경화 콘크리트 층을 색으로 구분해 보여 줍니다.'],
    ['pour', '작업자와 재료 변화', '측정 요원, 신호수, 스크리드 작업자가 등장하고, 젖은 콘크리트가 양생되며 밝아지는 변화까지 표현합니다.'],
  ];
  return (
    <section id="overview" className="sec">
      <div className="wrap">
        <SecHead n="01" t="무엇을 할 수 있나요" d="교육생은 절차를 눈으로 익히고, 교관은 같은 화면으로 수업과 평가를 진행합니다." />
        <div className="three">
          <Card t="보면서 배우기 · 학습 모드" items={['11단계를 재생·일시정지·배속으로 시청', '단계마다 목표, 세부 작업, 투입 장비, 예시 소요 시간 확인', '크레이터 규모 3종을 바꿔 치수·물량 비교', '장비를 눌러 제원과 영문 명칭 확인', '5가지 카메라와 단면 보기']} />
          <Card t="문제로 확인하기 · 평가 모드" items={['종합 평가 10문항 (합격선 70%)', '영어 용어 퀴즈 8문항', '3D에서 장비를 직접 찾는 문제 5문항', '제한시간 · 빠른 답 보너스 · 연속 정답 보너스', '등급, 오답 해설, 「단계 다시 보기」, 결과 복사']} />
          <Card t="물어보며 익히기 · AI 교관" items={['절차·장비·용어를 한국어나 영어로 질문', '「지금 단계 설명해줘」로 현재 장면 해설', '답변에서 해당 장면이나 장비로 바로 이동', '실제 AI 미연결 PoC (교범 요약 기반)']} />
        </div>
        <div className="feats">
          {feats.map(([img, t, d]) => (
            <figure key={img} className="feat">
              <img src={`./shots/${img}.jpg`} alt={t} loading="lazy" width="1200" height="720" />
              <figcaption><b>{t}</b><span>{d}</span></figcaption>
            </figure>
          ))}
        </div>
        <div className="sizes">
          <h3>크레이터 규모 3종</h3>
          <p className="muted">왼쪽 위 「소형 · 중형 · 대형」 버튼으로 바꿉니다. 지형과 아래 치수, 장비 동선이 함께 바뀝니다.</p>
          <div className="tbl">
            <table className="stack">
              <thead><tr><th>규모</th><th>겉보기 직경</th><th>깊이</th><th>융기부 직경</th><th>절단 규격</th><th /></tr></thead>
              <tbody>
                {SIZES.map((s) => (
                  <tr key={s.key}><td className="rowhead"><b>{s.label} 크레이터</b></td><td data-label="겉보기 직경">{s.dia}</td><td data-label="깊이">{s.depth}</td><td data-label="융기부 직경">{s.up}</td><td data-label="절단 규격">{s.cut}</td>
                    <td className="rowlink"><a href={simLink({ size: s.key })}>이 규모로 열기 →</a></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function Procedure() {
  const [i, setI] = useState(0);
  const p = PHASES[i];
  let acc = 0;
  const starts = PHASES.map((q) => { const s = acc; acc += q.min; return s; });
  return (
    <section id="procedure" className="sec alt">
      <div className="wrap">
        <SecHead n="02" t="11단계 복구 절차" d="단계를 누르면 무엇을 하는지, 시뮬레이터에서 무엇이 보이는지 설명합니다. 「이 단계부터 보기」를 누르면 그 장면에서 시뮬레이터가 열립니다." />
        <div className="proc">
          <ol className="plist">
            {PHASES.map((q, j) => (
              <li key={j}>
                <button className={j === i ? 'on' : ''} onClick={() => setI(j)} aria-current={j === i} aria-label={`${pad(j)} ${q.title}`} title={q.title}>
                  <span className="n">{pad(j)}</span><span className="t">{q.title}</span><span className="m">{q.min}분</span>
                </button>
              </li>
            ))}
          </ol>
          <article className="pdetail" aria-live="polite">
            <p className="k">단계 {pad(i)} / 10 · {p.en}</p>
            <h3>{p.title}</h3>
            <p className="pill">소요 {p.min}분 · 누적 T+{hm(starts[i])}~{hm(starts[i] + p.min)}</p>
            <p className="goal">{p.goal}</p>
            <h4>세부 작업</h4>
            <ol className="steps">{p.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            <h4>시뮬레이터에서 보이는 것</h4>
            <p>{p.see}</p>
            <h4>투입 장비</h4>
            <div className="chips">
              {p.equip.length ? p.equip.map((k) => <a key={k} href="#equipment" className="chip">{EQUIP[k].name}</a>)
                : <span className="muted">{i === 0 ? '모든 장비가 대기 지역에서 출동 준비' : '투입 장비 없음 · 표면 보호 중'}</span>}
            </div>
            <div className="cta">
              <a className="btn pri" href={simLink({ phase: i })}>이 단계부터 보기</a>
              {i < 10 && <button className="btn" onClick={() => setI(i + 1)}>다음 단계 설명 →</button>}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function Screen() {
  const [h, setH] = useState(0);
  const cur = HOTSPOTS[h];
  const scroller = useRef(null);
  // On phones the screenshot is wider than the screen; keep the chosen marker in view.
  useEffect(() => {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const x = (HOTSPOTS[h].x / 100) * el.scrollWidth - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, x), behavior: 'smooth' });
  }, [h]);
  return (
    <section id="screen" className="sec">
      <div className="wrap">
        <SecHead n="03" t="화면 안내 · 어디에 무엇이 있나요" d="실제 시뮬레이터 화면입니다. 번호를 누르면 그 부분이 무엇이고 누르면 어떻게 되는지 오른쪽에 설명이 나옵니다." />
        <div className="screen">
          <div className="annotwrap">
          <p className="swipe">← 이미지를 옆으로 밀어 보세요 →</p>
          <div className="annotscroll" ref={scroller}>
          <div className="annot">
            <img src="./shots/ui.jpg" alt="시뮬레이터 전체 화면. 왼쪽 위 머리 패널, 가운데 3D 현장, 오른쪽 브리핑 창, 아래 재생 바와 타임라인." width="1440" height="860" />
            {HOTSPOTS.map((s, j) => (
              <button key={j} className={j === h ? 'hs on' : 'hs'} style={{ left: s.x + '%', top: s.y + '%' }}
                onClick={() => setH(j)} aria-label={`${j + 1}. ${s.t}`}>{j + 1}</button>
            ))}
          </div>
          </div>
          </div>
          <aside className="hsinfo" aria-live="polite">
            <p className="k">{h + 1} / {HOTSPOTS.length}</p>
            <h3>{cur.t}</h3>
            <p>{cur.d}</p>
            <div className="hsnav">
              <button className="btn sm" onClick={() => setH((h + HOTSPOTS.length - 1) % HOTSPOTS.length)}>← 이전</button>
              <button className="btn sm" onClick={() => setH((h + 1) % HOTSPOTS.length)}>다음 →</button>
            </div>
            <ol className="hslist">
              {HOTSPOTS.map((s, j) => <li key={j}><button className={j === h ? 'on' : ''} onClick={() => setH(j)}><i>{j + 1}</i>{s.t}</button></li>)}
            </ol>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Controls() {
  return (
    <section id="controls" className="sec alt">
      <div className="wrap">
        <SecHead n="04" t="조작법 · 누르면 무엇이 되나요" d="모든 버튼과 동작을 위치별로 정리했습니다. PC는 마우스와 키보드, 휴대폰은 터치로 같은 기능을 씁니다." />
        <div className="ctrl">
          {CONTROLS.map((g) => (
            <div key={g.g} className="cgroup">
              <h3>{g.g}</h3>
              <div className="tbl">
                <table className="stack">
                  <thead><tr><th>누르는 곳 · 동작</th><th>결과</th><th>참고</th></tr></thead>
                  <tbody>{g.rows.map((r) => <tr key={r[0]}><td className="rowhead"><b>{r[0]}</b></td><td data-label="결과">{r[1]}</td><td data-label="참고" className="muted">{r[2]}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        <div className="keys">
          <h3>키보드 단축키</h3>
          <ul>{KEYS.map(([k, d]) => <li key={k}><kbd>{k}</kbd><span>{d}</span></li>)}</ul>
        </div>
        <div className="mobile">
          <img src="./shots/mobile.jpg" alt="휴대폰 세로 화면. 위에 모드 패널, 가운데 3D, 아래 브리핑과 한 줄 재생 바." loading="lazy" width="390" height="844" />
          <div>
            <h3>휴대폰에서 쓸 때</h3>
            <ul className="dots">
              <li><b>가로로 돌리면</b> 3D 화면이 넓어지고 패널이 양옆으로 갈라집니다. 세로에서는 브리핑이 아래쪽 시트로 나옵니다.</li>
              <li><b>아래 버튼 줄은 옆으로 밉니다.</b> 재생 버튼과 시계가 맨 앞에 있고, 카메라·설정·창 버튼은 오른쪽으로 밀면 나옵니다.</li>
              <li><b>한 손가락</b>으로 돌리고, <b>두 손가락</b>으로 확대·이동하며, 장비를 <b>탭</b>하면 제원이 열립니다.</li>
              <li>휴대폰은 자동으로 <b>화질 「저」</b>가 적용됩니다. 그래도 느리면 「UI 숨김」으로 패널을 접어 보세요.</li>
              <li>절차 창은 작은 화면에서 처음에 닫혀 있습니다. 「절차」 버튼으로 엽니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Modes() {
  const [tab, setTab] = useState('learn');
  const tabs = [['learn', '학습 모드'], ['quiz', '평가 모드'], ['ai', 'AI 교관 (PoC)']];
  return (
    <section id="modes" className="sec">
      <div className="wrap">
        <SecHead n="05" t="세 가지 모드" d="왼쪽 위 「학습 · 평가 · AI 교관」 버튼으로 전환합니다." />
        <div className="tabs" role="tablist">
          {tabs.map(([k, t]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>)}
        </div>
        {tab === 'learn' && (
          <div className="mode">
            <div>
              <h3>학습 모드 · 처음 열면 이 모드입니다</h3>
              <p>시뮬레이션이 자동으로 재생되고, 카메라가 지금 일하는 장비를 따라가며 천천히 돕니다.</p>
              <ol className="steps">
                <li>▶ 재생 상태로 처음부터 끝까지 보면 단계마다 <b>+20 XP</b>와 절차 목록의 ✓ 표시를 받습니다.</li>
                <li>궁금한 장면에서 <b>Space</b>로 멈추고 드래그로 돌려 보세요. 직접 돌리면 자동 카메라가 꺼지고, 「자동」을 다시 누르면 켜집니다.</li>
                <li>오른쪽 <b>브리핑</b>에서 목표와 세부 작업을, <b>진행 미터</b>에서 작업량을 확인합니다.</li>
                <li>「투입 장비」 칩이나 3D 장비를 눌러 <b>제원</b>을 보고 「이 장비 따라가기」로 추적합니다.</li>
                <li>「단면」으로 지층을, 「평면」으로 절단 정사각형을 확인합니다.</li>
                <li>끝까지 보면 「평가에서 배운 내용을 확인해 보세요」 알림이 뜹니다.</li>
              </ol>
              <a className="btn pri" href={simLink()}>학습 모드 열기</a>
            </div>
            <img src="./shots/ui.jpg" alt="학습 모드 화면" loading="lazy" width="1440" height="860" />
          </div>
        )}
        {tab === 'quiz' && (
          <div className="quizwrap">
            <div className="mode">
              <div>
                <h3>평가 모드 · 세 가지 문제 세트</h3>
                <p>「평가」를 누르면 시뮬레이션이 멈추고 장비 대기 지역이 보이며, 오른쪽에 세트 선택 화면이 나옵니다. 문제를 푸는 동안 장비 이름표는 숨겨집니다. 장면이 필요한 문제는 해당 장면으로 화면이 바뀝니다.</p>
                <div className="sets">
                  {QUIZ_SETS.map((s) => (
                    <div key={s.id} className="set">
                      <div className="sethd"><b>{s.name}</b><span className="tag">{s.n}문항</span></div>
                      <p>{s.d}</p>
                      <p className="muted">예) {s.ex}</p>
                      <a className="btn sm" href={simLink({ mode: 'quiz', quiz: s.id })}>바로 시작 →</a>
                    </div>
                  ))}
                </div>
              </div>
              <div className="stack">
                <img src="./shots/quiz.jpg" alt="종합 평가 문제 화면" loading="lazy" width="1440" height="860" />
                <img src="./shots/find.jpg" alt="3D 장비 찾기 문제 화면" loading="lazy" width="1440" height="860" />
              </div>
            </div>
            <div className="three">
              <div className="card">
                <h4>점수 계산</h4>
                <ul className="dots">
                  <li>정답 기본 <b>100점</b></li>
                  <li>빠른 답 보너스 <b>최대 50점</b> (남은 시간 비율만큼)</li>
                  <li>연속 정답 보너스 2연속부터 <b>+10, +20 … 최대 50점</b></li>
                  <li>제한시간 <b>25초</b>(장비 찾기 30초). 마지막 5초에 경고음, 시간이 끝나면 오답 처리</li>
                  <li>키보드 <kbd>1</kbd>~<kbd>4</kbd>로 답하고 <kbd>Enter</kbd>로 다음 문제</li>
                </ul>
              </div>
              <div className="card">
                <h4>등급과 합격</h4>
                <table className="mini"><tbody>{GRADES.map((g) => <tr key={g[0]}><td><b className={g[0] === 'F' || g[0] === 'C' ? 'bad' : 'ok'}>{g[0]}</b></td><td>{g[1]}</td><td>{g[2]}</td></tr>)}</tbody></table>
                <p className="muted">합격선은 정답률 70%(B 이상)입니다.</p>
              </div>
              <div className="card">
                <h4>결과 화면에서 할 수 있는 것</h4>
                <ul className="dots">
                  <li>점수, 정답률, 소요 시간, 최고 연속 정답 확인</li>
                  <li><b>틀린 문항 다시 보기</b>: 내 답, 정답, 해설, 「단계 다시 보기」</li>
                  <li>이름(군번) 입력 후 <b>「결과 복사」</b> → 교관에게 붙여넣어 제출</li>
                  <li>다시 풀기 · 다른 평가 선택 · 학습으로 돌아가기</li>
                </ul>
              </div>
            </div>
            <div className="copybox">
              <p className="k">「결과 복사」로 복사되는 내용 예시</p>
              <pre>{`[RADR 활주로 피해복구 훈련 결과]
이름: 홍길동 (12-345678)
일시: 2026. 11. 13. 오후 3:20:11
평가: 종합 평가
점수: 1240점 · 정답률 90% (9/10) · 등급 S · 합격
레벨: Lv.4 복구 분대원 (520 XP) · 학습 단계 11/11`}</pre>
            </div>
          </div>
        )}
        {tab === 'ai' && (
          <div className="mode">
            <div>
              <h3>AI 교관 · 질의응답 (PoC 데모)</h3>
              <p>오른쪽 창 아래 입력칸에 질문을 쓰고 「질문」을 누릅니다. 추천 질문 버튼을 눌러도 됩니다. 답변 아래의 <b>「단계 NN 장면 보기」</b>는 그 장면으로 이동해 재생하고, <b>「3D에서 장비 보기」</b>는 장비 제원을 열고 따라갑니다. AI 교관 모드에서도 시뮬레이션은 계속 재생됩니다.</p>
              <p className="note"><b>실제 AI 서버에 연결되어 있지 않습니다.</b> 시뮬레이터 안에 들어 있는 교범 요약(절차 11단계, 장비 9종, 주요 용어)에서 키워드로 답을 고릅니다. 질문은 외부로 전송되지 않습니다. 준비되지 않은 질문에는 예시 질문을 안내합니다.</p>
              <h4>이런 질문을 할 수 있습니다</h4>
              <div className="chips">{AI_SAMPLES.map((q) => <span key={q} className="chip">{q}</span>)}</div>
              <ul className="dots">
                <li>「지금 · 현재 · 이 단계」가 들어가면 지금 보고 있는 단계를 설명합니다.</li>
                <li>치수·물량 답변은 선택한 크레이터 규모에 맞춰 계산됩니다.</li>
                <li>답을 찾은 질문은 처음 3번까지 +5 XP, 3번째에 「질문하는 학습자」 배지.</li>
                <li>「대화 지우기」로 대화를 처음부터 다시 시작합니다.</li>
              </ul>
              <a className="btn pri" href={simLink({ mode: 'ai' })}>AI 교관 열기</a>
            </div>
            <img src="./shots/ai.jpg" alt="AI 교관 질의응답 화면" loading="lazy" width="1440" height="860" />
          </div>
        )}
      </div>
    </section>
  );
}

function Game() {
  return (
    <section id="game" className="sec alt">
      <div className="wrap">
        <SecHead n="06" t="레벨 · XP · 배지" d="학습하고 평가할수록 XP가 쌓여 레벨과 칭호가 오릅니다. 획득 순간 화면 위에 알림과 효과음이 나옵니다. 왼쪽 위 레벨 카드를 누르면 전체 기록을 봅니다." />
        <div className="two">
          <div>
            <h3>XP 받는 방법</h3>
            <div className="tbl"><table className="stack xp"><tbody>{XP_RULES.map((r) => <tr key={r[0]}><td className="rowhead"><b>{r[0]}</b> <span className="num">{r[1]}</span></td><td className="muted">{r[2]}</td></tr>)}</tbody></table></div>
          </div>
          <div>
            <h3>레벨 8단계</h3>
            <div className="levels">
              {LEVELS.map(([lv, t, xp]) => <div key={lv} className="lv"><span className="n">Lv.{lv}</span><b>{t}</b><span className="muted">{xp.toLocaleString()} XP~</span></div>)}
            </div>
          </div>
        </div>
        <h3 className="mt">배지 11종</h3>
        <div className="badges">
          {BADGES.map(([ic, n, d]) => <div key={n} className="badge"><span className="ic">{ic}</span><span><b>{n}</b><small>{d}</small></span></div>)}
        </div>
        <p className="note">기록(XP, 이수 단계, 배지, 최근 평가 30건, 이름)은 지금 쓰는 브라우저에만 저장됩니다. 다른 기기와 공유되지 않으며, 「학습 기록 → 기록 초기화」로 지울 수 있습니다.</p>
      </div>
    </section>
  );
}

function Equipment() {
  return (
    <section id="equipment" className="sec">
      <div className="wrap">
        <SecHead n="07" t="투입 장비 9종" d="3D 화면이나 브리핑의 장비 칩을 누르면 같은 제원 카드가 열립니다. 제원은 교육용 대표값입니다." />
        <div className="equip">
          {EQUIP_ORDER.map((k) => {
            const e = EQUIP[k];
            const used = PHASES.map((p, i) => (p.equip.includes(k) ? i : -1)).filter((i) => i >= 0);
            return (
              <article key={k} className="eq">
                <h3>{e.name}</h3>
                <p className="en">{e.en}</p>
                <p>{e.role}</p>
                <table className="mini"><tbody>{e.specs.map((s) => <tr key={s[0]}><td>{s[0]}</td><td>{s[1]}</td></tr>)}</tbody></table>
                <p className="used">투입 단계 {used.map((i) => <a key={i} href={simLink({ phase: i })}>{pad(i)} {PHASES[i].title}</a>)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Teacher() {
  return (
    <section id="teacher" className="sec alt">
      <div className="wrap">
        <SecHead n="08" t="교관 가이드 · 45분 수업 예시" d="프로젝터나 대형 화면에 시뮬레이터를 띄우고, 교육생은 각자 휴대폰이나 PC로 같은 주소를 엽니다." />
        <ol className="lesson">
          {LESSON.map(([time, t, d]) => <li key={t}><span className="time">{time}</span><div><b>{t}</b><p>{d}</p></div></li>)}
        </ol>
        <div className="three">
          <Card t="결과 모으는 방법" items={['교육생이 결과 화면에서 이름·군번 입력', '「결과 복사」 후 단체 메신저나 이메일에 붙여넣기', '점수 · 정답률 · 등급 · 합격 여부 · 레벨 · 이수 단계가 한 번에 전달']} />
          <Card t="바로가기 주소 활용" items={['굴착 장면부터: sim/?phase=4', '대형 크레이터: sim/?size=large', '종합 평가 바로: sim/?mode=quiz&quiz=general', '영어 퀴즈 바로: sim/?mode=quiz&quiz=english', 'AI 교관: sim/?mode=ai']} />
          <Card t="알아 둘 점" items={['수치·시간은 교육용 예시값입니다', '기록은 각자 브라우저에만 저장됩니다', '처음 열 때 인터넷 연결이 필요합니다', 'AI 교관은 실제 AI가 아닌 PoC입니다']} />
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="sec">
      <div className="wrap">
        <SecHead n="09" t="자주 묻는 질문" />
        <div className="faq">
          {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>
        <div className="final">
          <h2>지금 바로 훈련을 시작하세요</h2>
          <p className="muted">설치나 로그인 없이 열립니다.</p>
          <div className="cta center">
            <a className="btn pri" href={simLink()}>학습 시작하기</a>
            <a className="btn" href={simLink({ mode: 'quiz', quiz: 'general' })}>종합 평가 바로 풀기</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecHead({ n, t, d }) {
  return (
    <div className="sechead">
      <span className="secn">{n}</span>
      <h2>{t}</h2>
      {d && <p className="muted">{d}</p>}
    </div>
  );
}

function Card({ t, items }) {
  return (
    <div className="card">
      <h4>{t}</h4>
      <ul className="dots">{items.map((x) => <li key={x}>{x}</li>)}</ul>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
  }, []);
  return (
    <>
      <Nav />
      <main>
        <Hero /><Overview /><Procedure /><Screen /><Controls /><Modes /><Game /><Equipment /><Teacher /><Faq />
      </main>
      <footer className="foot">
        <div className="wrap">
          <p>활주로 피해복구(RADR) 교육용 시뮬레이션 · 수치와 소요 시간은 교육용 예시값이며 실제 작업은 부대 교범과 기술지시서를 따릅니다.</p>
          <p><a href={simLink()}>시뮬레이터 열기</a> · <a href="#top">맨 위로</a></p>
        </div>
      </footer>
    </>
  );
}
