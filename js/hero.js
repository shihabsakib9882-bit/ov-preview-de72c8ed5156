/* Orivane hero: WebGL scene (Three.js r128). Frozen from the approved sample on 2026-11-12.
   Edit this file directly. window.seek(t, s) and window.release() are test helpers. */
function boot(){
const $=s=>document.querySelector(s);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const e3=t=>1-Math.pow(1-t,3);
const eio=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const SPEED=1.9;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();

let renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas:$('#c'),antialias:true,alpha:true});renderer.setClearColor(0x000000,0);
}catch(e){window.__loader.fail();return;}

const C={bg:css('--color-bg'),surface:css('--color-surface'),raised:css('--color-surface-raised'),line:css('--color-line'),text:css('--color-text'),muted:css('--color-text-muted'),brand:css('--color-brand'),
  display:css('--font-display'),body:css('--font-body'),mono:css('--font-mono')};

renderer.outputEncoding=THREE.sRGBEncoding;
const scene=new THREE.Scene();
scene.background=null;
scene.fog=new THREE.Fog(0x0A0B0D,26,80);
const camera=new THREE.PerspectiveCamera(40,1,.1,200);
const board=new THREE.Group(); scene.add(board);

/* ---------- canvas textures ---------- */
const UNIT=110;
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function tex(wu,hu,draw){
  const cv=document.createElement('canvas'); cv.width=Math.round(wu*UNIT); cv.height=Math.round(hu*UNIT);
  const c=cv.getContext('2d'); draw(c,cv.width,cv.height);
  const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; t.anisotropy=4; return t;
}
function plane(wu,hu,map,add,order){
  /* depthTest off: stacking is decided by renderOrder only, so the big shell can never cover the cards */
  const m=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,depthTest:false,opacity:0,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(wu,hu),m);
  mesh.renderOrder=order||0;
  return mesh;
}
function card(c,w,h,fill){rr(c,1.5,1.5,w-3,h-3,16);c.fillStyle=fill||C.surface;c.fill();c.strokeStyle=C.line;c.lineWidth=2;c.stroke();}
const T_=(c,s,x,y,font,col,al)=>{c.font=font;c.fillStyle=col;c.textAlign=al||'left';c.textBaseline='alphabetic';c.fillText(s,x,y)};

function dSidebar(c,w,h){
  card(c,w,h);
  c.beginPath();c.arc(36,44,13,0,7);c.strokeStyle=C.brand;c.lineWidth=3;c.stroke();
  c.beginPath();c.arc(36,44,4,0,7);c.fillStyle=C.brand;c.fill();
  T_(c,'orivane',60,51,'600 22px '+C.display,C.text);
  const items=['Overview','Projects','Clients','Invoices','Reports','Settings'];
  items.forEach((s,i)=>{const y=110+i*50;
    if(i===0){rr(c,14,y-26,w-28,42,10);c.fillStyle=C.raised;c.fill();c.beginPath();c.arc(34,y-5,5,0,7);c.fillStyle=C.brand;c.fill();}
    else{rr(c,28,y-11,12,12,3);c.strokeStyle=C.line;c.lineWidth=2;c.stroke();}
    T_(c,s,56,y,'500 16px '+C.body,i===0?C.text:C.muted);});
  T_(c,'v2.4 build 118',24,h-26,'400 12px '+C.mono,C.muted);
}
function dTop(c,w,h){
  card(c,w,h);
  T_(c,'Overview',26,h/2+8,'600 24px '+C.display,C.text);
  rr(c,w-470,h/2-22,230,44,22);c.strokeStyle=C.line;c.lineWidth=2;c.stroke();
  T_(c,'Search clients, tasks',w-450,h/2+6,'400 14px '+C.body,C.muted);
  rr(c,w-218,h/2-22,194,44,22);c.fillStyle=C.brand;c.fill();
  T_(c,'New project',w-121,h/2+6,'500 15px '+C.display,'#06222d','center');
}
function dKpi(label,val,delta){return (c,w,h)=>{
  card(c,w,h);
  T_(c,label,22,38,'500 14px '+C.body,C.muted);
  T_(c,val,22,h-62,'600 46px '+C.display,C.text);
  T_(c,delta,22,h-24,'400 13px '+C.mono,C.brand);
};}
function dChart(c,w,h){
  card(c,w,h);
  T_(c,'Delivery by week',26,44,'600 20px '+C.display,C.text);
  T_(c,'tasks closed',w-26,44,'400 13px '+C.mono,C.muted,'right');
  const hs=[.38,.52,.44,.61,.35,.7,.58,.66,.49,.77,.62,.84,.71,.93];
  const bx=30,by=h-42,bw=(w-60)/hs.length;
  c.strokeStyle=C.line;c.lineWidth=2;c.beginPath();c.moveTo(bx,by);c.lineTo(w-30,by);c.stroke();
  hs.forEach((v,i)=>{const bh=v*(h-140);rr(c,bx+i*bw+6,by-bh,bw-12,bh,6);c.fillStyle=i>=hs.length-3?C.brand:'#2A2E36';c.fill();});
  T_(c,'W1',bx+6,h-16,'400 12px '+C.mono,C.muted);T_(c,'W14',w-60,h-16,'400 12px '+C.mono,C.muted);
}
function dList(c,w,h){
  card(c,w,h);
  T_(c,'Recent activity',24,44,'600 20px '+C.display,C.text);
  const rows=[['Invoice #1048 sent','2h'],['Design review done','5h'],['Client asked for export','1d'],['Build 118 shipped','1d'],['Onboarding call moved','2d']];
  rows.forEach((r,i)=>{const y=96+i*60;
    c.beginPath();c.arc(34,y,6,0,7);c.fillStyle=i<2?C.brand:'#2A2E36';c.fill();
    T_(c,r[0],54,y+5,'500 15px '+C.body,C.text);
    T_(c,r[1],w-24,y+5,'400 13px '+C.mono,C.muted,'right');
    c.strokeStyle=C.line;c.lineWidth=1.5;c.beginPath();c.moveTo(24,y+28);c.lineTo(w-24,y+28);c.stroke();});
}
function dStrip(c,w,h){
  card(c,w,h);
  [['Design','done'],['Build','done'],['Review','now'],['Live','next']].forEach((s,i)=>{
    const x=24+i*150;rr(c,x,h/2-18,134,36,18);
    if(s[1]==='now'){c.fillStyle=C.brand;c.fill();}else{c.strokeStyle=C.line;c.lineWidth=2;c.stroke();}
    T_(c,s[0],x+67,h/2+5,'500 14px '+C.display,s[1]==='now'?'#06222d':(s[1]==='done'?C.text:C.muted),'center');});
  T_(c,'Brief to live in 6 weeks',w-24,h/2+5,'400 13px '+C.mono,C.muted,'right');
}

const blocksOld=[
  {x:-6.6,y:0,w:2.6,h:8.6,d:dSidebar,n:'<Sidebar />'},
  {x:1.4,y:3.75,w:13,h:.9,d:dTop,n:'<TopBar />'},
  {x:-3.55,y:2.25,w:3.1,h:1.7,d:dKpi('Active clients','14','+2 this month'),n:'<KpiCard />'},
  {x:-.25,y:2.25,w:3.1,h:1.7,d:dKpi('Open tasks','128','31 due this week'),n:'<KpiCard />'},
  {x:3.05,y:2.25,w:3.1,h:1.7,d:dKpi('Hours logged','412.5','of 480 planned'),n:'<KpiCard />'},
  {x:6.35,y:2.25,w:3.1,h:1.7,d:dKpi('Overdue','3','down from 11'),n:'<KpiCard />'},
  {x:-1.1,y:-.95,w:8,h:4.3,d:dChart,n:'<BarChart />'},
  {x:5.5,y:-.95,w:4.8,h:4.3,d:dList,n:'<ActivityList />'},
  {x:1.4,y:-3.7,w:13,h:1,d:dStrip,n:'<StatusBar />'}
];

const DI=window.__dash||null;
function crop(sx,sy,sw,sh,r){return (c,w,h)=>{c.save();rr(c,0,0,w,h,r);c.clip();c.drawImage(DI,sx,sy,sw,sh,0,0,w,h);c.restore();};}
function B(sx,sy,sw,sh,n,r){const U=120;return {x:(sx+sw/2)/U-8,y:4.5-(sy+sh/2)/U,w:sw/U,h:sh/U,d:crop(sx,sy,sw,sh,r===undefined?10:r),n};}
const blocksNew=DI?[
  B(0,0,240,1080,'<Sidebar />',0),
  B(250,6,1664,64,'<TopBar />',0),
  B(274,79,523,128,'<KpiCard />'),B(818,79,523,128,'<KpiCard />'),B(1362,79,523,128,'<KpiCard />'),
  B(274,261,523,128,'<KpiCard />'),B(818,261,523,128,'<KpiCard />'),B(1362,261,523,128,'<KpiCard />'),
  B(274,418,924,616,'<DataTable />'),B(1227,418,658,593,'<OrdersPanel />')
]:null;
const blocks=blocksNew||blocksOld;

const codeLines=['const product = build(problem);','<Card title="Revenue" />','grid-template-columns: 240px 1fr;','await deploy({ env: "live" });','export default function Dashboard()','color: var(--brand);','SELECT * FROM clients WHERE open;','git commit -m "ship it"','npm run build   ok','fetch("/api/orders")','.btn:hover { transform: translateY(-1px) }','<Table rows={tasks} />','useEffect(() => load(), [id]);','if (overdue > 0) notify(owner);'];
const codeTex=codeLines.map(s=>tex(5.4,.5,(c,w,h)=>{
  T_(c,s,6,h/2+8,'400 26px '+C.mono,C.brand);
}));
const labelTex=blocks.map(b=>tex(3.2,.45,(c,w,h)=>{T_(c,b.n,w/2,h/2+7,'400 24px '+C.mono,C.text,'center');}));

/* shell, outline, glow, grid */
const shell=plane(16,9,tex(16,9,(c,w,h)=>{rr(c,2,2,w-4,h-4,26);c.fillStyle=C.bg;c.fill();c.strokeStyle=C.line;c.lineWidth=3;c.stroke();}),false,0);
shell.position.z=-.02; board.add(shell);
const outline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(16,9)),new THREE.LineBasicMaterial({color:0x6FD6FF,transparent:true,opacity:0,depthTest:false}));
outline.renderOrder=3;
board.add(outline);


/* ---------- sequence ----------
   0.0-1.6  code rain fills the screen (world space)
   1.3-2.4  14 of the lines fly into the component positions and fade as the components fade in
   2.5-3.7  components hold, exploded, each with its name
   3.7-5.3  components fly together into the dashboard
   5.6-7.2  board shrinks down, headline rises (unchanged from before) */
const R=rng(7), frags=[];
const EXP=1.4;            // explode factor (set on resize; 1 on narrow screens)
let expl=EXP;
blocks.forEach((b,i)=>{
  const m=plane(b.w,b.h,tex(b.w,b.h,b.d),false,2); board.add(m);
  frags.push({kind:'ui',m,b,i,tx:b.x,ty:b.y,tz:.02+i*.01,ez:(i%3-1)*.5,ta:1.5+i*.08,tm:3.7+i*.08});
  const lab=plane(3.2,.45,labelTex[i],false,6); board.add(lab);
  frags.push({kind:'label',m:lab,b,i,ez:(i%3-1)*.5});
  for(let k=0;k<2;k++){
    const cm=plane(5.4,.5,codeTex[(i*2+k)%codeTex.length],false,5); scene.add(cm);
    frags.push({kind:'code',m:cm,b,i,u:R(),d:R()*.4,v:3.5+R()*1.5,y0:8.5,z0:-1+R()*2,tc:1.3+i*.08,jx:(R()-.5)*b.w*.5,jy:(R()-.5)*b.h*.5});
  }
});
for(let k=0;k<64;k++){
  const cm=plane(5.4,.5,codeTex[k%codeTex.length],false,5); scene.add(cm);
  frags.push({kind:'rain',m:cm,u:R(),d:R()*1.2,v:6+R()*6,y0:8.5+R()*3,z0:-3+R()*4,a:.35+R()*.55,k:.8+R()*.5});
}
for(let k=0;k<12;k++){
  const cm=plane(5.4,.5,codeTex[k%codeTex.length],false,1); board.add(cm);
  frags.push({kind:'loose',m:cm,tx:(R()*2-1)*9,ty:(R()*2-1)*5,tz:-.6-R()*2.5});
}

/* layout */
let W=1,H=1,fs=.5,fy=-3,aspect=1.7,introScale=1,rainHalfW=14,lk=1;
const D=15;
const TAN=Math.tan(THREE.MathUtils.degToRad(20));
function resize(){
  W=innerWidth;H=innerHeight;aspect=W/H;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,W<700?1.5:1.75));
  renderer.setSize(W,H,false);
  camera.aspect=aspect;camera.updateProjectionMatrix();
  const visW=2*D*TAN*aspect, visH=2*D*TAN;
  fs=Math.min(.82,.9*visW/16);
  {const hb=$('.hero-btns').getBoundingClientRect().bottom,gapPx=clamp(H*.045,30,60),pxu=H/visH;fy=((H/2-(hb+gapPx))/pxu)-4.5*fs;}
  expl=aspect<1?1.0:EXP;
  const visWi=2*(D+2)*TAN*aspect;
  introScale=Math.min(1,.95*visWi/(16*expl+1),.84*2*(D+2)*TAN/(9*(expl>1?1.12:1)+1.8));
  rainHalfW=.5*2*21*TAN*aspect*1.05;
  lk=clamp(aspect/1.3,.45,1);
  draw();
}

/* text reveals */
const rev=[['.label',6.3],['h1 span:nth-child(1)',6.5],['h1 span:nth-child(2)',6.7],['.sub',7.0],['.hero-btns',7.25]].map(([s,t])=>({el:$('#hero '+s),t}));
const hud=[$('#h1'),$('#h2')];
const heroEl=$('#hero'),nextEl=$('#next'),skipEl=$('#h4'),quoteEl=$('#qh'),cEl=$('#c'),auraEl=$('#aura');

/* mouse */
let mx=0,my=0,smx=0,smy=0;
addEventListener('pointermove',e=>{mx=e.clientX/W*2-1;my=e.clientY/H*2-1;});

/* state */
let T=0,S=0,manual=false,t0=0,running=false;
const v3=new THREE.Vector3(), v4=new THREE.Vector3();
function rainPos(f,t,out){return out.set((f.u*2-1)*rainHalfW,f.y0-(t-f.d)*f.v,f.z0);}
function draw(){
  const pc=eio(clamp(T/6));
  camera.position.set(smx*.9,lerp(2.4,.4,pc)-smy*.3,lerp(D+4,D,pc)-S*3);
  camera.lookAt(0,0,0);
  board.rotation.set(-.1,smx*.05,0);
  const p2=eio(clamp((T-5.6)/1.6));
  board.scale.setScalar(lerp(introScale,fs,p2)*(1+.9*S));
  board.position.y=lerp(0,fy,p2)*(1-S)+S*.2;
  board.updateMatrixWorld(true);
  const dim=1-sm(.4,.95,S); /* board fades back as the next headline arrives */
  shell.material.opacity=sm(3.4,4.6,T)*dim;
  outline.material.opacity=sm(3.2,4.2,T)*.9*(1-sm(3.8,6.5,T)*.7);
  
  
  frags.forEach(f=>{
    const m=f.m;
    if(f.kind==='ui'){
      const ex=f.b.x*expl, ey=f.b.y*(expl>1?1.12:1);
      const up=e3(clamp((T-f.tm)/1.5));
      m.position.set(lerp(ex,f.tx,up),lerp(ey,f.ty,up),lerp(f.ez,f.tz,up));
      m.scale.setScalar(lerp(.85,1,e3(clamp((T-f.ta)/1))));
      m.material.opacity=sm(f.ta,f.ta+1,T)*dim;
    }else if(f.kind==='label'){
      const ex=f.b.x*expl, ey=f.b.y*(expl>1?1.12:1)-f.b.h/2-.32;
      m.position.set(ex,ey,f.ez);
      m.material.opacity=sm(2.1,2.9,T)*(1-sm(3.5,4.1,T))*.9;
    }else if(f.kind==='code'){
      rainPos(f,Math.min(T,f.tc),v3);
      if(T>f.tc){
        const uu=e3(clamp((T-f.tc)/1));
        board.localToWorld(v4.set(f.b.x*expl+f.jx,f.b.y*(expl>1?1.12:1)+f.jy,f.ez));
        v3.lerp(v4,uu);
        m.scale.setScalar(lerp(1,.8,uu)*lk);
      }else m.scale.setScalar(lk);
      m.position.copy(v3);
      m.material.opacity=sm(f.d,f.d+.25,T)*(1-sm(f.tc+.3,f.tc+1,T))*.9;
    }else if(f.kind==='rain'){
      rainPos(f,T,v3); m.position.copy(v3);
      m.scale.setScalar(f.k*lk);
      m.material.opacity=sm(f.d,f.d+.25,T)*(1-sm(1.5,2.8,T))*f.a;
    }else{ /* loose: faint code behind the finished dashboard */
      m.position.set(f.tx,f.ty,f.tz);
      m.material.opacity=sm(4.2,5.6,T)*.2*dim;
    }
  });
  rev.forEach(r=>{const k=e3(clamp((T-r.t)/.8));r.el.style.opacity=k;r.el.style.transform='translateY('+(1-k)*26+'px)';});
  hud.forEach(h=>h.style.opacity=sm(.8,1.6,T)*(1-sm(0,.3,S)));
  skipEl.style.opacity=sm(.6,1.2,T)*(1-sm(5.2,5.8,T));
  const hv=1-clamp(S*2.2);
  heroEl.style.opacity=hv;heroEl.style.transform='translateY('+(-S*90)+'px) scale('+(1-S*.22)+')';
  heroEl.style.visibility=hv<=0?'hidden':'visible';
  const qv=e3(clamp((T-7.8)/.8))*hv;quoteEl.style.opacity=qv;quoteEl.style.transform='translateX(-50%) translateY('+((1-e3(clamp((T-7.8)/.8)))*30-S*60)+'px)';quoteEl.style.visibility=qv<=0?'hidden':'visible';
  const Yh=scrollY/H,nr=sm(1.25,1.55,Yh),nv=nr*(1-sm(1.7,2.0,Yh));
  nextEl.style.opacity=nv;nextEl.style.transform='translateY('+((1-nr)*90)+'px)';
  renderer.render(scene,camera);
}
function frame(now){
  if(scrollY>H*1.9){cEl.style.visibility='hidden';nextEl.style.opacity=0;heroEl.style.visibility='hidden';quoteEl.style.visibility='hidden';hud.forEach(h=>h.style.opacity=0);skipEl.style.opacity=0;auraEl.style.visibility='hidden';requestAnimationFrame(frame);return;}
  cEl.style.visibility='visible';auraEl.style.visibility='visible';auraEl.style.opacity=1-sm(1.0,1.7,scrollY/H);
  if(!manual){T=(now-t0)/1000*SPEED;}
  if(!reduce&&!manual){S=T>6.3?clamp(scrollY/(innerHeight*1.4)):0;}
  smx+=(mx-smx)*.05;smy+=(my-smy)*.05;
  draw();
  requestAnimationFrame(frame);
}
function skip(){ if(manual||reduce||!running)return; if(T<6.3){t0=performance.now()-6.4*1000/SPEED;} }
addEventListener('pointerdown',skip);
addEventListener('wheel',skip,{passive:true});
addEventListener('keydown',skip);
addEventListener('resize',resize);
window.seek=(t,s=0)=>{manual=true;T=t;S=s;smx=0;smy=0;draw();};
window.release=()=>{manual=false;t0=performance.now()-T*1000/SPEED;};

resize();
if(reduce){T=9;S=0;draw();}
else{rev.forEach(r=>{r.el.style.opacity=0;});}
window.__loader.mark('build');
window.__loader.done.then(()=>{
  if(reduce)return;
  running=true;t0=performance.now();
  requestAnimationFrame(frame);
});
}
