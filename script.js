(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer:fine)').matches;
 
  /* scroll progress bar */
  var prog = document.getElementById('progress');
  function onScroll(){
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 30);
    var h = document.documentElement;
    prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    if(!reduced && window.scrollY < window.innerHeight){
      document.querySelector('.hero-grid-bg').style.translate = '0 ' + (window.scrollY * .12) + 'px';
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
 
  /* mobile menu */
  var burger = document.getElementById('burger'), menu = document.getElementById('mobileMenu');
  burger.addEventListener('click', function(){ menu.classList.toggle('open'); });
  menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ menu.classList.remove('open'); }); });
 
  /* duplicate ticker for seamless loop */
  var track = document.getElementById('tickerTrack');
  track.innerHTML += track.innerHTML;
 
  /* reveals + headline stagger */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal,.stagger').forEach(function(el){ io.observe(el); });
  // stagger headline lines
  document.querySelectorAll('#heroH1 .w i').forEach(function(el, i){
    el.style.transitionDelay = (0.15 + i * 0.13) + 's';
  });
 
  /* text decode effect on mono tags */
  function decode(el){
    var chars = '█▓▒░ABCDEFGHIKLMNOPRSTUVXYZ0123456789';
    var final = el.dataset.text || el.textContent;
    el.dataset.text = final;
    var frame = 0, total = final.length * 3;
    (function tick(){
      var out = '';
      for(var i = 0; i < final.length; i++){
        out += (i < frame / 3) ? final[i] : (final[i] === ' ' ? ' ' : chars[Math.floor(Math.random()*chars.length)]);
      }
      el.textContent = out;
      if(frame++ < total) requestAnimationFrame(tick); else el.textContent = final;
    })();
  }
  if(!reduced){
    decode(document.getElementById('decodeTag'));
    setTimeout(function(){ decode(document.getElementById('decodeHud')); }, 700);
  }
 
  /* counters */
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      var el = e.target, target = +el.dataset.target, dur = 1900, t0 = null;
      function step(t){
        if(!t0) t0 = t;
        var p = Math.min((t - t0)/dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if(p < 1) requestAnimationFrame(step);
      }
      reduced ? el.textContent = target : requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, {threshold:.6});
  document.querySelectorAll('.counter').forEach(function(el){ cio.observe(el); });
 
  /* NDVI grid */
  var ndviColors = ['#D14A33','#E0A33C','#B8D14A','#46E08B','#1E9E5C'];
  var grid = document.getElementById('ndviGrid'), cells = [];
  var COLS = 14, ROWS = 10;
  var stress = [{x:3,y:2.4,r:2.4},{x:10.5,y:7,r:2}];
  for(var y = 0; y < ROWS; y++){
    for(var x = 0; x < COLS; x++){
      var v = 0.72 + Math.sin(x*.6)*0.06 + Math.cos(y*.85)*0.05 + (Math.random()-.5)*0.06;
      stress.forEach(function(s){
        var d = Math.hypot(x - s.x, y - s.y);
        if(d < s.r) v -= (1 - d/s.r) * 0.45;
      });
      var idx = Math.max(0, Math.min(4, Math.floor((v - 0.25)/0.12)));
      var c = document.createElement('div');
      c.className = 'ndvi-cell';
      c.style.background = ndviColors[idx];
      c.style.animationDelay = ((y*COLS + x) * 10) + 'ms';
      c.dataset.base = idx;
      grid.appendChild(c); cells.push(c);
    }
  }
  if(!reduced){
    setInterval(function(){
      var c = cells[Math.floor(Math.random()*cells.length)];
      var b = +c.dataset.base;
      c.style.background = ndviColors[Math.max(0, Math.min(4, b + (Math.random() < .5 ? -1 : 1)))];
      setTimeout(function(){ c.style.background = ndviColors[b]; }, 800);
    }, 500);
  }
 
  /* particles */
  var canvas = document.getElementById('particles'), ctx = canvas.getContext('2d'), parts = [];
  function resize(){ canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  for(var i = 0; i < 60; i++){
    parts.push({x:Math.random(), y:Math.random(), r:Math.random()*1.6+.4,
      vx:(Math.random()-.5)*.0002, vy:-(Math.random()*.00028+.0001),
      o:Math.random()*.5+.15, gold:Math.random()<.55});
  }
  function drawParts(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    parts.forEach(function(p){
      p.x += p.vx; p.y += p.vy;
      if(p.y < -.02){ p.y = 1.02; p.x = Math.random(); }
      if(p.x < -.02) p.x = 1.02; if(p.x > 1.02) p.x = -.02;
      ctx.beginPath();
      ctx.arc(p.x*canvas.width, p.y*canvas.height, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.gold ? 'rgba(201,161,74,'+p.o+')' : 'rgba(70,224,139,'+(p.o*.6)+')';
      ctx.fill();
    });
    if(!reduced) requestAnimationFrame(drawParts);
  }
  drawParts();
 
  /* mouse parallax on hero drone */
  var droneP = document.getElementById('droneParallax'), heroV = document.getElementById('heroVisual');
  if(!reduced && finePointer){
    document.querySelector('.hero').addEventListener('mousemove', function(e){
      var r = heroV.getBoundingClientRect();
      droneP.style.translate = ((e.clientX-(r.left+r.width/2))/r.width*18)+'px '+((e.clientY-(r.top+r.height/2))/r.height*14)+'px';
    });
  }
 
  /* 3D tilt cards + glare */
  if(!reduced && finePointer){
    document.querySelectorAll('.tilt').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width, py = (e.clientY - r.top)/r.height;
        card.style.transform = 'rotateY('+((px-.5)*10)+'deg) rotateX('+((.5-py)*8)+'deg) translateZ(0)';
        card.style.setProperty('--gx', px*100+'%');
        card.style.setProperty('--gy', py*100+'%');
      });
      card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
    });
  }
 
  /* magnetic buttons */
  if(!reduced && finePointer){
    document.querySelectorAll('.magnetic').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        btn.style.transform = 'translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)';
      });
      btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
    });
  }
})();
 
