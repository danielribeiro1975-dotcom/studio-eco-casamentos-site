(function(){
  // Ano no rodapé
  var y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();

  // Header on scroll
  var header = document.getElementById('siteHeader');
  function onScroll(){
    if(!header) return;
    if(window.scrollY > 60){ header.classList.add('scrolled'); }
    else{ header.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Mobile nav toggle
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  var scrim = document.getElementById('navScrim');
  function closeNav(){
    if(!nav) return;
    nav.classList.remove('open');
    toggle.classList.remove('open');
    scrim.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openNav(){
    nav.classList.add('open');
    toggle.classList.add('open');
    scrim.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  if(toggle && nav && scrim){
    toggle.addEventListener('click', function(){
      if(nav.classList.contains('open')){ closeNav(); } else { openNav(); }
    });
    scrim.addEventListener('click', closeNav);
    nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });
  }

  // Reveal on scroll
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduced){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.15});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('visible'); });
  }

  // Testimonials carousel
  var slides = document.querySelectorAll('.t-slide');
  var dots = document.querySelectorAll('.t-dot');
  if(slides.length){
    var current = 0;
    var timer;
    function goTo(i){
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }
    dots.forEach(function(dot, i){
      dot.addEventListener('click', function(){ goTo(i); resetTimer(); });
    });
    function resetTimer(){
      clearInterval(timer);
      if(!reduced){ timer = setInterval(function(){ goTo(current+1); }, 6000); }
    }
    resetTimer();
    var tWrap = document.querySelector('.t-wrap');
    if(tWrap){
      tWrap.addEventListener('mouseenter', function(){ clearInterval(timer); });
      tWrap.addEventListener('mouseleave', resetTimer);
    }
  }

  // Lightbox da galeria
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var lb = document.getElementById('lightbox');
  if(items.length && lb){
    var lbImg = document.getElementById('lbImg');
    var lbIndex = 0;
    function openLb(i){
      lbIndex = i;
      lbImg.src = items[i].querySelector('img').getAttribute('src');
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLb(){
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
    function navLb(dir){
      lbIndex = (lbIndex + dir + items.length) % items.length;
      lbImg.src = items[lbIndex].querySelector('img').getAttribute('src');
    }
    items.forEach(function(item, i){
      item.addEventListener('click', function(){ openLb(i); });
    });
    var lbClose = document.getElementById('lbClose');
    var lbPrev = document.getElementById('lbPrev');
    var lbNext = document.getElementById('lbNext');
    if(lbClose) lbClose.addEventListener('click', closeLb);
    if(lbPrev) lbPrev.addEventListener('click', function(){ navLb(-1); });
    if(lbNext) lbNext.addEventListener('click', function(){ navLb(1); });
    lb.addEventListener('click', function(e){ if(e.target === lb){ closeLb(); } });
    document.addEventListener('keydown', function(e){
      if(!lb.classList.contains('open')) return;
      if(e.key === 'Escape') closeLb();
      if(e.key === 'ArrowRight') navLb(1);
      if(e.key === 'ArrowLeft') navLb(-1);
    });
  }
})();
