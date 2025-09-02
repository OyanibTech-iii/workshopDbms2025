// Inject navbar from external file, then initialize interactions
(function initNavbar(){
  var header = document.getElementById('siteHeader');
  if (!header) { initializeInteractions(); return; }
  fetch('navbar.html', { cache: 'no-store' })
    .then(function(r){ return r.text(); })
    .then(function(html){
      header.innerHTML = html;
      initializeInteractions();
    })
    .catch(function(){ initializeInteractions(); });
})();

function initializeInteractions(){
  // Smooth scroll for in-page links (top + side nav)
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

// Mobile menu toggle
  var hamburger = document.querySelector('.hamburger');
  var sideNav = document.getElementById('sideNav');
  if (sideNav) {
    var mq = window.matchMedia('(min-width: 900px)');
    var syncSideNav = function(){
      if (mq.matches) {
        sideNav.style.display = 'block';
        if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
      } else {
        sideNav.style.display = 'none';
        if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
      }
    };
    syncSideNav();
    mq.addEventListener ? mq.addEventListener('change', syncSideNav) : mq.addListener(syncSideNav);
  }
  if (hamburger && sideNav) {
    hamburger.addEventListener('click', function() {
      var isDesktop = window.matchMedia('(min-width: 900px)').matches;
      if (isDesktop) return; // desktop aside stays visible
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      sideNav.style.display = expanded ? 'none' : 'block';
    });
    // Close side nav when a link inside it is clicked (mobile only)
    sideNav.querySelectorAll('a[href^="#"]').forEach(function(link){
      link.addEventListener('click', function(){
        var isMobile = window.matchMedia('(max-width: 899px)').matches;
        if (isMobile) {
          sideNav.style.display = 'none';
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // Top nav active link sync with scroll
  var topNavLinks = Array.prototype.slice.call(document.querySelectorAll('.top-nav a'));
  if (topNavLinks.length) {
    var activeObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var id = entry.target.getAttribute('id');
        var link = document.querySelector('.top-nav a[href="#' + id + '"]');
        if (!link) return;
        if (entry.isIntersecting) {
          topNavLinks.forEach(function(a){ a.classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('main section').forEach(function(section){ activeObserver.observe(section); });
  }
}

// Copy-to-clipboard for code blocks
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  var ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

document.querySelectorAll('pre.code').forEach(function(pre) {
  pre.setAttribute('tabindex', '0');
  pre.addEventListener('click', function() {
    var code = this.textContent;
    copyText(code).then(function() {
      pre.classList.add('copied');
      pre.style.boxShadow = '0 0 0 2px rgba(79,195,247,0.6) inset';
      setTimeout(function(){
        pre.classList.remove('copied');
        pre.style.boxShadow = '';
      }, 700);
    });
  });
});

// Scrollspy for side nav
var observer = new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    var id = entry.target.getAttribute('id');
    var link = document.querySelector('.side-nav a[href="#' + id + '"]');
    if (!link) return;
    if (entry.isIntersecting) {
      document.querySelectorAll('.side-nav a').forEach(function(a){ a.classList.remove('active'); });
      link.classList.add('active');
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('main section').forEach(function(section){ observer.observe(section); });

// Back to top button
var toTop = document.querySelector('.to-top');
window.addEventListener('scroll', function(){
  if (!toTop) return;
  var y = window.scrollY || window.pageYOffset;
  if (y > 500) { toTop.classList.add('show'); } else { toTop.classList.remove('show'); }
});
if (toTop) {
  toTop.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

// Subtle favicon pulse animation by swapping icons via canvas tint
(function animateFavicon(){
  var link = document.querySelector('link#favicon');
  if (!link) return;
  var baseHref = link.getAttribute('href');
  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = baseHref;
  var step = 0;
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  function tick(){
    if (!img.complete) { requestAnimationFrame(tick); return; }
    canvas.width = img.width; canvas.height = img.height;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0);
    var alpha = 0.25 + 0.25 * Math.sin(step/10);
    ctx.fillStyle = 'rgba(0,229,255,' + alpha.toFixed(2) + ')';
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    var dataUrl = canvas.toDataURL('image/png');
    link.href = dataUrl;
    step++;
    requestAnimationFrame(tick);
  }
  tick();
})();


