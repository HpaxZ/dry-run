const N=[[70,70,"Purok 1"],[230,60,"Chapel"],[400,70,"Evacuation Center"],[570,60,"Barangay Hall"],[655,115,"Highway Junction"],
[80,200,"Purok 3"],[240,190,"Elementary School"],[390,210,"Crossing"],[560,200,"Public Market"],[660,255,"Purok 5"],
[90,355,"Health Center"],[250,345,"Purok 4"],[400,365,"Riverside Bridge"],[560,355,"Sitio Baybay"],[650,415,"Fishpond End"]];
const E=[[0,1,"Rizal St"],[1,2,"Rizal St"],[2,3,"Rizal St"],[3,4,"Rizal St Ext"],
[5,6,"Mabini Rd"],[6,7,"Mabini Rd"],[7,8,"Mabini Rd"],[8,9,"Mabini Rd"],
[10,11,"Riverside Rd"],[11,12,"Riverside Rd"],[12,13,"Riverside Rd"],[13,14,"Riverside Rd"],
[0,5,"Sitio Ilaya Ln"],[5,10,"Sitio Ilaya Ln"],[1,6,"Purok 2 Rd"],[6,11,"Purok 2 Rd"],
[2,7,"Bayan Ave"],[7,12,"Bayan Ave"],[3,8,"Palengke Rd"],[8,13,"Palengke Rd"],
[4,9,"Highway Link"],[9,14,"Highway Link"],
[6,12,"Eskinita (footpath)",["walk","motorcycle"]],[7,13,"Kalye Pag-asa",["walk","motorcycle","tricycle"]]];
const V={walk:["Walking",.25,[1,1.2,3,Infinity,Infinity]],motorcycle:["Motorcycle",1,[1,1.2,Infinity,Infinity,Infinity]],tricycle:["Tricycle",.75,[1,1.2,2.2,Infinity,Infinity]],car:["Car",1,[1,1.1,2.5,Infinity,Infinity]],truck:["Jeep / truck",.85,[1,1,1.4,3,Infinity]]};
const DN=["Clear","Ankle-deep","Knee-deep","Waist-deep","Impassable"];
const DC=["var(--road)","var(--d1)","var(--d2)","var(--d3)","var(--d4)"];
let veh="tricycle",from=10,to=2,sel=null,mode="resident",rep={};
const len=i=>Math.hypot(N[E[i][0]][0]-N[E[i][1]][0],N[E[i][0]][1]-N[E[i][1]][1]);
const conf=r=>r.trusted||r.c>=2;
function cost(i,ignore){const e=E[i];if(e[3]&&!e[3].includes(veh))return Infinity;const b=len(i)/100/V[veh][1];if(ignore||!rep[i])return b;
let p=V[veh][2][rep[i].d];if(!conf(rep[i])){p=isFinite(p)?p:3;p*=1.3}return b*p}
function route(ignore){const n=N.length,dist=Array(n).fill(Infinity),prev=Array(n).fill(null),done=[];dist[from]=0;
for(;;){let u=-1;for(let k=0;k<n;k++)if(!done[k]&&dist[k]<Infinity&&(u<0||dist[k]<dist[u]))u=k;if(u<0)break;done[u]=1;
E.forEach((e,i)=>{if(e[0]!==u&&e[1]!==u)return;const v=e[0]===u?e[1]:e[0],c=cost(i,ignore);if(dist[u]+c<dist[v]){dist[v]=dist[u]+c;prev[v]=[u,i]}})}
if(!isFinite(dist[to]))return null;const nodes=[to],edges=[];let x=to;while(x!==from){const[p,i]=prev[x];edges.unshift(i);nodes.unshift(p);x=p}
return{t:dist[to],nodes,edges}}
function drawMap(r0,r1){let s="";
E.forEach((e,i)=>{const a=N[e[0]],b=N[e[1]],rp=rep[i],col=rp?DC[rp.d]:"var(--road)",narrow=!!e[3],w=narrow?5:9;
s+=`<g class="seg" tabindex="0" role="button" aria-label="${e[2]}, ${rp?DN[rp.d]:"clear"}" onclick="pick(${i})" onkeydown="if(event.key==='Enter')pick(${i})">
<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="transparent" stroke-width="30"/>
<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="var(--casing)" stroke-width="${w+5}" stroke-linecap="round"/>
<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${narrow&&!rp?'stroke-dasharray="2 5"':""}${rp&&!conf(rp)?'stroke-dasharray="9 6"':""}/>
${sel===i?`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="var(--text)" stroke-opacity=".28" stroke-width="20" stroke-linecap="round" pointer-events="none"/>`:""}</g>`});
const pl=r=>r.nodes.map(k=>N[k][0]+","+N[k][1]).join(" ");
if(r0&&r1&&r0.edges.join()!==r1.edges.join())s+=`<polyline points="${pl(r0)}" fill="none" stroke="var(--ghost)" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round" pointer-events="none"/>`;
if(r1)s+=`<polyline points="${pl(r1)}" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" opacity=".35"/><polyline class="flow" points="${pl(r1)}" fill="none" stroke="var(--accent)" stroke-width="5" stroke-dasharray="12 12" stroke-linejoin="round" pointer-events="none"/>`;
N.forEach((n,k)=>{const st=k===from,en=k===to;s+=`<circle cx="${n[0]}" cy="${n[1]}" r="${st||en?9:5}" fill="${st?"var(--accent)":en?"var(--text)":"var(--panel)"}" stroke="${st||en?"var(--panel)":"var(--muted)"}" stroke-width="2.5" pointer-events="none"/>
<text x="${n[0]}" y="${n[1]-14}" text-anchor="middle" font-size="12.5" font-weight="${st||en?700:400}" fill="var(--text)" stroke="var(--bg)" stroke-width="4" paint-order="stroke" pointer-events="none">${n[2]}</text>`});
document.getElementById("map").innerHTML=s}
function groups(r){const out=[];r.edges.forEach(i=>{const nm=E[i][2];if(out[out.length-1]!==nm)out.push(nm)});return out}
function drawTrip(r0,r1){const opts=N.map((n,k)=>`<option value="${k}">${n[2]}</option>`).join("");
let h=`<h2>Trip</h2><div class="row" id="veh"></div><div class="grid2"><div><label for="f">From</label><select id="f" onchange="from=+this.value;render()">${opts}</select></div><div><label for="t">To</label><select id="t" onchange="to=+this.value;render()">${opts}</select></div></div>`;
if(from===to)h+=`<p class="muted">Pick two different places.</p>`;
else if(!r1)h+=`<div class="warn bad"><b>No passable route for ${V[veh][0].toLowerCase()}.</b> Every path is blocked or not allowed. Contact the BDRRMC for assistance.</div>`;
else{const m=r1.t*60;h+=`<p style="margin:12px 0 2px"><span class="big">${r1.t<1?"<1":Math.round(r1.t)}</span> <b>min</b> <span class="muted">${V[veh][0]}</span></p><div class="muted">via ${groups(r1).join(" → ")}</div>`;
if(r0&&r0.edges.join()!==r1.edges.join()){const bl=[...new Set(r0.edges.filter(i=>rep[i]).map(i=>E[i][2]+" ("+DN[rep[i].d].toLowerCase()+")"))];
h+=`<div class="warn"><b>Rerouted</b>, +${Math.max(0,Math.round(r1.t-r0.t))} min versus the usual route.${bl.length?` Avoiding ${bl.join(", ")}.`:""}</div>`}
const risky=[...new Set(r1.edges.filter(i=>rep[i]).map(i=>E[i][2]+": "+DN[rep[i].d].toLowerCase()+(conf(rep[i])?"":" (unconfirmed)")))];
if(risky.length)h+=`<div class="warn">Passable but flooded: ${risky.join("; ")}. Go slowly.</div>`}
document.getElementById("trip").innerHTML=h;
document.getElementById("f").value=from;document.getElementById("t").value=to;
document.getElementById("veh").innerHTML=Object.keys(V).map(k=>`<button aria-pressed="${k===veh}" onclick="veh='${k}';render()">${V[k][0]}</button>`).join("")}
function drawSeg(){const el=document.getElementById("seg");
if(sel===null){el.innerHTML=`<h2>Report a flooded road</h2><p class="muted" style="margin:0">Select any road on the map to set its flood depth.</p>`;return}
const e=E[sel],r=rep[sel];
el.innerHTML=`<h2>${e[2]}</h2><div class="muted">${N[e[0]][2]} to ${N[e[1]][2]}${e[3]?" · narrow, "+e[3].join("/")+" only":""}</div>
<p style="margin:8px 0"><b>${r?DN[r.d]:"No flood reported"}</b>${r?` <span class="muted">${r.trusted?"verified by official":r.c>=2?"confirmed by "+r.c+" residents":r.c+" of 2 confirmations"}</span>`:""}</p>
<div class="row">${DN.map((n,d)=>`<button class="dz" aria-pressed="${r?r.d===d:d===0}" onclick="report(${d})">${n}</button>`).join("")}</div>
${r&&!conf(r)?`<div class="row" style="margin-top:8px"><button class="dz" onclick="rep[${sel}].c++;render()">I see it too (+1)</button></div>`:""}`}
function report(d){if(d===0){delete rep[sel]}else{const r=rep[sel];if(r&&r.d===d&&mode==="resident")r.c++;else rep[sel]={d,c:1,trusted:mode==="official"}}sysMsg(E[sel][2]+" ("+N[E[sel][0]][2]+" to "+N[E[sel][1]][2]+"): "+(d?DN[d].toLowerCase():"cleared")+", reported by "+(mode==="official"?"official":"resident"));render()}
function pick(i){sel=i;render()}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const tm=()=>new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
let msgs=[{w:"Barangay tanod",role:"official",x:"Sample message: Mag-ingat po sa Riverside Rd kapag malakas ang ulan.",t:"06:10"}],ch="chat",tix=[],tn=1001;
const ADV=[{w:"CDRRMO (sample)",x:"Sample advisory: Monitor PAGASA bulletins. Prepare go-bags and know your nearest evacuation center.",t:"05:30"},{w:"CDRRMO (sample)",x:"Sample advisory: Avoid crossing flooded roads. Turn around, don’t drown.",t:"05:45"}];
function sysMsg(x){msgs.push({w:"Daang Ligtas",sys:1,x,t:tm()})}
function drawMsg(){document.getElementById("tabs").innerHTML=[["chat","Barangay chat"],["adv","CDRRMO advisories"]].map(c=>`<button aria-pressed="${ch===c[0]}" onclick="ch='${c[0]}';drawMsg()">${c[1]}</button>`).join("");
const L=ch==="chat"?msgs:ADV,el=document.getElementById("msgs");el.innerHTML=L.map(m=>`<div class="m ${m.sys?"sys":""}"><b>${esc(m.w)}</b>${m.role==="official"?' <span class="tag">official</span>':""} <span class="muted">${m.t}</span><div>${esc(m.x)}</div></div>`).join("");el.scrollTop=el.scrollHeight;document.getElementById("cin").style.display=ch==="chat"?"flex":"none"}
function send(){const i=document.getElementById("mi"),v=i.value.trim();if(!v)return;msgs.push({w:mode==="official"?"Barangay official":"You (resident)",role:mode,x:v,t:tm()});i.value="";drawMsg()}
const gv=id=>document.getElementById(id).value.trim();
function fillLoc(){if(sel===null)return;const e=E[sel];document.getElementById("rl").value=e[2]+" ("+N[e[0]][2]+" to "+N[e[1]][2]+")";const r=rep[sel];if(r&&!gv("rd"))document.getElementById("rd").value="Road is "+DN[r.d].toLowerCase()+"."}
function buildText(id){const fl=[...new Set(Object.keys(rep).map(i=>E[i][2]+" ("+DN[rep[i].d].toLowerCase()+")"))];
return ["DAANG LIGTAS REPORT "+id,"Type: "+gv("rt"),"Location: "+gv("rl")+", Batangas City","People affected: "+(gv("rn")||"unknown"),"Details: "+(gv("rd")||"none"),fl.length?"Flooded roads on map: "+fl.join(", "):"","Reporter: "+(gv("rm")||"unnamed")+" "+gv("rp"),"Time: "+new Date().toLocaleString()].filter(Boolean).join("\n")}
function submitRep(){if(!gv("rl")){document.getElementById("tickets").insertAdjacentHTML("afterbegin","");alert("Add where it happened first.");return}
const id="DL-"+tn++,tx=buildText(id);tix.unshift({id,tx,t:tm(),type:gv("rt")});sysMsg("Report "+id+" logged for CDRRMO: "+gv("rt")+" at "+gv("rl"));drawRep();drawMsg()}
function copyRep(){const tx=buildText("DRAFT"),ta=document.createElement("textarea");ta.value=tx;ta.setAttribute("readonly","");ta.style.cssText="position:fixed;opacity:0";document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand("copy")}catch(e){}ta.remove();
document.getElementById("tickets").innerHTML=`<div class="tk">${ok?"Copied. Paste it into SMS or Messenger.":"Copy blocked here. Select the text below:"}<pre style="white-space:pre-wrap;margin:6px 0 0;font:inherit">${esc(tx)}</pre></div>`+tixHtml()}
function tixHtml(){return tix.map(t=>`<div class="tk"><b>${t.id}</b> · ${esc(t.type)} · ${t.t}<div class="muted">Status: logged on this device. This demo does not transmit it. Call the CDRRMO or send the copied text.</div></div>`).join("")}
function drawRep(){document.getElementById("tickets").innerHTML=tixHtml()}
function drawModes(){document.getElementById("modes").innerHTML=[["resident","Resident"],["official","Barangay official"]].map(m=>`<button aria-pressed="${mode===m[0]}" onclick="mode='${m[0]}';render()">${m[1]}</button>`).join("")}
function scenario(){rep={};[[8,2,2],[9,3,1],[10,4,1],[11,2,0],[15,2,1]].forEach(([i,d,t])=>rep[i]={d,c:t?1:1,trusted:!!t});rep[8].c=2;rep[8].trusted=false;rep[11].trusted=false;rep[11].c=1;rep[15].trusted=false;rep[15].c=1;
from=10;to=2;render()}
function resetAll(){rep={};sel=null;render()}
function render(){const r1=from===to?null:route(false),r0=from===to?null:route(true);drawMap(r0,r1);drawTrip(r0,r1);drawSeg();drawModes();drawMsg()}
render();