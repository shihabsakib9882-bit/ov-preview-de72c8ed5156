/* Section motion: Lusion-style chapter flip + scroll-driven scenes, GSAP ScrollTrigger.
   Everything here only runs when motion is allowed. Without it the page is the plain 2D design. */
function initSections(){
  var gsap=window.gsap,ST=window.ScrollTrigger;
  if(!gsap||!ST||document.body.classList.contains('static'))return;
  gsap.registerPlugin(ST);
  var body=document.body;
  var anchorY=window.__anchorY=window.__anchorY||{};   /* where a menu click should land for pinned scenes (used by main.js) */

  /* split headline words into masked words */
  document.querySelectorAll('h2.split').forEach(function(h){
    var words=h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label',h.textContent.trim());   /* screen readers get the sentence, not the pieces */
    h.innerHTML=words.map(function(w){return '<span class="w" aria-hidden="true"><span class="i">'+w+'</span></span>'}).join(' ');
  });
  function wordsIn(el){return el.querySelectorAll('.w .i')}

  /* headline reveals */
  gsap.utils.toArray('.sec-head, .contact .wrap, .who .whotext').forEach(function(box){
    var eb=box.querySelector('.eyebrow'),ws=wordsIn(box),lead=box.querySelector('.lead');
    var tl=gsap.timeline({scrollTrigger:{trigger:box,start:'top 78%',toggleActions:'play none none reverse'}});
    if(eb)tl.from(eb,{y:18,opacity:0,duration:.6,ease:'power2.out'},0);
    if(ws.length)tl.from(ws,{yPercent:115,duration:1.1,ease:'power4.out',stagger:.07},.05);
    if(lead)tl.from(lead,{y:28,opacity:0,duration:.9,ease:'power3.out'},.4);
  });

  /* chapter flip: paper while Process is on screen */
  ST.create({trigger:'#how',start:'top 55%',end:'bottom 45%',onToggle:function(s){body.classList.toggle('paper',s.isActive)}});

  /* glows drift */
  gsap.utils.toArray('.glow').forEach(function(g){
    gsap.fromTo(g,{yPercent:-12},{yPercent:12,ease:'none',scrollTrigger:{trigger:g.parentNode,start:'top bottom',end:'bottom top',scrub:true}});
  });

  var mm=gsap.matchMedia();

  /* ---- Services: frames fly in from depth and slam into one row ---- */
  function servicesFly(pin){
    var cards=gsap.utils.toArray('#make .card');
    var off=[[-760,-300,-26,-34],[560,-380,20,30],[-520,320,16,-26],[820,280,-22,34]];
    cards.forEach(function(c,i){gsap.set(c,{x:off[i][0],y:off[i][1],rotation:off[i][2],rotationY:off[i][3],scale:.5,opacity:0,transformPerspective:1200})});
    var st={trigger:pin?'#make .pin':'#make .cards',start:pin?'top 90px':'top 90%',end:pin?'+=130%':'top 35%',scrub:.8};
    if(pin){st.pin=true;st.anticipatePin=1;st.refreshPriority=2}
    var tl=gsap.timeline({scrollTrigger:st});
    tl.to(cards,{x:0,y:0,rotation:0,rotationY:0,scale:1.04,opacity:1,duration:1,ease:'expo.out',stagger:.09});
    tl.to(cards,{scale:1,duration:.18,ease:'power2.inOut'});
    /* menu click on Services lands where the cards have settled, not on the empty start of the pin */
    if(pin)anchorY.make=function(){return tl.scrollTrigger?tl.scrollTrigger.end:null};
    return function(){delete anchorY.make};
  }
  mm.add('(min-width:901px) and (min-height:980px)',function(){return servicesFly(true)});
  mm.add('(max-width:900px), (max-height:979px)',function(){return servicesFly(false)});

  /* ---- Process: numerals fill with scroll ---- */
  gsap.utils.toArray('.step').forEach(function(s,i){
    var num=s.querySelector('.num');
    gsap.from(s,{y:90,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:s,start:'top 88%',toggleActions:'play none none reverse'}});
    gsap.fromTo(num,{'--fill':0},{'--fill':100,ease:'none',scrollTrigger:{trigger:s,start:'top 75%',end:'top 25%',scrub:.6}});
  });

  /* ---- Proof: one project per scene, screens tilt in from depth ---- */
  mm.add('(min-width:901px)',function(){
    var stage=document.getElementById('pstage'),scenes=gsap.utils.toArray('#pstage .pscene');
    stage.classList.add('js-pin');document.body.classList.add('js-pin');
    scenes.forEach(function(sc){gsap.set(sc.querySelectorAll('.pimg'),{opacity:0,transformPerspective:1600});gsap.set(sc.querySelector('.ptext'),{opacity:0})});
    /* the scenes are stacked on top of each other: only the scene whose text is visible may take clicks */
    function updatePE(){scenes.forEach(function(sc){var t=sc.querySelector('.ptext');t.style.pointerEvents=(parseFloat(gsap.getProperty(t,'opacity'))>.5)?'auto':'none'})}
    var tl=gsap.timeline({onUpdate:updatePE,scrollTrigger:{trigger:stage,start:'top top',end:'+='+(scenes.length*100+40)+'%',scrub:.9,pin:true,anticipatePin:1,refreshPriority:1}});
    scenes.forEach(function(sc,i){
      var t=i*2,imgs=sc.querySelectorAll('.pimg'),txt=sc.querySelector('.ptext');
      tl.fromTo(txt,{opacity:0,y:70},{opacity:1,y:0,duration:.7,ease:'power3.out'},t)
        .fromTo(imgs,{opacity:0,z:-600,y:180,rotationY:-38,rotationX:14},{opacity:1,z:0,y:0,rotationY:-14,rotationX:5,duration:1.1,ease:'power3.out',stagger:.14},t);
      if(i<scenes.length-1){
        tl.to(txt,{opacity:0,y:-70,duration:.5,ease:'power2.in'},t+1.5)
          .to(imgs,{opacity:0,z:360,x:-300,rotationY:-32,duration:.6,ease:'power2.in',stagger:.07},t+1.45);
      }
    });
    updatePE();
    /* scene i is fully on screen at timeline time i*2+1.1 */
    function sceneY(i){var st=tl.scrollTrigger;return st.start+(st.end-st.start)*((i*2+1.1)/tl.duration())}
    anchorY.proof=function(){return tl.scrollTrigger?sceneY(0):null};
    /* keyboard: when focus lands inside a scene that is not on screen, scroll to that scene */
    function onFocus(e){var sc=e.target.closest&&e.target.closest('.pscene'),i=scenes.indexOf(sc);if(i<0||!tl.scrollTrigger)return;var y=sceneY(i);if(Math.abs(window.pageYOffset-y)>window.innerHeight*.45){if(window.__lenis)window.__lenis.scrollTo(y,{immediate:true,force:true});else window.scrollTo(0,y)}}
    stage.addEventListener('focusin',onFocus);
    return function(){stage.removeEventListener('focusin',onFocus);delete anchorY.proof;stage.classList.remove('js-pin');document.body.classList.remove('js-pin');scenes.forEach(function(sc){gsap.set(sc.querySelectorAll('.pimg,.ptext'),{clearProps:'all'})})};
  });
  mm.add('(max-width:900px)',function(){
    gsap.utils.toArray('#pstage .pscene').forEach(function(sc){
      gsap.from(sc.querySelectorAll('.ptext, .pimg'),{y:60,opacity:0,duration:.9,ease:'power3.out',stagger:.12,scrollTrigger:{trigger:sc,start:'top 85%',toggleActions:'play none none reverse'}});
    });
  });

  /* ---- Who ---- */
  gsap.fromTo('.who .photo img',{clipPath:'inset(0 0 100% 0)',scale:1.12},{clipPath:'inset(0 0 0% 0)',scale:1,duration:1.5,ease:'power4.out',scrollTrigger:{trigger:'.who',start:'top 72%',toggleActions:'play none none reverse'}});
  gsap.from('.who .sum, .who .chip, .who-cta, .who-links, .who-mail',{y:40,opacity:0,duration:.9,ease:'power3.out',stagger:.1,scrollTrigger:{trigger:'.who .sum',start:'top 88%',toggleActions:'play none none reverse'}});

  /* ---- Contact ---- */
  gsap.from('.ccard',{y:90,rotationX:-22,opacity:0,transformPerspective:1000,duration:1.1,ease:'power4.out',stagger:.12,scrollTrigger:{trigger:'.cgrid',start:'top 85%',toggleActions:'play none none reverse'}});

  /* ---- Footer wordmark rises letter by letter ---- */
  gsap.from('#wm span',{yPercent:105,duration:1.2,ease:'power4.out',stagger:.07,scrollTrigger:{trigger:'#wm',start:'top 95%',toggleActions:'play none none reverse'}});

  ST.sort();ST.refresh();
  window.addEventListener('load',function(){ST.refresh()});
  setTimeout(function(){ST.refresh()},600);
  setTimeout(function(){ST.refresh()},2500);
}
