// Shared navigation and footer for The Veritas Method® Online Course
(function(){
  const pages=[
    {href:'index.html',label:'Home'},
    {href:'dashboard.html',label:'My Course'},
    {href:'module1.html',label:'Intelligence Gap'},
    {href:'module2.html',label:'Standards'},
    {href:'module3.html',label:'Bias'},
    {href:'module4.html',label:'Principles'},
    {href:'module5.html',label:'Habits'},
    {href:'module6.html',label:'Values'},
    {href:'module7.html',label:'Case Studies'},
    {href:'module8.html',label:'Begin'}
  ];

  const current=location.pathname.split('/').pop()||'index.html';

  const nav=document.createElement('nav');
  nav.className='navbar';
  nav.innerHTML=`
    <a class="nav-logo" href="index.html"><img src="AV_Logo_.jpg" alt="Athena Veritas"></a>
    <ul class="nav-links">
      ${pages.map(p=>`<li><a href="${p.href}" class="${current===p.href?'active':''}">${p.label}</a></li>`).join('')}
    </ul>
    <button class="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
    <ul class="mobile-menu">
      ${pages.map(p=>`<li><a href="${p.href}" class="${current===p.href?'active':''}">${p.label}</a></li>`).join('')}
    </ul>
  `;
  document.body.prepend(nav);

  const burger=nav.querySelector('.hamburger');
  const mobile=nav.querySelector('.mobile-menu');
  burger.addEventListener('click',function(){
    burger.classList.toggle('open');
    if(mobile.classList.contains('open')){
      mobile.style.transform='translateY(-10px)';
      mobile.style.opacity='0';
      mobile.style.pointerEvents='none';
      setTimeout(()=>mobile.classList.remove('open'),300);
    }else{
      mobile.classList.add('open');
      mobile.style.display='flex';
      requestAnimationFrame(()=>{
        mobile.style.transform='translateY(0)';
        mobile.style.opacity='1';
        mobile.style.pointerEvents='all';
      });
    }
  });

  const footer=document.createElement('footer');
  footer.className='footer';
  footer.innerHTML=`
    <div class="footer-logo"><img src="AV_Logo_.jpg" alt="Athena Veritas"></div>
    <p class="footer-tagline">The Veritas Method&reg; Online Course | Human-First AI Partnership</p>
    <a class="footer-link" href="https://www.athenaveritas.ai">www.athenaveritas.ai</a>
    <p class="footer-copy">&copy; 2026 Athena Veritas Ltd. All rights reserved.</p>
  `;
  document.body.appendChild(footer);

  window.copyPrompt=function(btn){
    const text=btn.closest('.prompt-box').querySelector('.prompt-text').textContent.trim();
    navigator.clipboard.writeText(text).then(()=>{
      btn.textContent='Copied!';
      setTimeout(()=>btn.textContent='Copy',2000);
    });
  };
})();
