// Main shared JS (nav/footer injection, dynamic cards, inactivity logout, auth mock)
(function(){
  const state = { user: null };
  // Ensure nav & footer containers exist even if omitted in page markup
  let navContainer = document.querySelector('[data-component="main-nav"]');
  if(!navContainer){
    navContainer = document.createElement('div');
    navContainer.setAttribute('data-component','main-nav');
    document.body.prepend(navContainer);
  }
  let footerContainer = document.querySelector('[data-component="main-footer"]');
  if(!footerContainer){
    footerContainer = document.createElement('div');
    footerContainer.setAttribute('data-component','main-footer');
    document.body.appendChild(footerContainer);
  }
  function renderNav(){
    if(!navContainer) return; 
    const loggedIn = !!state.user;
    navContainer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <a href="index.html" class="text-3xl font-bold logo-text">NexLearn</a>
          <div class="hidden md:ml-10 md:flex md:space-x-8">
            ${navLink('index.html','home','Home')}
            ${navLink('courses.html','book','Courses')}
            ${navLink('ctf.html','flag','CTF Arena')}
            ${navLink('membership.html','award','Membership')}
            ${navLink('about.html','info','About')}
            ${loggedIn? navLink('dashboard.html','layout','Dashboard'):''}
          </div>
        </div>
        <div class="hidden md:flex items-center space-x-4">
          ${loggedIn? userMenu(state.user): authButtons()}
        </div>
        <div class="md:hidden flex items-center">
          <button id="mobile-menu-button" class="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"><i data-feather="menu"></i></button>
        </div>
      </div>
    </div>
    <div id="mobile-menu" class="md:hidden hidden px-4 pb-4 space-y-2">
      ${['Home','Courses','CTF Arena','Membership','About'].map(n=>`<a class='block text-gray-700' href='${n.toLowerCase().split(' ')[0]}.html'>${n}</a>`).join('')}
      ${loggedIn? `<a class='block text-gray-700' href='dashboard.html'>Dashboard</a><button id='logout-mobile' class='text-left w-full text-red-600'>Logout</button>`: `<a class='block text-gray-700' href='login.html'>Login</a><a class='block text-gray-700' href='signup.html'>Sign Up</a>`}
    </div>`;
  if(window.feather){ try{ feather.replace(); }catch(e){} }
    const btn = document.getElementById('mobile-menu-button');
    if(btn) btn.onclick=()=>document.getElementById('mobile-menu').classList.toggle('hidden');
    const logoutBtn = document.getElementById('logout-mobile');
    if(logoutBtn) logoutBtn.onclick=logout;
  }
  function navLink(href,icon,label){
    const active = location.pathname.endsWith(href);
    return `<a href='${href}' class='${active? 'text-gray-900 border-b-2 border-indigo-500':'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'} inline-flex items-center px-1 pt-1 text-sm font-medium'><i data-feather='${icon}' class='mr-1 nav-icon transition-transform'></i>${label}</a>`;
  }
  function authButtons(){
    return `<div class='flex items-center space-x-2'><a href='login.html' class='text-sm text-gray-600 hover:text-indigo-600 font-medium'>Login</a><a href='signup.html' class='text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700'>Sign Up</a></div>`;
  }
  function userMenu(user){
    return `<div class='relative group'><button class='flex items-center space-x-2 focus:outline-none'><span class='w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold'>${user.initials}</span><i data-feather='chevron-down' class='w-4 h-4 text-gray-600'></i></button><div class='absolute right-0 mt-2 w-40 bg-white rounded shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition'><a class='block px-4 py-2 text-sm hover:bg-gray-50' href='dashboard.html'>Dashboard</a><a class='block px-4 py-2 text-sm hover:bg-gray-50' href='settings.html'>Settings</a><button class='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50' id='logout-btn'>Logout</button></div></div>`;
  }
  function renderFooter(){
    if(!footerContainer) return;
    footerContainer.innerHTML = `
      <div class='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
        <div class='grid grid-cols-2 md:grid-cols-4 gap-8'>
          ${footerColumn('Courses',['Ethical Hacking','Digital Forensics','Network Security','courses.html|All Courses'])}
          ${footerColumn('Levels',['Beginner','Intermediate','Advanced','ctf.html|CTF Arena'])}
          ${footerColumn('Company',['about.html|About','Careers','Privacy','Terms'])}
          ${footerColumn('Support',['Contact Us','Help Center','Blog','Community'])}
        </div>
        <div class='mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between'>
          <div class='flex space-x-6 md:order-2'>
            ${socialIcon('github')} ${socialIcon('twitter')} ${socialIcon('linkedin')}
          </div>
          <p class='mt-8 text-base text-gray-400 md:mt-0 md:order-1'>&copy; <span id='copyright-year'></span> NexLearn. All rights reserved.</p>
        </div>
      </div>`;
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
  if(window.feather){ try{ feather.replace(); }catch(e){} }
  }
  function footerColumn(title, items){
    return `<div><h3 class='text-sm font-semibold text-gray-400 tracking-wider uppercase'>${title}</h3><ul class='mt-4 space-y-4'>${items.map(i=>{let [href,label]=i.includes('|')?i.split('|'):["#",i];return `<li><a href='${href}' class='text-base text-gray-300 hover:text-white'>${label}</a></li>`}).join('')}</ul></div>`;
  }
  function socialIcon(name){return `<a href='#' class='text-gray-400 hover:text-white'><i data-feather='${name}' class='h-6 w-6'></i></a>`}
  function loadMockUser(){
    try { const u = localStorage.getItem('nex_user'); if(u) state.user = JSON.parse(u);} catch(e){}
  }
  function logout(){ localStorage.removeItem('nex_user'); state.user=null; renderNav(); }
  async function api(path,opts={}){const headers={'Content-Type':'application/json',...(opts.headers||{})}; if(state.user?.token) headers['Authorization']='Bearer '+state.user.token; const res= await fetch(path,{...opts,headers}); const body= await res.json().catch(()=>({})); return {ok:res.ok,status:res.status,body}; }
  function inactivityWatcher(){
    let timer; const limit=30*60*1000; // 30 min
    ['mousemove','keypress','click','scroll'].forEach(evt=>window.addEventListener(evt,reset));
    function reset(){clearTimeout(timer);timer=setTimeout(()=>{logout();alert('Logged out due to inactivity');location.href='login.html';},limit);} reset();
  }
  function dynamicCourses(){
    const container=document.getElementById('home-course-cards'); if(!container) return;
    const courses=[
      {title:'Ethical Hacking Fundamentals',level:'Beginner',price:'FREE',icon:'lock',id:'eh-fund'},
      {title:'Digital Forensics Essentials',level:'Intermediate',price:'$49.99',icon:'search',id:'df-ess'},
      {title:'Advanced Network Security',level:'Advanced',price:'$79.99',icon:'shield',id:'ans'}
    ];
    container.innerHTML = `<div class='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>${courses.map(c=>courseCard(c)).join('')}</div><div class='mt-10 text-center'><a href='courses.html' class='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'>View All Courses <i data-feather='arrow-right' class='ml-2'></i></a></div>`;
  if(window.feather){ try{ feather.replace(); }catch(e){} }
  }
  function courseCard(c){return `<div class='course-card pt-6 transition-all duration-300 ease-in-out bg-white rounded-lg shadow-md overflow-hidden'><div class='px-6 pb-8'><div class='flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white'><i data-feather='${c.icon}'></i></div><div class='mt-6'><h3 class='text-lg font-medium text-gray-900'>${c.title}</h3><p class='mt-2 text-base text-gray-500'>...</p></div><div class='mt-6 flex justify-between items-center'><span class='text-sm font-medium text-indigo-600'>${c.level}</span><span class='text-sm font-medium text-gray-900'>${c.price}</span></div><div class='mt-6'><button onclick='NexLearn.enroll("${c.id}")' class='w-full flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'>Enroll Now</button></div></div></div>`}
  function membershipPlans(){const el=document.getElementById('membership-plans'); if(!el) return; const plans=[{name:'Basic',price:'$0',features:['Fundamental courses','Basic CTF challenges','Certificates purchasable','No advanced courses'],accent:'gray',cta:'Get started',popular:false},{name:'Pro',price:'$19',features:['All fundamental courses','All CTF challenges','3 free certificates / month','Advanced courses','30% discount on certificates'],accent:'indigo',cta:'Get started',popular:true},{name:'Enterprise',price:'$99',features:['Everything in Pro','Up to 10 team members','10 free certificates / month','Team progress tracking','Priority support'],accent:'gray',cta:'Get started',popular:false}];
    el.innerHTML = plans.map(p=>planCard(p)).join(''); feather.replace(); }
  function planCard(p){return `<div class='border ${p.popular? 'border-2 border-indigo-500 transform scale-105 z-10':'border-gray-200'} rounded-lg shadow-sm divide-y divide-gray-200'><div class='p-6'>${p.popular?"<span class='inline-flex items-center mb-2 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800'>Most Popular</span>":''}<h2 class='text-lg leading-6 font-medium text-gray-900'>${p.name}</h2><p class='mt-4 text-sm text-gray-500'>${p.name==='Basic'?'Perfect for beginners starting their cybersecurity journey': p.name==='Pro'?'For serious learners who want full access and certificates':'For organizations and teams needing bulk access'}</p><p class='mt-8'><span class='text-4xl font-extrabold text-gray-900'>${p.price}</span><span class='text-base font-medium text-gray-500'>/month</span></p><a href='signup.html' class='mt-8 block w-full bg-${p.accent}-600 border border-${p.accent}-600 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-${p.accent}-700'>${p.cta}</a></div><div class='pt-6 pb-8 px-6'><h3 class='text-xs font-medium text-gray-900 tracking-wide uppercase'>What's included</h3><ul class='mt-6 space-y-4'>${p.features.map(f=>`<li class='flex space-x-3'><i data-feather='check' class='flex-shrink-0 h-5 w-5 text-green-500'></i><span class='text-sm text-gray-500'>${f}</span></li>`).join('')}</ul></div></div>`}
  function testimonials(){const el=document.getElementById('testimonial-cards'); if(!el) return; const data=[{name:'Sarah Johnson',role:'Security Analyst',img:'https://randomuser.me/api/portraits/women/32.jpg',text:'The ethical hacking course transformed my career.'},{name:'Michael Chen',role:'IT Manager',img:'https://randomuser.me/api/portraits/men/42.jpg',text:'The CTF challenges are the best I\'ve encountered online.'},{name:'Jessica Williams',role:'Digital Forensics Specialist',img:'https://randomuser.me/api/portraits/women/68.jpg',text:'The digital forensics course gave me practical daily skills.'}];
  el.innerHTML = data.map(t=>`<div class='bg-white p-6 rounded-lg shadow'><div class='flex items-center'><img class='h-10 w-10 rounded-full' src='${t.img}' alt='${t.name}'><div class='ml-4'><div class='text-sm font-medium text-gray-900'>${t.name}</div><div class='text-sm text-gray-500'>${t.role}</div></div></div><p class='mt-4 text-gray-600'>"${t.text}"</p><div class='mt-4 flex'>${'<i data-feather="star" class="text-yellow-400"></i>'.repeat(5)}</div></div>`).join(''); if(window.feather){ try{ feather.replace(); }catch(e){} } }
  // Star utility (fractional support)
  function starHTML(avg,opts={size:'md',showValue:false,countValue:null}){
    const sizeClass=opts.size==='lg'?'text-lg':opts.size==='sm'?'text-xs':'text-base';
    let out='';
    for(let i=1;i<=5;i++){
      const full=avg>=i-0.01; // treat near integers
      out+=`<span class='${full?'text-yellow-400':'text-gray-300'} ${sizeClass} leading-none'>★</span>`;
    }
    if(opts.showValue){ out+=`<span class='ml-1 text-[11px] text-gray-600'>${avg.toFixed(1)}${opts.countValue!=null? ' ('+opts.countValue+')':''}</span>`; }
    return `<span class='inline-flex items-center'>${out}</span>`;
  }
  // Protected actions helpers
  async function enroll(courseId){
    if(!state.user){ location.href='login.html'; return; }
    const {ok,body,status}=await api('/enrollments',{method:'POST',body:JSON.stringify({courseId})});
    if(!ok){ alert(body.error||'Enroll failed'); if(status===401) logout(); return; }
    alert('Enrolled! Progress: '+body.progress+'%');
  }
  async function issueCertificate(enrollmentId){
    if(!state.user){ location.href='login.html'; return; }
    const {ok,body}=await api('/certificates/issue',{method:'POST',body:JSON.stringify({enrollmentId})});
    if(!ok){ alert(body.error||'Issue failed'); return; }
    location.href='certificate.html?name='+encodeURIComponent(body.user.name)+'&course='+encodeURIComponent(body.enrollment.course.title)+'&serial='+body.serial+'&hash='+body.hash;
  }
  // Initialize
  loadMockUser();
  renderNav();
  renderFooter();
  dynamicCourses();
  membershipPlans();
  testimonials();
  inactivityWatcher();
  document.addEventListener('click',e=>{if(e.target && e.target.id==='logout-btn'){logout();}});
  // Expose selective helpers
  window.NexLearn = { enroll, issueCertificate, starHTML };
  // NOTE: Additional utilities can be appended here (e.g., central event bus, theming) to avoid scattering globals.
})();
