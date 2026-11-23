// Library Management System: sample data, in memory only.
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const today=()=>iso(new Date());
const diff=(a,b)=>Math.round((new Date(b+"T00:00")-new Date(a+"T00:00"))/864e5);
const FINE=5,LIMIT=3;
let books=[
 {id:1,title:"Noli Me Tangere",author:"José Rizal",category:"Fiction",total:3},
 {id:2,title:"El Filibusterismo",author:"José Rizal",category:"Fiction",total:2},
 {id:3,title:"Clean Code",author:"Robert C. Martin",category:"Technology",total:2},
 {id:4,title:"The Pragmatic Programmer",author:"Hunt & Thomas",category:"Technology",total:1},
 {id:5,title:"A Brief History of Time",author:"Stephen Hawking",category:"Science",total:2},
 {id:6,title:"Atomic Habits",author:"James Clear",category:"Self-help",total:3},
 {id:7,title:"Sapiens",author:"Yuval Noah Harari",category:"History",total:2}];
let members=[{id:1,name:"Ana Reyes",email:"ana@example.com"},{id:2,name:"Ben Santos",email:"ben@example.com"},{id:3,name:"Carla Dizon",email:"carla@example.com"},{id:4,name:"Dan Ocampo",email:"dan@example.com"}];
let records=[
 {id:1,book:1,member:1,borrowed:addDays(-10),due:addDays(-3),returned:null},
 {id:2,book:3,member:2,borrowed:addDays(-2),due:addDays(5),returned:null},
 {id:3,book:6,member:1,borrowed:addDays(-1),due:addDays(6),returned:null},
 {id:4,book:7,member:3,borrowed:addDays(-20),due:addDays(-13),returned:addDays(-12)}];
let seq={b:8,m:5,r:5},rfilter="All";
const book=id=>books.find(b=>b.id==id),member=id=>members.find(m=>m.id==id);
const activeOf=id=>records.filter(r=>r.book==id&&!r.returned).length;
const heldBy=id=>records.filter(r=>r.member==id&&!r.returned).length;
const status=r=>r.returned?"Returned":r.due<today()?"Overdue":"Borrowed";
const fine=r=>Math.max(0,diff(r.due,r.returned||today()))*FINE;
const chip=s=>`<span class="chip ${s==="Overdue"?"over":s==="Returned"?"done":""}">${s}</span>`;
const cover=c=>{let h=0;for(const ch of c)h=(h*31+ch.charCodeAt(0))%5;return"c"+h};
const initials=n=>n.split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
const plural=(n,w)=>n+" "+w+(n===1?"":"s");
let tt;function toast(t,err){const e=$("#toast");e.textContent=t;e.className="toast"+(err?" err":"");clearTimeout(tt);tt=setTimeout(()=>e.textContent="",4500)}
const wiz={step:1,member:"",book:"",due:addDays(7)};

function donut(parts,total){const R=56,C=2*Math.PI*R;let off=0;
  const segs=parts.filter(p=>p[0]>0).map(([n,col])=>{const len=n/total*C;const s=`<circle cx="70" cy="70" r="${R}" fill="none" stroke="${col}" stroke-width="22" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"/>`;off+=len;return s}).join("");
  return`<svg viewBox="0 0 140 140" role="img" aria-label="Copies on the shelf versus borrowed"><circle cx="70" cy="70" r="${R}" fill="none" stroke="#eaeef3" stroke-width="22"/>${segs}<text x="70" y="76" text-anchor="middle" font-family="IBM Plex Sans,sans-serif" font-weight="500" font-size="28">${parts[0][0]}</text></svg>`}

function renderDash(){
  const total=books.reduce((a,b)=>a+b.total,0),act=records.filter(r=>!r.returned),over=act.filter(r=>status(r)==="Overdue"),avail=total-act.length;
  $("#today").textContent=new Date().toLocaleDateString("en-PH",{weekday:"long",month:"long",day:"numeric"});
  $("#hero-line").textContent=total?`${avail} of ${total} books are on the shelf.`:"The shelf is empty.";
  $("#hero-sub").textContent=over.length?`${plural(over.length,"book")} ${over.length===1?"is":"are"} overdue. Collect ${over.length===1?"it":"them"} or let the member know.`:"Nothing is overdue. Every loan is within its due date.";
  $("#k-total").textContent=total;$("#k-avail").textContent=avail;$("#k-bor").textContent=act.length;$("#k-over").textContent=over.length;
  const parts=[[avail,"#141314"],[act.length-over.length,"#4f78b5"],[over.length,"#9a3412"]];
  $("#donut").innerHTML=total?donut(parts,total):"";
  $("#legend").innerHTML=[["On the shelf","#141314",avail],["Borrowed","#4f78b5",act.length-over.length],["Overdue","#9a3412",over.length]].map(([l,c,n])=>`<li><span class="sw" style="background:${c}"></span>${l}<b>${n}</b></li>`).join("");
  const due=[...act].sort((a,b)=>a.due.localeCompare(b.due)).slice(0,6);
  $("#due").innerHTML=due.length?due.map(r=>{const d=diff(today(),r.due),o=d<0;return`<li class="${o?"over":""}"><b>${esc(book(r.book)?.title??"")}</b><span>${esc(member(r.member)?.name??"")} · </span><span class="${o?"over-t":""}">${o?`overdue by ${plural(-d,"day")}, fine PHP ${fine(r)}`:d===0?"due today":`due in ${plural(d,"day")}`}</span></li>`}).join(""):'<li><span>No books are out right now.</span></li>';
  const cat={};books.forEach(b=>cat[b.category]=(cat[b.category]||0)+b.total);
  $("#cats").innerHTML=Object.entries(cat).map(([c,n])=>`<span>${esc(c)}<b>${n}</b></span>`).join("")||'<p class="empty">No books yet.</p>';
}
function renderBooks(){
  const f=$("#q").value.trim().toLowerCase(),list=books.filter(b=>(b.title+b.author+b.category).toLowerCase().includes(f));
  $("#books").innerHTML=list.length?list.map(b=>{const av=b.total-activeOf(b.id);return`<article class="book"><div class="cover ${cover(b.category)}"><span class="tag">${esc(b.category)}</span><div><h3>${esc(b.title)}</h3></div><span class="auth">${esc(b.author)}</span></div><div class="meta"><span class="badge ${av?"":"none"}">${av?`${av} of ${b.total} on shelf`:"None on shelf"}</span><div class="acts"><button class="btn s sm" data-eb="${b.id}" aria-label="Edit ${esc(b.title)}">Edit</button><button class="btn s sm" data-db="${b.id}" aria-label="Delete ${esc(b.title)}">Delete</button></div></div></article>`}).join(""):`<p class="empty">${books.length?"Book not found.":"No books yet. Add one."}</p>`;
}
function renderMembers(){
  $("#members").innerHTML=members.length?members.map(m=>{const h=heldBy(m.id);return`<article class="person"><div class="av" aria-hidden="true">${initials(m.name)}</div><div><b>${esc(m.name)}</b><small>${esc(m.email)}</small><div class="dots" role="img" aria-label="${h} of ${LIMIT} books borrowed">${Array.from({length:LIMIT},(_,i)=>`<i class="${i<h?"on":""}"></i>`).join("")}</div></div><div class="acts"><button class="btn s sm" data-em="${m.id}" aria-label="Edit ${esc(m.name)}">Edit</button><button class="btn s sm" data-dm="${m.id}" aria-label="Delete ${esc(m.name)}">Delete</button></div></article>`}).join(""):'<p class="empty">No members yet. Add one.</p>';
}
function renderWiz(){
  $("#steps").querySelectorAll("li").forEach((li,i)=>{li.className=i+1===wiz.step?"on":i+1<wiz.step?"done":""});
  [1,2,3].forEach(n=>$("#s"+n).hidden=n!==wiz.step);
  $("#s1").innerHTML=`<h3>Who is borrowing?</h3><div class="opts">${members.length?members.map(m=>{const h=heldBy(m.id),full=h>=LIMIT;return`<label class="opt"><input type="radio" name="wm" value="${m.id}" ${wiz.member==m.id?"checked":""} ${full?"disabled":""}><span>${esc(m.name)}<small>${full?"Has reached the limit":`${h} of ${LIMIT} books borrowed`}</small></span></label>`}).join(""):'<p class="empty">Add a member first.</p>'}</div>`;
  $("#s2").innerHTML=`<h3>Which book?</h3><div class="opts">${books.length?books.map(b=>{const av=b.total-activeOf(b.id);return`<label class="opt"><input type="radio" name="wb" value="${b.id}" ${wiz.book==b.id?"checked":""} ${av?"":"disabled"}><span>${esc(b.title)}<small>${av?`${av} left · ${esc(b.author)}`:"No copies available"}</small></span></label>`}).join(""):'<p class="empty">Add a book first.</p>'}</div>`;
  $("#b-due").value=wiz.due;
  $("#rc-m").textContent=member(wiz.member)?.name||"Not chosen";$("#rc-b").textContent=book(wiz.book)?.title||"Not chosen";$("#rc-d").textContent=wiz.due||"-";
  $("#wback").style.visibility=wiz.step>1?"visible":"hidden";$("#wnext").textContent=wiz.step===3?"Confirm borrow":"Next";
}
function renderLoans(){
  const act=records.filter(r=>!r.returned);
  $("#loans").innerHTML=act.length?act.map(r=>`<article class="loan"><b>${esc(book(r.book)?.title??"")}</b><span>${esc(member(r.member)?.name??"")}</span><span>Due ${r.due}</span>${chip(status(r))}${fine(r)?`<span>Fine so far: PHP ${fine(r)}</span>`:""}<button class="btn p" data-ret="${r.id}">Return this book</button></article>`).join(""):'<p class="empty">No borrowed books right now.</p>';
}
function renderRecords(){
  const rs=[...records].reverse().filter(r=>rfilter==="All"||status(r)===rfilter);
  const g={};rs.forEach(r=>(g[r.borrowed]=g[r.borrowed]||[]).push(r));
  $("#recs").innerHTML=rs.length?Object.keys(g).sort().reverse().map(d=>`<div class="day"><h3>${new Date(d+"T00:00").toLocaleDateString("en-PH",{month:"short",day:"numeric"})}</h3><ul>${g[d].map(r=>`<li><div><b>${esc(book(r.book)?.title??"")}</b><small>${esc(member(r.member)?.name??"")} · due ${r.due}${r.returned?` · returned ${r.returned}`:""}</small></div><div class="r">${chip(status(r))}${fine(r)?`<small style="display:block">Fine PHP ${fine(r)}</small>`:""}</div></li>`).join("")}</ul></div>`).join(""):'<p class="empty">No records.</p>';
}
function render(){renderDash();renderBooks();renderMembers();renderWiz();renderLoans();renderRecords()}

function openForm({title,fields,values={},save}){
  const f=$("#fform");
  f.innerHTML=`<h3>${esc(title)}</h3>`+fields.map(x=>`<div class="f"><label for="f-${x.k}">${x.label}</label><input id="f-${x.k}" type="${x.type||"text"}" ${x.attrs||""}></div>`).join("")+`<div class="msg err" id="ferr" role="alert"></div><div class="row"><button type="button" class="btn s" id="fcancel">Cancel</button><button class="btn p" type="submit">Save</button></div>`;
  fields.forEach(x=>$("#f-"+x.k).value=values[x.k]??"");
  f.onsubmit=e=>{e.preventDefault();const v={};fields.forEach(x=>v[x.k]=$("#f-"+x.k).value.trim());const err=save(v);if(err)return $("#ferr").textContent=err;$("#fdlg").close()};
  $("#fcancel").onclick=()=>$("#fdlg").close();$("#fdlg").showModal();$("#f-"+fields[0].k).focus();
}
function confirmBox(t,yes){$("#ctext").textContent=t;$("#cyes").onclick=()=>{$("#cdlg").close();yes()};$("#cdlg").showModal()}
$("#cno").onclick=()=>$("#cdlg").close();
const bookFields=[{k:"title",label:"Title"},{k:"author",label:"Author"},{k:"category",label:"Category"},{k:"total",label:"Copies",type:"number",attrs:'min="1" step="1"'}];
function bookForm(b){openForm({title:b?"Edit book":"Add book",fields:bookFields,values:b||{},save:v=>{
  if(!v.title)return"Title is required.";if(!v.author)return"Author is required.";if(!v.category)return"Category is required.";
  const t=Number(v.total);if(!v.total||!Number.isInteger(t)||t<1)return"Copies must be a whole number, 1 or more.";
  if(b&&t<activeOf(b.id))return`${activeOf(b.id)} cop${activeOf(b.id)>1?"ies are":"y is"} borrowed, so copies can't go lower.`;
  if(b){Object.assign(b,{title:v.title,author:v.author,category:v.category,total:t});toast(`${v.title} updated.`)}
  else{books.push({id:seq.b++,title:v.title,author:v.author,category:v.category,total:t});toast(`${v.title} added.`)}
  render()}})}
function memberForm(m){openForm({title:m?"Edit member":"Add member",fields:[{k:"name",label:"Name"},{k:"email",label:"Email",type:"email"}],values:m||{},save:v=>{
  if(!v.name)return"Name is required.";if(!/^\S+@\S+\.\S+$/.test(v.email))return"Enter a valid email.";
  if(members.some(x=>x.email.toLowerCase()===v.email.toLowerCase()&&x!==m))return"This email is already used.";
  if(m){Object.assign(m,v);toast(`${v.name} updated.`)}else{members.push({id:seq.m++,...v});toast(`${v.name} added.`)}
  render()}})}
$("#add-book").onclick=()=>bookForm();$("#add-mem").onclick=()=>memberForm();
$("#books").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.eb)bookForm(book(b.dataset.eb));
  if(b.dataset.db){const x=book(b.dataset.db);if(activeOf(x.id))return toast(`${x.title} is borrowed and can't be deleted.`,1);
    confirmBox(`Delete ${x.title}?`,()=>{books=books.filter(y=>y!==x);toast(`${x.title} deleted.`);render()})}});
$("#members").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.em)memberForm(member(b.dataset.em));
  if(b.dataset.dm){const x=member(b.dataset.dm);if(heldBy(x.id))return toast(`${x.name} still has borrowed books.`,1);
    confirmBox(`Delete ${x.name}?`,()=>{members=members.filter(y=>y!==x);toast(`${x.name} deleted.`);render()})}});
// borrow wizard
function bmsg(t,ok){const m=$("#bmsg");m.textContent=t;m.className="msg "+(ok?"ok":"err")}
$("#p-borrow").addEventListener("change",e=>{if(e.target.name==="wm")wiz.member=e.target.value;if(e.target.name==="wb")wiz.book=e.target.value;if(e.target.id==="b-due")wiz.due=e.target.value;bmsg("");renderWiz()});
$("#p-borrow").addEventListener("click",e=>{const d=e.target.closest("[data-d]");if(d){wiz.due=addDays(+d.dataset.d);renderWiz()}});
$("#wback").onclick=()=>{wiz.step--;bmsg("");renderWiz()};
$("#wnext").onclick=()=>{
  const m=member(wiz.member),b=book(wiz.book);
  if(wiz.step===1){if(!m)return bmsg("Pick a member first.");if(heldBy(m.id)>=LIMIT)return bmsg(`${m.name} already has ${LIMIT} books.`);wiz.step=2;bmsg("");return renderWiz()}
  if(wiz.step===2){if(!b)return bmsg("Pick a book first.");if(b.total-activeOf(b.id)<=0)return bmsg("No copies available.");wiz.step=3;bmsg("");return renderWiz()}
  if(!m){wiz.step=1;renderWiz();return bmsg("Member not found.")}if(!b){wiz.step=2;renderWiz();return bmsg("Book not found.")}
  if(b.total-activeOf(b.id)<=0)return bmsg("No copies available.");
  if(heldBy(m.id)>=LIMIT)return bmsg(`${m.name} already has ${LIMIT} books.`);
  if(!wiz.due||wiz.due<today())return bmsg("Due date must be today or later.");
  records.push({id:seq.r++,book:b.id,member:m.id,borrowed:today(),due:wiz.due,returned:null});
  const msg=`${m.name} borrowed ${b.title}. Due ${wiz.due}.`;
  Object.assign(wiz,{step:1,member:"",book:"",due:addDays(7)});render();bmsg(msg,true)};
$("#seg").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  document.querySelectorAll("#seg button").forEach(x=>x.setAttribute("aria-selected",x===b));
  $("#p-borrow").hidden=b.dataset.p!=="p-borrow";$("#p-return").hidden=b.dataset.p!=="p-return"});
$("#loans").addEventListener("click",e=>{const b=e.target.closest("[data-ret]");if(!b)return;
  const r=records.find(x=>x.id==b.dataset.ret);r.returned=today();const f=fine(r);
  render();toast(`${book(r.book)?.title} returned.`+(f?` Fine: PHP ${f}.`:""))});
$("#rfs").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;rfilter=b.dataset.f;
  document.querySelectorAll("#rfs button").forEach(x=>x.setAttribute("aria-pressed",x===b));renderRecords()});
const names=["dash","books","members","borrow","records"];
function show(v){names.forEach(n=>$("#v-"+n).hidden=n!==v);
  document.querySelectorAll("#menu button").forEach(b=>b.dataset.v===v?b.setAttribute("aria-current","page"):b.removeAttribute("aria-current"));$("#toast").textContent=""}
document.querySelectorAll("#menu button").forEach(b=>b.onclick=()=>show(b.dataset.v));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>show(b.dataset.go));
$("#q").addEventListener("input",()=>{show("books");renderBooks()});
render();
