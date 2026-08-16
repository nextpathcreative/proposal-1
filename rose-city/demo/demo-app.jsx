/* eslint-disable */
/* demo/demo-app.jsx — renders a live sample trades landing page from a brand config.
   Includes a working "book a visit" scheduler so the prospect can actually try it. */
const { useState, useMemo, useEffect } = React;

function pickBrand() {
  const p = new URLSearchParams(location.search).get("b") || "plumbing";
  return window.DEMO_BRANDS[p] || window.DEMO_BRANDS.plumbing;
}
const B = pickBrand();

/* apply brand color + type pairing */
document.documentElement.setAttribute("data-pairing", B.pairing || "a");
document.documentElement.style.setProperty("--accent", B.brand);
document.title = B.name + " — Portland " + (B.key === "hvac" ? "Heating & Air" : B.key === "electrical" ? "Electric" : "Plumbing");

function DIcon({ name, size }) { return <i data-lucide={name} style={{ width: size, height: size }} />; }
function Stars() { return <span className="d-stars">{[0,1,2,3,4].map(i => <i key={i} data-lucide="star" />)}</span>; }

/* ---- Visit scheduler (2-hour windows, name/phone/address/notes) ---- */
function buildDays() {
  const out = []; let c = new Date(); c = new Date(c.getFullYear(), c.getMonth(), c.getDate());
  while (out.length < 5) { if (c.getDay() !== 0) out.push(new Date(c)); c = new Date(c.getTime() + 86400000); }
  return out;
}
const VSLOTS = [{h:8,l:"8 AM"},{h:10,l:"10 AM"},{h:12,l:"12 PM"},{h:14,l:"2 PM"},{h:16,l:"4 PM"},{h:18,l:"6 PM"}];
function bookedSet(d){ const s=d.toDateString().split("").reduce((a,c)=>a+c.charCodeAt(0),0); const t=new Set(); VSLOTS.forEach((x,i)=>{ if((s*(i+7))%10<3)t.add(x.h);}); return t; }
function isPast(d,h){ const n=new Date(); if(d.toDateString()!==n.toDateString())return false; return h<=n.getHours()+1; }
function dn(d){ const t=new Date(),tm=new Date(t.getTime()+86400000); if(d.toDateString()===t.toDateString())return"Today"; if(d.toDateString()===tm.toDateString())return"Tmrw"; return d.toLocaleDateString("en-US",{weekday:"short"}); }
function fd(d){ const t=new Date(),tm=new Date(t.getTime()+86400000); if(d.toDateString()===t.toDateString())return"Today"; if(d.toDateString()===tm.toDateString())return"Tomorrow"; return d.toLocaleDateString("en-US",{weekday:"long"}); }
function dl(d){ return d.toLocaleDateString("en-US",{month:"short",day:"numeric"}); }

function VisitScheduler() {
  const days = useMemo(buildDays, []);
  const initial = useMemo(() => { for (let i=0;i<days.length;i++){ const t=bookedSet(days[i]); if(VSLOTS.some(s=>!t.has(s.h)&&!isPast(days[i],s.h)))return i; } return 0; }, [days]);
  const [dayIdx,setDayIdx]=useState(initial);
  const [slot,setSlot]=useState(null);
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({name:"",phone:"",address:"",notes:""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  useEffect(()=>{ window.lucide&&window.lucide.createIcons(); },[step,dayIdx,slot]);
  const day=days[dayIdx]; const taken=useMemo(()=>bookedSet(day),[day]); const sel=VSLOTS.find(s=>s.h===slot);

  if(step===3) return (
    <div className="dd">
      <div className="dd-done">
        <div className="dd-check"><DIcon name="check" /></div>
        <div className="dd-title" style={{fontSize:20}}>Got it — we'll text you shortly.</div>
        <div className="dd-receipt">
          <div className="r"><span>Time requested</span><b>{fd(day)} · {dl(day)} · {sel.l}</b></div>
          <div className="r"><span>Phone</span><b>{form.phone||"—"}</b></div>
          <div className="r"><span>Address</span><b>{form.address||"—"}</b></div>
        </div>
        <p style={{fontSize:12.5,color:"var(--muted)",maxWidth:"32ch",margin:0}}>A real person will text within 15 minutes during business hours. Or call <a href={B.phoneHref} style={{color:"var(--accent-deep)",fontWeight:700}}>{B.phone}</a>.</p>
        <button className="dd-back" onClick={()=>{setStep(1);setSlot(null);setForm({name:"",phone:"",address:"",notes:""});}}><DIcon name="rotate-ccw" /> Book another time</button>
      </div>
    </div>
  );

  return (
    <div className="dd">
      {step===1 ? (
        <React.Fragment>
          <div>
            <div className="dd-eyebrow"><DIcon name="calendar" /> Schedule a visit</div>
            <div className="dd-title">{B.schedTitle}</div>
          </div>
          <div className="dd-days">
            {days.map((d,i)=>(
              <button key={i} className={`dd-day ${i===dayIdx?"on":""}`} onClick={()=>{setDayIdx(i);setSlot(null);}}>
                <span className="n">{dn(d)}</span><span className="d">{d.getDate()}</span>
              </button>
            ))}
          </div>
          <div className="dd-slotlbl"><span>Open times · {fd(day)} {dl(day)}</span><span>2-hour windows</span></div>
          <div className="dd-slots">
            {VSLOTS.map(s=>{ const past=isPast(day,s.h); const tk=taken.has(s.h)||past; return (
              <button key={s.h} className={`dd-slot ${slot===s.h?"on":""}`} disabled={tk} onClick={()=>setSlot(s.h)}>
                <span className="t">{s.l}</span><span className="s">{past?"past":tk?"booked":slot===s.h?"picked":"open"}</span>
              </button>
            );})}
          </div>
          <button className="d-btn d-btn-primary d-btn-block" disabled={slot===null} onClick={()=>setStep(2)}>
            {slot===null?"Pick a time above":`Continue — ${fd(day)} at ${sel.l}`} <DIcon name="arrow-right" />
          </button>
          <div className="dd-fine"><DIcon name="shield-check" /><span>Times are tentative until a {B.name} tech confirms by text.</span></div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <button className="dd-back" onClick={()=>setStep(1)}><DIcon name="arrow-left" /> Change time</button>
            <span className="dd-when"><DIcon name="calendar" /> {fd(day)} · {sel.l}</span>
          </div>
          <div className="dd-field"><label>Your name</label><input className="dd-input" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Jamie Park" autoFocus /></div>
          <div className="dd-field"><label>Phone</label><input className="dd-input" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="(503) 555-1234" inputMode="tel" /></div>
          <div className="dd-field"><label>Address</label><input className="dd-input" value={form.address} onChange={e=>set("address",e.target.value)} placeholder={"4218 SE Belmont St, " + B.city} /></div>
          <div className="dd-field"><label>What's going on?</label><textarea className="dd-textarea" value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="A line or two helps us bring the right parts." /></div>
          <button className="d-btn d-btn-primary d-btn-block" disabled={!form.name||!form.phone} onClick={()=>setStep(3)}>Request this time <DIcon name="arrow-right" /></button>
          <div className="dd-fine"><DIcon name="info" /><span>A real person will text within 15 minutes during business hours.</span></div>
        </React.Fragment>
      )}
    </div>
  );
}

function DemoApp() {
  useEffect(()=>{ window.lucide&&window.lucide.createIcons(); });
  const t = B.trust;
  const embedded = window.self !== window.top; // hide the meta banner when shown inside the phone preview
  return (
    <React.Fragment>
      {!embedded && (
        <div className="d-banner">
          <DIcon name="flask-conical" />
          <span><b>Live sample</b> built by NextPath Creative — this is a demo, tap anything.</span>
          <a href="../index.html">← Back to proposal</a>
        </div>
      )}
      <header className="d-header">
        <div className="d-wrap in">
          <div className="d-logo"><span className="mk">{B.mark}</span><b>{B.name}</b></div>
          <div className="sp"></div>
          <a className="d-phone" href={B.phoneHref}><DIcon name="phone" /><span className="lbl">{B.phone}</span></a>
          <a className="d-btn d-btn-primary" href="#book">Book a visit</a>
        </div>
      </header>

      <section className="d-hero">
        <div className="d-wrap d-hero-grid">
          <div>
            <span className="d-eyebrow">{B.eyebrow}</span>
            <h1>{B.h1}</h1>
            <p className="lede">{B.lede}</p>
            <div className="d-trustrow">
              <span className="d-trust"><Stars /> {t.rating} ({t.reviews})</span>
              <span className="d-trust"><DIcon name="shield-check" /> Licensed ({t.license})</span>
              <span className="d-trust"><DIcon name="badge-check" /> {t.years} years in {B.city}</span>
            </div>
          </div>
          <div id="book"><VisitScheduler /></div>
        </div>
      </section>

      <div className="d-strip">
        <div className="d-wrap in">
          <div className="item"><DIcon name="star" /><div><div className="big">{t.rating}</div><div className="lbl">Google rating<br/>{t.reviews} reviews</div></div></div>
          <div className="item"><DIcon name="calendar-clock" /><div><div className="big">Same day</div><div className="lbl">slots most days,<br/>7 days a week</div></div></div>
          <div className="item"><DIcon name="receipt" /><div><div className="big">Flat rate</div><div className="lbl">price before<br/>we start the work</div></div></div>
          <div className="item"><DIcon name="shield-check" /><div><div className="big">2-year</div><div className="lbl">warranty on<br/>every install</div></div></div>
        </div>
      </div>

      <section className="d-sec">
        <div className="d-wrap">
          <span className="d-eyebrow">What we do</span>
          <h2 className="d-h2" style={{marginTop:10}}>Straightforward work, priced before we start.</h2>
          <div className="d-grid">
            {B.services.map((s,i)=>(
              <div className="d-svc" key={i}>
                <div className="ic"><DIcon name={s.icon} /></div>
                <b>{s.name}</b><p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="d-sec" style={{background:"var(--paper-2)",borderTop:"1px solid var(--line)",borderBottom:"1px solid var(--line)"}}>
        <div className="d-wrap">
          <span className="d-eyebrow">What neighbors say</span>
          <h2 className="d-h2" style={{marginTop:10}}>{t.rating} stars across {t.reviews} reviews.</h2>
          <div className="d-revs">
            {B.reviews.map((r,i)=>(
              <div className="d-rev" key={i}>
                <Stars />
                <p>"{r.quote}"</p>
                <div className="by"><span className="av">{r.name.split(" ").map(x=>x[0]).join("")}</span><div><b>{r.name}</b><span>{r.area}</span></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="d-sec">
        <div className="d-wrap">
          <div className="d-band">
            <h2>Got a {B.key === "hvac" ? "heating or cooling" : B.key === "electrical" ? "wiring" : "plumbing"} problem? Let's get it handled.</h2>
            <p>Pick a time and we'll text to confirm within 15 minutes. Or call and talk to a real person now.</p>
            <div className="acts">
              <a className="d-btn d-btn-primary" href="#book" style={{background:"#fff",color:"var(--ink)"}}>Book a visit</a>
              <a className="d-btn d-btn-ghost" href={B.phoneHref}><DIcon name="phone" /> {B.phone}</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="d-foot">
        <div className="d-wrap in">
          <div className="d-logo"><span className="mk">{B.mark}</span><b>{B.name}</b></div>
          <div style={{fontSize:14}}>Licensed {B.trust.license} · Bonded · Insured · {B.city}, OR</div>
          <a className="d-phone" href={B.phoneHref} style={{color:"#fff"}}><DIcon name="phone" /> {B.phone}</a>
          <div className="fine">This is a live sample landing page built by NextPath Creative to demonstrate the product. {B.name} and its details are illustrative.</div>
        </div>
      </footer>

      <div className="d-callbar">
        <div className="txt"><b>{B.name}</b><span>Licensed · {B.trust.rating}★ · {B.city}</span></div>
        <a className="cta" href={B.phoneHref}><DIcon name="phone" /> Call now</a>
      </div>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DemoApp />);
