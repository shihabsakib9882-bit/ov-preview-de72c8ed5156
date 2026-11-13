/* Orivane landing: load order, smooth scroll (Lenis), menu, anchors.
   Three.js and GSAP come from cdnjs, Lenis from jsDelivr (all pinned versions).
   GSAP and Lenis are optional: if either fails, the page stays plain and readable. */
(function(){
  var L=window.__loader;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HEADER=90;
  function load(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}

  /* ---- menu + current-section underline (runs in every mode, reduced motion included) ---- */
  var btn=document.getElementById('menuBtn'),nav=document.getElementById('nav');
  function setMenu(open){nav.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open));btn.textContent=open?'Close':'Menu'}
  btn.addEventListener('click',function(){setMenu(!nav.classList.contains('open'))});
  nav.addEventListener('click',function(e){if(e.target.tagName==='A')setMenu(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){setMenu(false);btn.focus()}});
  var links=[].slice.call(nav.querySelectorAll('a')),map={};
  links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.removeAttribute('aria-current')});var a=map[e.target.id];if(a)a.setAttribute('aria-current','true')}})},{rootMargin:'-40% 0px -55% 0px'});
    Object.keys(map).forEach(function(id){var s=document.getElementById(id);if(s)io.observe(s)});
  }

  /* ---- in-page links: one place decides where a section "starts".
     Pinned scenes register their own position in window.__anchorY (see sections.js),
     so a menu click lands on a scene that is already visible, not on an empty stage. ---- */
  function targetY(id){
    if(id==='top')return 0;
    var f=window.__anchorY&&window.__anchorY[id];
    if(f){var y=f();if(typeof y==='number')return y}
    var el=document.getElementById(id);
    return el?Math.max(0,el.getBoundingClientRect().top+window.pageYOffset-HEADER):null;
  }
  function goTo(id,instant){
    var y=targetY(id);if(y===null)return false;
    var lenis=window.__lenis;
    if(lenis)lenis.scrollTo(y,{immediate:!!instant||reduce,force:true});
    else window.scrollTo({top:y,behavior:(instant||reduce)?'auto':'smooth'});
    return true;
  }
  window.__goTo=goTo;
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]');
    if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey)return;
    var id=a.getAttribute('href').slice(1);if(!id)return;
    if(!goTo(id))return;
    e.preventDefault();
    try{history.replaceState(null,'',id==='top'?location.pathname+location.search:'#'+id)}catch(_){}
    /* keyboard and screen-reader users: move focus with the scroll */
    var el=document.getElementById(id);
    if(el&&a.classList.contains('skip')){el.setAttribute('tabindex','-1');el.focus({preventScroll:true})}
    else if(el&&id!=='top'){var h=el.querySelector('h2,h1');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}}
  });
  /* arriving with a hash (for example from a case study page, /#contact): the pinned scenes add
     height after the first paint, so jump again once the sections are built */
  function rehash(){var id=location.hash.slice(1);if(id&&document.getElementById(id))goTo(id,true)}

  if(reduce){
    document.body.classList.add('static');L.mark('fonts');L.mark('three');L.mark('build');
    return;
  }

  var fonts=Promise.race([
    Promise.all([document.fonts.load('800 20px "Plus Jakarta Sans"'),document.fonts.load('400 20px "JetBrains Mono"'),document.fonts.load('500 16px Inter')]),
    new Promise(function(r){setTimeout(r,2500)})
  ]).then(function(){L.mark('fonts')},function(){L.mark('fonts')});
  var three=load('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js').then(function(){L.mark('three')});
  /* Printiq's real dashboard, cut into pieces for the build animation. If the browser will not let us read
     its pixels (for example opened as a file), skip it and the animation uses the drawn placeholder dashboard. */
  var dash=new Promise(function(res){var im=new Image();im.onload=function(){try{var t=document.createElement('canvas');t.width=t.height=2;var x=t.getContext('2d');x.drawImage(im,0,0,2,2);x.getImageData(0,0,1,1);window.__dash=im}catch(e){}res()};im.onerror=function(){res()};im.src='assets/s-dashboard.webp?v=20261114'});
  var gs=load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js').then(function(){return load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js')}).catch(function(){return null});
  var ln=load('https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js').catch(function(){return null});

  /* smooth scroll: wheel and keyboard are smoothed; touch keeps the phone's own scroll */
  Promise.all([gs,ln]).then(function(){
    if(!window.Lenis)return;
    var lenis;
    try{lenis=new window.Lenis({lerp:.1,wheelMultiplier:1,autoRaf:false})}catch(e){return}
    window.__lenis=lenis;
    if(window.gsap&&window.ScrollTrigger){
      lenis.on('scroll',window.ScrollTrigger.update);
      window.gsap.ticker.add(function(t){lenis.raf(t*1000)});
      window.gsap.ticker.lagSmoothing(0);
    }else{
      (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now());
    }
  });

  Promise.all([fonts,three,dash]).then(boot).catch(function(){L.fail()});
  Promise.all([fonts,gs]).then(function(){
    var wait=Promise.race([L.done,new Promise(function(r){setTimeout(r,14000)})]);
    wait.then(function(){setTimeout(function(){initSections();rehash();setTimeout(rehash,700)},document.body.classList.contains('nogl')?0:200)});
  });
})();
