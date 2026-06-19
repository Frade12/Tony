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
      var grid = document.querySelector('.hero-grid-bg');
      if(grid) grid.style.translate = '0 ' + (window.scrollY * .12) + 'px';
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
  if(!reduced && finePointer && droneP && heroV){
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
