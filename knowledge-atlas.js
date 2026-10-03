/* Landscape knowledge exploration. Read-only local model; no simulated publication. */
(function () {
  'use strict';
  const data=window.LandspireKnowledgeAtlas;
  if(!data)return;
  const previous=renderKnowledge;
  const ui={view:'project',project:'P-CD',version:'',scheme:'',type:'',goal:'',space:'',status:'',q:'',record:'C13',focus:'W-C13',inspect:'W-C13',panel:'logic',specialty:'水景',zoom:1,page:0};
  const eligible=()=>state.currentRole==='superadmin'&&hasPermission('records','read')&&hasPermission('knowledge','read');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button=(label,action,extra='',cls='ka-btn')=>`<button class="${cls}" data-ka="${action}" ${extra}>${label}</button>`;
  const tag=v=>`<span class="ka-tag">${esc(v)}</span>`;
  const badge=v=>`<span class="ka-status">${esc(v)}</span>`;
  const rec=()=>data.records.find(r=>r.id===ui.record);
  const unique=a=>[...new Set(a)].filter(Boolean);
  const nodes=()=>ui.view==='industry'?data.industryNodes:data.nodes;
  const links=()=>ui.view==='industry'?data.industryEdges:data.edges;
  const getNode=id=>nodes().find(n=>n.id===id);
  const palette={项目:['#e9ecf6','#66769d'],方案版本:['#eef0f7','#7b85a3'],设计方案:['#eef0f7','#7b85a3'],空间:['#f8efd9','#a58a4c'],水景设计:['#315f4b','#315f4b'],方案记录:['#f1f2ef','#78857b'],水景类型:['#e2efed','#4c8e86'],水景组成:['#dcece4','#56896d'],关联设施:['#e8ede1','#879865'],设计目标:['#e9eef9','#6c8daf'],场地问题:['#f6e8dd','#bc936f'],评审反馈:['#f1e9f3','#a483aa'],资料依据:['#f0efeb','#939183'],运行模式:['#e7edf9','#7696bc']};
  function matches(r){return (!ui.project||r.projectId===ui.project)&&(!ui.version||r.version===ui.version)&&(!ui.scheme||r.scheme===ui.scheme)&&(!ui.type||r.types.includes(ui.type))&&(!ui.goal||r.goals.includes(ui.goal))&&(!ui.space||r.spaceType===ui.space)&&(!ui.status||r.feedback.includes(ui.status))&&(!ui.q||JSON.stringify([r.space,r.project,r.version,r.scheme,r.types,r.goals,r.strategy,r.problem,r.feedback]).toLowerCase().includes(ui.q.toLowerCase()));}
  const filtered=()=>data.records.filter(matches);
  const countType=t=>data.records.filter(r=>r.types.includes(t)).length;
  function resetFilters(){Object.assign(ui,{version:'',scheme:'',type:'',goal:'',space:'',status:'',q:''});}
  function selectRecord(id){const r=data.records.find(r=>r.id===id);if(!r)return;Object.assign(ui,{record:id,focus:r.node,inspect:r.node,page:0,zoom:1});}
  function keepSelection(){const a=filtered();if(!a.some(r=>r.id===ui.record)){if(a.length)selectRecord(a[0].id);else ui.record=null;}}
  function renderTree(){
    const leaf=(label,action,value,count,active)=>button(`<span>${esc(label)}</span>${count!==undefined?`<small>${count}</small>`:''}`,action,`data-value="${esc(value)}" aria-pressed="${!!active}"`,`ka-leaf ${active?'active':''}`);
    return `<aside class="ka-tree"><div class="ka-tree-head"><span>行业知识树</span><small>5 个方向</small></div><p class="ka-hint">统一概念浏览 · 项目原名保留</p>
      <details open><summary><i>01</i>项目与方案</summary>${leaf('全部项目','project','',data.records.length,!ui.project)}${data.projects.map(p=>leaf(p.name,'project',p.id,data.records.filter(r=>r.projectId===p.id).length,ui.project===p.id)).join('')}</details>
      <details><summary><i>02</i>空间组织</summary>${['主入口空间','次入口空间','中庭空间','内街空间','下沉广场','积极界面','屋顶平台','节点空间'].map(t=>leaf(t,'space',t,data.records.filter(r=>r.spaceType===t).length,ui.space===t)).join('')}<p class="ka-hint">下沉广场为本轮补充空间类型；项目名不扩充为行业类别。</p></details>
      <details open><summary><i>03</i>设计专项</summary>${leaf('水景','specialty','水景',data.records.filter(r=>r.hasWater).length,ui.specialty==='水景')}
      <div class="ka-water-tree">${data.taxonomy.map(([group,items])=>`<details ${group==='静水'||ui.type&&items.includes(ui.type)?'open':''}><summary>${group}</summary>${items.map(t=>leaf(t,'type',t,countType(t),ui.type===t)).join('')}</details>`).join('')}</div>
      ${['铺装','植物','灯光','材料','景观小品'].map(t=>leaf(t+' · 待建立','specialty',t,0,ui.specialty===t)).join('')}</details>
      <details><summary><i>04</i>场地问题与设计目标</summary><p class="ka-hint">目标表示设计意图，尚非建成效果。</p>${unique(data.records.flatMap(r=>r.goals)).map(t=>leaf(t,'goal',t,undefined,ui.goal===t)).join('')}</details>
      <details><summary><i>05</i>反馈与设计决策</summary>${['认可','不满意','取消','未讨论','未过会'].map(t=>leaf(t,'status',t,undefined,ui.status===t)).join('')}<p class="ka-hint">按反馈原意检索，不将局部认可等同于方案通过。</p></details>
      <div class="ka-tree-foot">成本与维护保留为选填属性<br>数字为方案空间记录数，非物理水体数量</div></aside>`;
  }
  function filters(){
    const options=(label,values,current)=>`<option value="">${label}</option>${unique(values).map(v=>`<option ${v===current?'selected':''} value="${esc(v)}">${esc(v)}</option>`).join('')}`;
    const all=data.records.filter(r=>!ui.project||r.projectId===ui.project);
    return `<div class="ka-filters"><label class="ka-search"><span>⌕</span><input id="ka-search" type="search" value="${esc(ui.q)}" placeholder="查找空间、做法、需求或反馈" aria-label="搜索项目知识"></label><select id="ka-project" aria-label="项目">${options('全部项目',data.projects.map(p=>p.id),ui.project).replace(/>P-CD</g,'>成都万家湾<').replace(/>P-SZ</g,'>深圳观城<').replace(/>P-HF</g,'>合肥万象城<')}</select><select id="ka-version" aria-label="版本">${options('全部版本',all.map(r=>r.version),ui.version)}</select><select id="ka-scheme" aria-label="方案">${options('全部方案',all.filter(r=>!ui.version||r.version===ui.version).map(r=>r.scheme),ui.scheme)}</select>${button('重置','reset','','ka-text-btn')}</div>${[ui.type,ui.goal,ui.space,ui.status].some(Boolean)?`<div class="ka-active-filters">当前筛选 ${[ui.type,ui.goal,ui.space,ui.status].filter(Boolean).map(tag).join('')}${button('清除条件','clear-facets','','ka-text-btn')}</div>`:''}`;
  }
  function recordStrip(){const list=filtered();return `<div class="ka-record-strip"><div><b>${list.length}</b> 条方案空间记录 <small>含无水景与既有水体</small></div><label>查看对象<select id="ka-record" aria-label="选择方案空间记录">${list.map(r=>`<option value="${r.id}" ${r.id===ui.record?'selected':''}>${esc(r.id+' · '+r.space+' / '+r.version+' / '+r.scheme+(r.hasWater?'':' · 无水景'))}</option>`).join('')}</select></label></div>`;}
  function graph(){
    const center=getNode(ui.focus)||nodes()[0];
    const allLinks=links().filter(e=>e.from===center.id||e.to===center.id);
    const adjacent=unique(allLinks.map(e=>e.from===center.id?e.to:e.from));
    const pageCount=Math.max(1,Math.ceil(adjacent.length/10));ui.page=Math.min(ui.page,pageCount-1);
    const ids=adjacent.slice(ui.page*10,ui.page*10+10);const pts=new Map([[center.id,{x:440,y:280}]]);
    ids.forEach((id,i)=>{const angle=-Math.PI/2+i*2*Math.PI/Math.max(ids.length,1);pts.set(id,{x:440+320*Math.cos(angle),y:280+211*Math.sin(angle)});});
    const shown=[center,...ids.map(getNode).filter(Boolean)];
    const wrap=(s,size=10,max=3)=>{const chars=Array.from(s);const lines=[];for(let i=0;i<chars.length&&lines.length<max;i+=size)lines.push(chars.slice(i,i+size).join(''));if(chars.length>size*max)lines[max-1]=lines[max-1].slice(0,-1)+'…';return lines;};
    const edgeMarkup=links().filter(e=>pts.has(e.from)&&pts.has(e.to)).map(e=>{const a=pts.get(e.from),b=pts.get(e.to),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;const fromR=e.from===center.id?62:34,toR=e.to===center.id?66:39;const sx=a.x+dx/len*fromR,sy=a.y+dy/len*fromR,tx=b.x-dx/len*toR,ty=b.y-dy/len*toR;const mx=(sx+tx)/2,my=(sy+ty)/2;return `<g class="ka-edge"><path d="M${sx},${sy} L${tx},${ty}" marker-end="url(#ka-arrow)"/><rect x="${mx-e.label.length*5.4-5}" y="${my-10}" width="${e.label.length*10.8+10}" height="20" rx="6"/><text x="${mx}" y="${my+4}">${esc(e.label)}</text></g>`;}).join('');
    const nodeMarkup=shown.map(n=>{const p=pts.get(n.id),main=n.id===center.id,c=palette[n.type]||palette.资料依据,lines=wrap(n.label,main?9:12,main?3:2);return `<g transform="translate(${p.x},${p.y})" class="ka-node ${main?'main':''} ${ui.inspect===n.id?'selected':''}" role="button" tabindex="0" data-ka="node" data-value="${esc(n.id)}" aria-label="查看${esc(n.label)}，${n.type}"><title>${esc(n.type+'：'+n.label)}</title><circle r="${main?65:34}" fill="${main?'#315f4b':c[0]}" stroke="${c[1]}"/><text class="ka-node-icon" y="${main?-30:6}" fill="${main?'#c9dfd0':c[1]}">${main?'✳':({空间:'⌖',项目:'▦',资料依据:'▤',评审反馈:'↗',水景类型:'≈',水景组成:'≈',运行模式:'◷',设计目标:'◎',场地问题:'!'})[n.type]||'◈'}</text>${main?lines.map((l,i)=>`<text class="ka-node-label central" y="${i*18-4}">${esc(l)}</text>`).join(''):lines.map((l,i)=>`<text class="ka-node-label" y="${52+i*17}">${esc(l)}</text>`).join('')}<text class="ka-node-kind" y="${main?49:86}">${esc(n.type)}</text></g>`;}).join('');
    return `<section class="ka-graph-panel"><header><div><span class="ka-eyebrow">${ui.view==='industry'?'通用结构 · 模型层':'项目关系 · 实例层'}</span><h2>${esc(center.label)}</h2></div><div class="ka-graph-controls">${button('−','zoom-out','aria-label="缩小图谱"')}${button(Math.round(ui.zoom*100)+'%','fit','aria-label="复位图谱"')}${button('+','zoom-in','aria-label="放大图谱"')}${button('⛶','full','aria-label="全屏图谱"')}</div></header><div class="ka-graph-canvas"><svg viewBox="0 0 880 590" aria-label="知识关系图谱" role="group"><defs><marker id="ka-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#adbcb2"/></marker></defs><g transform="translate(${440*(1-ui.zoom)},${280*(1-ui.zoom)}) scale(${ui.zoom})">${edgeMarkup}${nodeMarkup}</g></svg><div class="ka-graph-caption">点选节点查看详情 · 在详情中展开关联</div></div><footer><div class="ka-legend">${['水景设计','空间','水景组成','设计目标','评审反馈','资料依据'].map(t=>`<span><i style="background:${palette[t][1]}"></i>${t}</span>`).join('')}</div>${pageCount>1?`<div class="ka-pages">${button('←','prev','aria-label="上一组关系"')} ${ui.page+1} / ${pageCount} ${button('→','next','aria-label="下一组关系"')}</div>`:`<small>${adjacent.length} 个直接关联</small>`}</footer></section>`;
  }
  function relatedList(n){const e=links().filter(e=>e.from===n.id||e.to===n.id);return `<div class="ka-relations">${e.map(l=>{const outgoing=l.from===n.id,other=getNode(outgoing?l.to:l.from);return other?button(`<small>${outgoing?'→':'←'} ${esc(l.label)}</small><span>${esc(other.label)}</span>`,'node',`data-value="${esc(other.id)}"`,'ka-relation'):'';}).join('')||'<p>暂无已登记关系。</p>'}</div>`;}
  function detail(){
    const n=getNode(ui.inspect)||getNode(ui.focus);if(!n)return '';
    const r=data.records.find(r=>r.id===n.record)||rec();
    const block=(title,text)=>text?`<section class="ka-detail-block"><h4>${title}</h4><p>${esc(text)}</p></section>`:'';
    let content='';
    if(ui.view==='industry')content=`${block('定义范围','这里描述对象类别与允许建立的关系。项目实例须填写具体对象、属性值与来源。')}${relatedList(n)}${block('属性定义','属性在右侧及模型定义页展示，无需将每个数值都画成节点。')}`;
    else if(ui.panel==='logic')content=n.id===r?.node?`${r.image?`<img class="ka-evidence-image" src="${r.image}" alt="${esc(r.project+' '+r.space+'效果图')}"><small class="ka-image-note">方案效果图 · 不代表建成效果</small>`:''}${block('01 · 场地问题',r.problem||'本次尚未补充具体问题。')}${block('02 · 设计回应',r.strategy||'已登记水景组成，设计原因尚待补充。')}${block('03 · 甲方反馈',r.feedback)}${block('04 · 待明确',r.uncertainty)}${r.goals.length?`<section class="ka-detail-block"><h4>设计目标</h4><div class="ka-tags">${r.goals.map(tag).join('')}</div><small>设计意图，尚非已验证效果</small></section>`:''}`:`${block(n.type,n.label)}${Object.entries(n.attrs).map(([k,v])=>block(k,v)).join('')}${relatedList(n)}`;
    else if(ui.panel==='attributes')content=`<dl class="ka-attributes">${Object.entries(n.attrs).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}${n.id===r?.node?`<dt>登记编号</dt><dd>${esc(r.sourceIds.join(' / '))}</dd><dt>统一空间类型</dt><dd>${esc(r.spaceType)}</dd><dt>模式切换</dt><dd>${esc(r.modeRule||'未明确')}</dd><dt>材质 / 尺寸</dt><dd class="ka-muted">待补 · 非当前必填</dd><dt>成本 / 维护</dt><dd class="ka-muted">待补 · 可选属性</dd>`:''}</dl>${relatedList(n)}`;
    else content=r?`${badge(r.amended?'登记＋后续口述整理':'登记底表')} ${block('登记来源',r.evidence.register)}${block(r.evidence.oralKind,r.evidence.oral||'暂无追加口述')}${block('来源边界',r.evidence.scope)}${r.pdf?`<a class="ka-source-link" href="${r.pdf}" target="_blank" rel="noopener">打开成都方案 PDF 第 31 页 ↗</a>`:''}<a class="ka-source-link" href="assets/knowledge-samples/register-r03.json" download>下载登记底表摘录 ↓</a>${block('说明','当前前端整理不会覆盖D盘Excel。后续口述修订保存在本版模型中，需在下一轮统一回写。')}`:block('模型依据','通用关系由本轮建模定义；关联实例各自保留登记来源。');
    return `<aside class="ka-detail"><div class="ka-detail-head"><span>${esc(n.type)}</span><h3>${esc(n.label)}</h3>${button('以此为中心展开 ↗','focus',`data-value="${esc(n.id)}"`,'ka-text-btn')}${ui.view==='project'&&r?button('返回当前水景','root','','ka-text-btn'):''}</div>${ui.view==='project'?`<nav class="ka-detail-tabs" aria-label="对象详情">${[['logic','设计逻辑'],['attributes','属性关系'],['source','来源依据']].map(([k,t])=>button(t,'panel',`data-value="${k}" aria-pressed="${ui.panel===k}"`,ui.panel===k?'active':'')).join('')}</nav>`:''}<div class="ka-detail-content">${content}</div></aside>`;
  }
  function modelPage(){return `<section class="ka-model"><div class="ka-model-intro"><span class="ka-eyebrow">知识模型 · 第一版范围</span><h2>一套结构，容纳不同项目的设计</h2><p>字段定义负责统一记录方式；实体关系负责连接项目、空间、设计对象和依据。具体项目名称与属性值在实例中填写。</p></div><div class="ka-model-columns"><section><h3>实体与关系</h3><p class="ka-hint">点击“行业关系”可查看网状结构。</p>${data.industryEdges.map(e=>`<div class="ka-schema-edge"><b>${esc(e.from.slice(6))}</b><span>${esc(e.label)} →</span><b>${esc(e.to.slice(6))}</b></div>`).join('')}</section><section><h3>水景对象字段</h3><p class="ka-hint">${data.schema.flatMap(x=>x[1]).length} 个预设字段；不要求每条记录填满。</p>${data.schema.map(([group,fields])=>`<details open class="ka-schema-fields"><summary>${group}</summary><div class="ka-tags">${fields.map(tag).join('')}</div></details>`).join('')}</section></div><section class="ka-model-reuse"><h3>沿用原 Excel 模板的内容</h3><div class="ka-tags">${data.templateReuse.map(tag).join('')}</div><p>模板用作字段与术语来源。水景系统、组成、流向和运行模式关系根据本次案例补充；模板中的示例值不直接作为项目事实。</p></section></section>`;}
  function placeholder(){const fields={铺装:['整体骨架','基本单元','组织方式','拼接关系','色彩组织'],植物:['植物对象','空间作用','种植组织','生境条件','维护要求'],灯光:['照明对象','照明方式','时段控制','空间作用'],材料:['材料名称','使用部位','规格','表面处理','成本口径'],景观小品:['设施类型','使用功能','位置关系','材质','尺寸']};return `<section class="ka-placeholder"><span class="ka-placeholder-icon">＋</span><span class="ka-eyebrow">设计专项 / ${esc(ui.specialty)}</span><h2>${esc(ui.specialty)}，已预留</h2><p>尚未建立独立对象记录。水景中提及的植物、灯光等描述仍作为关联背景保留。</p><div class="ka-tags">${fields[ui.specialty].map(tag).join('')}</div><small>${ui.specialty==='铺装'?'字段来自此前铺装维度讨论，尚未填入项目样本。':'以上为建议字段，待开展该专项时核定。'}</small>${button('返回水景专项','specialty','data-value="水景"')}</section>`;}
  const empty=()=>`<section class="ka-placeholder"><span class="ka-placeholder-icon">⌕</span><h2>没有匹配的记录</h2><p>可以减少关键词，或清除空间、水景类型与反馈条件。</p>${button('清除全部筛选','reset')}</section>`;
  renderKnowledge=function(){
    if(!eligible())return previous();
    if(ui.view==='legacy')return `<div class="ka-legacy-back">${button('← 返回知识图谱','view','data-value="project"')}</div>`+previous();
    return `<div class="ka-app"><header class="ka-heading"><div><span class="ka-eyebrow">LANDSPIRE / KNOWLEDGE CENTER</span><h1>知识中心<span>水景先行</span></h1><p>看见设计之间的联系，回到每个判断的依据。</p></div><div class="ka-heading-meta">${badge('模型 V'+data.version+' · 本地预览')}<small>登记底表＋专业口述 · 来源逐项补齐中</small></div></header><div class="ka-topline"><nav class="ka-tabs" aria-label="知识视图">${[['project','项目知识图谱'],['industry','行业关系'],['model','模型定义']].map(([k,t])=>button(t,'view',`data-value="${k}" aria-pressed="${ui.view===k}"`,ui.view===k?'active':'')).join('')}</nav><div class="ka-top-actions">${button('图文样本 ↗','view','data-value="legacy"','ka-text-btn')}<a class="ka-text-btn" href="assets/knowledge-samples/knowledge-atlas-v03.json" download>导出模型 ↓</a></div></div><div class="ka-layout">${renderTree()}<main class="ka-main">${ui.specialty!=='水景'?placeholder():ui.view==='model'?modelPage():ui.view==='industry'?`<div class="ka-intro"><b>行业关系：定义什么可以和什么关联</b><p>例如“水景设计位于空间、响应问题、依据资料”。这些是通用结构，具体做法在项目图谱中查看。</p></div><div class="ka-graph-layout">${graph()}${detail()}</div>`:`${filters()}${filtered().length?`${recordStrip()}<div class="ka-context"><span>${esc(rec()?.project||'')}</span><i>/</i><span>${esc(rec()?.version||'')}</span><i>/</i><span>${esc(rec()?.scheme||'')}</span>${badge(rec()?.hasWater?'方案表达':'明确无水景')}</div><div class="ka-graph-layout">${graph()}${detail()}</div>`:empty()}`}</main></div><footer class="ka-page-note"><span>${data.sourceRecordCount} 条源登记 → ${data.records.length} 条方案空间记录；夏冬主题合并为运行模式，保留原编号。</span><span>本地浏览原型 · 尚未接入自动解析与后台发布</span></footer></div>`;
  };
  function refresh(focus){const element=document.getElementById(focus),pos=element?.selectionStart;render();if(focus){const next=document.getElementById(focus);next?.focus();if(next?.type==='search'&&pos!=null)next.setSelectionRange(pos,pos);}}
  document.addEventListener('click',e=>{const el=e.target.closest('[data-ka]');if(!el||!eligible()||state.page!=='knowledge')return;e.preventDefault();const a=el.dataset.ka,v=el.dataset.value;
    if(a==='view'){ui.view=v;ui.specialty='水景';ui.page=0;ui.zoom=1;if(v==='industry')ui.focus=ui.inspect='CLASS-水景设计';if(v==='project'){keepSelection();if(rec())ui.focus=ui.inspect=rec().node;}}
    if(['project','type','space','goal','status'].includes(a)){if(a==='project'){resetFilters();ui.project=v;}else{ui[a]=ui[a]===v?'':v;}ui.view='project';ui.specialty='水景';keepSelection();if(rec())ui.focus=ui.inspect=rec().node;}
    if(a==='specialty'){ui.specialty=v;if(v==='水景'){ui.view='project';keepSelection();if(rec())ui.focus=ui.inspect=rec().node;}}
    if(a==='reset'){resetFilters();ui.project='';keepSelection();}
    if(a==='clear-facets'){Object.assign(ui,{type:'',space:'',goal:'',status:''});keepSelection();}
    if(a==='node')ui.inspect=v;
    if(a==='focus'){ui.focus=ui.inspect=v;ui.page=0;ui.zoom=1;}
    if(a==='root'&&rec()){ui.focus=ui.inspect=rec().node;ui.page=0;}
    if(a==='panel')ui.panel=v;
    if(a==='prev')ui.page=Math.max(0,ui.page-1);
    if(a==='next')ui.page++;
    if(a==='zoom-in')ui.zoom=Math.min(1.8,ui.zoom+.2);
    if(a==='zoom-out')ui.zoom=Math.max(.6,ui.zoom-.2);
    if(a==='fit')ui.zoom=1;
    if(a==='full'){const panel=document.querySelector('.ka-graph-panel');if(document.fullscreenElement)document.exitFullscreen?.();else panel?.requestFullscreen?.().catch(()=>{});return;}
    refresh();
  });
  document.addEventListener('input',e=>{if(e.target.id!=='ka-search'||!eligible())return;ui.q=e.target.value;keepSelection();refresh('ka-search');});
  document.addEventListener('change',e=>{if(!eligible())return;const ids={'ka-project':'project','ka-version':'version','ka-scheme':'scheme'};if(e.target.id==='ka-record')selectRecord(e.target.value);else if(ids[e.target.id]){ui[ids[e.target.id]]=e.target.value;if(e.target.id==='ka-project'){ui.version='';ui.scheme='';}if(e.target.id==='ka-version')ui.scheme='';keepSelection();}else return;refresh(e.target.id);});
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('g[data-ka="node"]')){e.preventDefault();ui.inspect=e.target.dataset.value;refresh();document.querySelector(`g[data-ka="node"][data-value="${CSS.escape(ui.inspect)}"]`)?.focus();}});
  if(state.page==='knowledge'&&eligible())render();
})();
