export const PricingCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

  .wp-root {
    --g: #f5a623;
    --g2: #e8950f;
    --gdim: rgba(245,166,35,0.10);
    --gborder: rgba(245,166,35,0.18);
    --ghover: rgba(245,166,35,0.22);
    --cream: #fff5de;
    --cm: #bfa873;
    --cf: #8d7850;
    --bg: #0d0b08;
    --s1: #131009;
    --s2: #1a1610;
    --s3: #211d14;
    --br: rgba(245,166,35,0.10);
    --br2: rgba(245,166,35,0.22);
    font-family: 'Instrument Sans', system-ui, sans-serif;
    background: var(--bg);
    color: var(--cream);
    min-height: 100vh;
  }

  @media (prefers-color-scheme: light) {
    .wp-root {
      --g: #c8820a; --g2: #a86a05;
      --gdim: rgba(180,110,10,0.07); --gborder: rgba(180,110,10,0.18); --ghover: rgba(180,110,10,0.13);
      --cream: #1c1100; --cm: #5a3c10; --cf: #8a6030;
      --bg: #fdf8ee; --s1: #faf3e0; --s2: #f5ead0; --s3: #ede0c0;
      --br: rgba(150,100,10,0.12); --br2: rgba(150,100,10,0.25);
    }
  }

  .wp-wrap { max-width: 1020px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }

  .wp-hero { text-align: center; margin-bottom: 2.8rem; animation: wp-rise .5s cubic-bezier(.22,1,.36,1) both; }

  @keyframes wp-rise {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: none; }
  }

  .wp-eyebrow {
    font-size: 9px; font-weight: 700; letter-spacing: .32em; text-transform: uppercase;
    color: var(--g); display: flex; align-items: center; justify-content: center;
    gap: 6px; margin-bottom: .8rem;
  }

  .wp-dot {
    width: 8px; height: 8px; border-radius: 50%; background: var(--g);
    animation: wp-pulse 2s ease-in-out infinite;
  }

  @keyframes wp-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: .4; transform: scale(.7); }
  }

  .wp-h1 {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: clamp(2.2rem, 5vw, 3.4rem);
    font-weight: 400; line-height: 1.1; color: var(--cream); margin-bottom: .5rem;
  }

  .wp-h1 span { color: var(--g); }

  .wp-sub { font-size: .95rem; color: var(--cm); max-width: 420px; margin: 0 auto; }

  .wp-toggle-row {
    display: flex; align-items: center; justify-content: center;
    gap: .9rem; margin: 2rem 0 2.8rem;
    animation: wp-rise .5s cubic-bezier(.22,1,.36,1) .1s both;
  }

  .wp-tog-label { font-size: .82rem; font-weight: 600; color: var(--cm); transition: color .2s; }
  .wp-tog-label.active { color: var(--cream); }

  .wp-toggle-wrap { position: relative; width: 44px; height: 24px; cursor: pointer; }

  .wp-toggle-track {
    position: absolute; inset: 0; border-radius: 999px;
    background: var(--s3); border: 1px solid var(--br2); transition: background .25s, border-color .25s;
  }

  .wp-toggle-track.on { background: var(--gdim); border-color: var(--g); }

  .wp-toggle-thumb {
    position: absolute; top: 3px; left: 3px; width: 16px; height: 16px;
    border-radius: 50%; background: var(--cm); transition: transform .25s, background .25s;
  }

  .wp-toggle-thumb.on { transform: translateX(20px); background: var(--g); }

  .wp-save-badge {
    font-size: .7rem; font-weight: 700; letter-spacing: .04em;
    padding: .22rem .6rem; border-radius: 999px;
    background: var(--gdim); border: 1px solid var(--gborder); color: var(--g);
    opacity: 0; transform: scale(.85); transition: opacity .25s, transform .25s;
  }

  .wp-save-badge.show { opacity: 1; transform: scale(1); }

  .wp-grid {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.1rem;
    animation: wp-rise .55s cubic-bezier(.22,1,.36,1) .15s both;
  }

  @media (max-width: 720px) { .wp-grid { grid-template-columns: 1fr; } }

  .wp-card {
    background: var(--s1); border: 1px solid var(--br); border-radius: 20px;
    padding: 1.8rem 1.6rem 1.6rem; display: flex; flex-direction: column;
    transition: border-color .2s, transform .2s;
  }

  .wp-card:hover { border-color: var(--br2); transform: translateY(-3px); }

  .wp-card.featured { background: var(--s2); border: 1.5px solid var(--gborder); }
  .wp-card.featured:hover { border-color: rgba(245,166,35,.40); }

  .wp-card-tag {
    font-size: 8.5px; font-weight: 700; letter-spacing: .28em; text-transform: uppercase;
    color: var(--cf); margin-bottom: 1.1rem;
    display: flex; align-items: center; justify-content: space-between;
  }

  .wp-card-tag.featured { color: var(--g); }

  .wp-live-dot {
    width: 7px; height: 7px; border-radius: 50%; background: var(--g);
    animation: wp-pulse 2s ease-in-out infinite;
  }

  .wp-plan-name {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 1.9rem; font-weight: 400; color: var(--cream); margin-bottom: .85rem;
  }

  .wp-price-row { display: flex; align-items: baseline; gap: .25rem; margin-bottom: .3rem; }

  .wp-price-dollar { font-size: .9rem; color: var(--cm); font-weight: 600; align-self: flex-start; margin-top: .35rem; }

  .wp-price-num { font-size: 3rem; font-weight: 700; color: var(--cream); line-height: 1; transition: all .25s; }
  .wp-price-num.gold { color: var(--g); }

  .wp-price-period { font-size: .8rem; color: var(--cf); font-weight: 500; }

  .wp-price-sub { font-size: .75rem; color: var(--cf); margin-bottom: .1rem; min-height: 1.1rem; transition: opacity .2s; }

  .wp-plan-desc {
    font-size: .8rem; color: var(--cm); line-height: 1.5; margin-bottom: 1.4rem;
    padding-bottom: 1.2rem; border-bottom: 1px solid var(--br);
  }

  .wp-features { display: flex; flex-direction: column; gap: .55rem; flex: 1; margin-bottom: 1.6rem; }

  .wp-feat { display: flex; align-items: center; gap: .55rem; font-size: .8rem; color: var(--cm); }

  .wp-feat-icon { width: 14px; height: 14px; flex-shrink: 0; color: var(--g); }

  .wp-btn {
    width: 100%; padding: .8rem 1rem; border-radius: 12px;
    font-size: .85rem; font-weight: 700; font-family: inherit;
    cursor: pointer; transition: all .2s; text-align: center;
    border: 1px solid var(--br2); background: transparent; color: var(--cream);
  }

  .wp-btn:hover { background: var(--gdim); border-color: rgba(245,166,35,.35); }

  .wp-btn.gold {
    background: var(--g); color: #1a0d00; border-color: var(--g);
    box-shadow: 0 4px 20px rgba(245,166,35,.2);
  }

  .wp-btn.gold:hover {
    background: var(--g2); border-color: var(--g2);
    box-shadow: 0 6px 28px rgba(245,166,35,.28); transform: translateY(-1px);
  }

  .wp-btn:active { transform: scale(.98); }
`;