(function(){
  var root = document.getElementById('zakulisie');

  /* ====== ССЫЛКА КНОПОК «ВСТУПИТЬ» / «ХОЧУ В КЛУБ» ====== */
  var CTA_URL = 'https://t.me/my_mercury_bot?start=klub';
  if (CTA_URL) root.querySelectorAll('.zk-join, .z2-join').forEach(function(a){
    a.href = CTA_URL; a.target = '_blank'; a.rel = 'noopener';
  });

  /* ====== «Заглянуть за кулисы» — плавно к «Как это работает» ====== */
  root.querySelectorAll('a[href="#how"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var t = document.getElementById('how'); if (!t) return;
      e.preventDefault(); t.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  /* ====== СЦЕНА: кулисы разъезжаются по прокрутке ====== */
  (function(){
    var act = root.querySelector('.zk-act');
    if (!act || !window.requestAnimationFrame) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    act.classList.add('is-live');
    var pin = act.querySelector('.zk-act__pin'), tx = act.querySelector('.zk-act__tx'),
        list = act.querySelector('.zk-act__qs'), qs = [].slice.call(act.querySelectorAll('.zk-act__qs li'));
    var TH = [.48, .59, .7, .81], listH = 0, busy = false;
    function cl(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
    function span(p, a, b){ return cl((p - a) / (b - a)); }
    function ease(x){ return x * x * (3 - 2 * x); }
    var cur = act.querySelector('.zk-act__cur');
    function measure(){
      listH = list.offsetHeight + parseFloat(getComputedStyle(list).marginTop || 0);
      // ширину полотна считаем от высоты сцены (картинка 736×2392), а не по картинке — та может быть ещё не разложена
      var PW = pin.offsetWidth, wide = PW > 760, W = pin.offsetHeight * (wide ? 1.25 : 1) * 736 / 2392;
      // в начале полотна смыкаются по центру, в конце — рамка по краям, текстовая колонка свободна
      act.style.setProperty('--in', Math.max(0, PW / 2 - W + 24) + 'px');
      act.style.setProperty('--out', Math.max(0, wide ? W - (PW - 860) / 2 : W - 34) + 'px');
      update();
    }
    window.addEventListener('load', measure);
    function update(){
      busy = false;
      var r = act.getBoundingClientRect(), run = r.height - pin.offsetHeight;
      var p = run > 0 ? cl(-r.top / run) : 1;
      act.style.setProperty('--open', ease(span(p, .04, .44)).toFixed(4));
      act.style.setProperty('--t', span(p, .12, .34).toFixed(4));
      act.style.setProperty('--hint', (1 - span(p, 0, .05)).toFixed(3));
      var last = -1;
      qs.forEach(function(li, i){ var on = p >= TH[i]; li.classList.toggle('on', on); if (on) last = i; });
      qs.forEach(function(li, i){ li.classList.toggle('past', i < last); });
      // пока реплик нет, заголовок стоит по центру; с каждой репликой блок подтягивается вверх
      var q = span(p, .44, .83);
      tx.style.transform = 'translateY(' + ((1 - q) * listH / 2).toFixed(1) + 'px)';
    }
    window.addEventListener('scroll', function(){ if (!busy){ busy = true; requestAnimationFrame(update); } }, {passive:true});
    window.addEventListener('resize', measure);
    measure();
  })();

  /* ====== где лежат картинки (для Тильды — адрес их CDN) ====== */
  var IMG_BASE = 'https://cdn.jsdelivr.net/gh/maxikosh-bot/zakulisie-assets@ef6cdbd/';
  if (IMG_BASE !== 'assets/'){
    root.querySelectorAll('img[data-file]').forEach(function(im){ im.src = IMG_BASE + im.getAttribute('data-file'); });
    root.querySelectorAll('[data-bg]').forEach(function(el){
      el.style.backgroundImage = 'url(' + IMG_BASE + el.getAttribute('data-bg') + ')';
    });
  }

  /* появления при скролле */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -5% 0px'});
  root.querySelectorAll('.zk-rv, .z2-rv').forEach(function(el){ io.observe(el); });

  /* карусель карточек сезонов */
  var track = document.getElementById('zkTrack');
  if (track){
    var slides = [].slice.call(track.children), dots = document.getElementById('zkDots');
    slides.forEach(function(_, i){
      var d = document.createElement('i');
      d.addEventListener('click', function(){ go(i); });
      dots.appendChild(d);
    });
    function step(){ return slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 20); }
    function cur(){ return Math.max(0, Math.min(slides.length-1, Math.round(track.scrollLeft / step()))); }
    function go(i){ track.scrollTo({left: Math.max(0, Math.min(slides.length-1, i)) * step(), behavior:'smooth'}); }
    function sync(){ [].forEach.call(dots.children, function(d,i){ d.classList.toggle('is-on', i === cur()); }); }
    track.addEventListener('scroll', sync, {passive:true});
    document.getElementById('zkPrev').addEventListener('click', function(){ go(cur()-1); });
    document.getElementById('zkNext').addEventListener('click', function(){ go(cur()+1); });
    sync();
    var down=false, sx=0, sl=0;
    track.addEventListener('pointerdown', function(e){
      if (e.pointerType === 'touch') return;
      down=true; sx=e.clientX; sl=track.scrollLeft; track.classList.add('is-drag'); track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function(e){ if(down) track.scrollLeft = sl - (e.clientX - sx); });
    ['pointerup','pointercancel'].forEach(function(ev){
      track.addEventListener(ev, function(){ if(!down) return; down=false; track.classList.remove('is-drag'); go(cur()); });
    });
  }

  /* ====== архив сезонов: стрелки, счётчик, перетаскивание, лайтбокс ====== */
  var z2t = document.getElementById('z2Track');
  if (z2t){
    var cards = [].slice.call(z2t.children), cnt = document.getElementById('z2Cnt');
    var pad2 = function(n){ return (n<10?'0':'')+n; };
    var step2 = function(){
      var w = cards[0].getBoundingClientRect().width, g = parseFloat(getComputedStyle(z2t).columnGap);
      if (!isFinite(g)) g = 20;
      return w > 0 ? w + g : 0;
    };
    var idx2 = function(){ var st = step2(); return st ? Math.max(0, Math.min(cards.length-1, Math.round(z2t.scrollLeft / st))) : 0; };
    var go2 = function(i){ z2t.scrollTo({left: Math.max(0, Math.min(cards.length-1, i)) * step2(), behavior:'smooth'}); };
    var sync2 = function(){ cnt.innerHTML = pad2(idx2()+1) + ' <i>/ ' + pad2(cards.length) + '</i>'; };
    z2t.addEventListener('scroll', sync2, {passive:true});
    window.addEventListener('resize', sync2); window.addEventListener('load', sync2); sync2();
    document.getElementById('z2Prev').addEventListener('click', function(){ go2(idx2()-1); });
    document.getElementById('z2Next').addEventListener('click', function(){ go2(idx2()+1); });
    var dn=false, mv=false, sx2=0, sl2=0;
    z2t.addEventListener('pointerdown', function(e){ if (e.pointerType === 'touch') return; dn=true; mv=false; sx2=e.clientX; sl2=z2t.scrollLeft; });
    z2t.addEventListener('pointermove', function(e){
      if (!dn) return;
      if (!mv && Math.abs(e.clientX-sx2) > 6){ mv=true; z2t.classList.add('is-drag'); z2t.setPointerCapture(e.pointerId); }
      if (mv) z2t.scrollLeft = sl2 - (e.clientX - sx2);
    });
    ['pointerup','pointercancel'].forEach(function(ev){
      z2t.addEventListener(ev, function(){ if (!dn) return; dn=false; if (mv){ z2t.classList.remove('is-drag'); go2(idx2()); } });
    });
    var lb = document.getElementById('z2Lb'), lbImg = document.getElementById('z2LbImg'), lastBtn = null;
    var closeLb = function(){ lb.classList.remove('is-open'); if (lastBtn) lastBtn.focus(); };
    cards.forEach(function(c){
      var b = c.querySelector('button');
      b.addEventListener('click', function(e){
        if (mv){ e.preventDefault(); return; }
        var im = b.querySelector('img');
        lbImg.src = im.src; lbImg.alt = im.alt; lb.classList.add('is-open'); lastBtn = b;
        document.getElementById('z2LbX').focus();
      });
    });
    lb.addEventListener('click', function(e){ if (e.target !== lbImg) closeLb(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb(); });
  }

  /* ====== плавающая кнопка на телефоне ====== */
  var dock = document.getElementById('z2Dock'), heroEl = root.querySelector('.zk-hero'), joinEl = document.getElementById('join');
  if (dock && heroEl && joinEl){
    var tick = false;
    var onScroll = function(){
      tick = false;
      var vh = window.innerHeight;
      dock.classList.toggle('is-on', heroEl.getBoundingClientRect().bottom < 0 && joinEl.getBoundingClientRect().top > vh * .9);
    };
    window.addEventListener('scroll', function(){ if (!tick){ tick = true; requestAnimationFrame(onScroll); } }, {passive:true});
    window.addEventListener('resize', onScroll); onScroll();
  }
})();
