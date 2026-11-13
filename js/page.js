/* Orivane inner pages (Work index, case studies): smooth scroll and simple reveals.
   Nothing here runs under reduced motion; without it the page is the plain static layout. */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  function load(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}

  /* Lenis: wheel and keyboard are smoothed; touch keeps the phone's own scroll */
  load('https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js').then(function(){
    var lenis=window.__lenis=new window.Lenis({lerp:.1,autoRaf:false});
    lenis.on('scroll',function(){if(window.ScrollTrigger)window.ScrollTrigger.update()});
    (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now());
  }).catch(function(){});

  /* reveals for pages that mark blocks with .case / .concept / .cta (the Work index).
     Case study pages carry their own motion script. */
  var items=document.querySelectorAll('.cases .case, .concept, .cta h2, .cta .row');
  if(!items.length)return;
  load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js').then(function(){
    return load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
  }).then(function(){
    var gsap=window.gsap,ST=window.ScrollTrigger;gsap.registerPlugin(ST);
    gsap.from('.hero h1',{yPercent:30,opacity:0,duration:1.1,ease:'power4.out',delay:.1});
    gsap.from('.hero .lead',{y:30,opacity:0,duration:.9,ease:'power3.out',delay:.35});
    [].forEach.call(items,function(el){
      var shot=el.querySelector('.frame, .phone');
      gsap.from(el,{y:60,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none reverse'}});
      if(shot)gsap.from(shot,{y:70,rotationX:10,transformPerspective:1600,duration:1.2,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none reverse'}});
    });
    setTimeout(function(){ST.refresh()},800);
  }).catch(function(){});
})();
