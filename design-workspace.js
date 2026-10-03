/* Design conversations. Local prototype persistence; model output remains illustrative. */
(() => {
  'use strict';
  const schema = 1;
  const dimensions = [['preserve','默认保留内容'],['site','场地关系'],['view','视角'],['layout','总体布局'],['objects','调整对象']];
  const tabs = [['dimensions','修改维度'],['versions','修改版本'],['work','项目 / 任务'],['reports','报告']];
  const clone = value => JSON.parse(JSON.stringify(value));
  const id = () => crypto.randomUUID();
  const now = () => new Date().toISOString();
  const time = value => value ? new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}) : '—';
  const safe = value => esc(value ?? '');
  const fulltime = value => value ? new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}) : '—';
  const defaults = () => ({preserve:'保留原有建筑、主要道路与场地边界',site:'保持现有场地关系',view:'保持原有观察视角',layout:'保持总体布局',objects:''});
  const actor = () => accessUsers.find(u=>u.account.toLowerCase()===state.currentAccount)?.name || roleConfig[state.currentRole]?.name || '当前用户';
  const account = () => state.currentAccount || roleConfig[state.currentRole]?.account;
  const button = (text,action,attrs='',primary=false) => `<button class="dw-button ${primary?'primary':''}" data-dw="${action}" ${attrs}>${text}</button>`;
  const badge = (text,green=false) => `<span class="dw-badge ${green?'green':''}">${text}</span>`;
  const empty = (title,desc) => `<div class="dw-empty"><span>◇</span><b>${title}</b><p>${desc}</p></div>`;
  let db, owner, activeTab='dimensions', filter='', search='', storageOK=true, historyOpen=false, panelOpen=false, collapsed=false;
  let saveTimer, renderedConversationId;
  function makeConversation(projectId='') {
    return {id:id(),title:'新设计对话',projectId,createdAt:now(),updatedAt:now(),messages:[],draft:'',image:null,requirement:'',dimensions:defaults(),revision:0,confirmed:null,batch:null,selected:0,parentVersion:null,events:[]};
  }
  function load() {
    if(owner===account()&&db)return;
    owner=account(); db={schema,conversations:[],versions:[],artifacts:[],reports:[],projects:[],activeId:null};
    storageOK=true; activeTab='dimensions'; filter=''; search='';
    try {
      const saved=JSON.parse(localStorage.getItem(`landspire.design.v1.${owner}`)||'null');
      if(saved?.schema===schema&&['conversations','versions','artifacts','reports','projects'].every(k=>Array.isArray(saved[k])))db=saved;
    } catch {storageOK=false;}
    db.projects.forEach(p=>{if(!designerProjects.some(x=>x.id===p.id))designerProjects.push(p);});
    db.versions.forEach(v=>{const confirmation=window.landspireProjects?.confirmationFor(v.id);if(confirmation)v.confirmation=confirmation;});
    window.landspireProjects?.syncVersions(db.versions,owner);
    if(!visible().length){const c=makeConversation();db.conversations.push(c);db.activeId=c.id;}
    if(!visible().some(c=>c.id===db.activeId))db.activeId=visible()[0].id;
  }
  function visible() {return db.conversations.filter(c=>!c.projectId||accessibleProjects().some(p=>p.id===c.projectId));}
  function current() {load();return visible().find(c=>c.id===db.activeId)||visible()[0];}
  function persist() {
    clearTimeout(saveTimer);
    db.projects=designerProjects.filter(p=>p.created&&accessibleProjects().some(x=>x.id===p.id));
    try {localStorage.setItem(`landspire.design.v1.${owner}`,JSON.stringify(db));storageOK=true;} catch {storageOK=false;}
    if(storageOK)window.landspireProjects?.syncVersions(db.versions,owner);
    document.querySelectorAll('.dw-storage').forEach(el=>{el.textContent=storageOK?'已保存到此浏览器':'本地保存失败，请导出备份';el.classList.toggle('error',!storageOK);});
  }
  function event(c,type,detail) {c.events.push({id:id(),type,detail,by:actor(),at:now()});c.updatedAt=now();}
  function save(renderPage=true) {persist();if(renderPage)render();}
  function sync(c) {
    state.activeProjectId=c.projectId||null;state.sessionActive=!!c.messages.length;state.chatMessages=c.messages;
    state.sessionSelected=c.selected;state.sessionGenerated=!!c.batch;
    state.sessionPreserve=dimensions.filter(([key])=>key!=='objects').map(([,label])=>label);
    state.sessionAdjust=[c.dimensions.objects];
  }
  function newConversation(projectId='') {
    load(); if(projectId&&!accessibleProjects().some(p=>p.id===projectId)){toast('当前账号无权访问此项目');return;}
    const c=makeConversation(projectId);db.conversations.unshift(c);db.activeId=c.id;filter='';search='';activeTab='dimensions';historyOpen=false;
    state.libraryReference=null;state.page='assistant';event(c,'创建对话',projectId?'已关联项目':'暂未关联项目');save();
  }
  window.openDesignConversation=newConversation;
  window.landspireDesign={
    syncProjectVersions(){load();window.landspireProjects?.syncVersions(db.versions,owner);},
    openSource(versionId){load();const v=db.versions.find(x=>x.id===versionId);if(!v||!accessibleProjects().some(p=>p.id===v.projectId))return false;db.activeId=v.conversationId;state.page='assistant';closeModal();save();const message=(v.sourceMessageIds||[]).slice().reverse().find(mid=>document.getElementById('message-'+mid));document.getElementById('message-'+message)?.scrollIntoView({block:'center'});return true;},
    confirmVersion(versionId,confirmation){load();const v=db.versions.find(x=>x.id===versionId);if(v&&!v.confirmation){v.confirmation=clone(confirmation);persist();}},
    projectReports(projectId){load();return clone(db.reports.filter(r=>r.projectId===projectId));}
  };
  function projectName(projectId) {return designerProjects.find(p=>p.id===projectId)?.name||'未关联项目';}
  function projectOptions(selected,all=false) {
    const unlinked=all?`<option value="unlinked" ${selected==='unlinked'?'selected':''}>未关联项目</option>`:'';
    return `<option value="">${all?'全部项目':'暂不关联项目'}</option>${unlinked}${accessibleProjects().map(p=>`<option value="${safe(p.id)}" ${selected===p.id?'selected':''}>${safe(p.name)}</option>`).join('')}`;
  }
  function isConfirmed(c) {return c.confirmed?.revision===c.revision;}
  function changed(c) {c.revision++;c.confirmed=null;c.batch=null;c.updatedAt=now();}
  function history(c) {
    const items=visible().filter(x=>(!filter||(filter==='unlinked'?!x.projectId:x.projectId===filter))&&`${x.title} ${projectName(x.projectId)} ${x.messages.map(m=>m.text||'').join(' ')}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
    return `<aside class="dw-history ${historyOpen?'mobile-open':''}"><div class="dw-history-title"><b>设计对话</b><span>${visible().length}</span>${button('×','history-close','aria-label="关闭历史对话" class="dw-mobile-close"')}</div>${button('＋ 开启新对话','new','',true)}<label class="dw-search"><span>⌕</span><input id="dw-search" aria-label="搜索对话" placeholder="搜索对话、需求…" value="${safe(search)}"></label><select id="dw-filter" aria-label="按项目筛选对话">${projectOptions(filter,true)}</select><div class="dw-list-label">历史对话 <span>按最近更新</span></div><div class="dw-history-list">${items.length?items.map(x=>`<div class="dw-history-row ${x.id===c.id?'active':''}"><button class="dw-history-select" data-dw="switch" data-id="${x.id}" ${x.id===c.id?'aria-current="true"':''}><strong>${safe(x.title)}</strong><span>${safe(projectName(x.projectId))}</span><small>${time(x.updatedAt)}${x.demo?' · 演示':''}</small></button><button class="dw-rename" data-dw="rename" data-id="${x.id}" aria-label="重命名 ${safe(x.title)}">✎</button></div>`).join(''):empty('没有匹配对话','试试其他关键词或项目')}</div><div class="dw-history-footer"><span class="dw-storage ${storageOK?'':'error'}">${storageOK?'已保存到此浏览器':'本地保存失败，请导出备份'}</span>${button('导出工作记录 ↗','backup')}</div></aside>`;
  }
  function welcome() {
    return `<div class="dw-welcome"><div class="dw-kicker">LANDSPIRE / DESIGN STUDIO</div><div class="dw-orb">✳</div><h1>让每一步设计，<br>都有迹可循。</h1><p>从一个想法开始，梳理需求、探索方案。<br>把每次修改与确认，留在项目里。</p><div class="dw-suggestions">${[['01','优化场地布局','保持场地边界和主入口位置，调整中心绿地与休憩空间。'],['02','提升入口识别','保留总体布局，简化入口铺装，增加有识别度的景观节点。'],['03','完善夜间体验','保持现有道路，优化步行路径的灯光与导向。']].map(([n,title,prompt])=>`<button data-dw="suggest" data-text="${prompt}"><span>${n}</span><b>${title}</b><i>↗</i></button>`).join('')}</div><div class="dw-demo-link">想先了解完整流程？ ${button('载入演示对话 →','demo')}</div></div>`;
  }
  function messages(c) {
    return c.messages.map(m=>`<article class="dw-message ${m.role}" id="message-${m.id}"><div class="dw-message-avatar">${m.role==='user'?safe((m.by||actor()).slice(0,1)):m.role==='system'?'✓':'✳'}</div><div class="dw-message-content"><div class="dw-message-meta"><b>${m.role==='user'?safe(m.by):m.role==='system'?'工作记录':'Landspire'}</b><time>${time(m.at)}</time>${m.role==='assistant'?badge('模拟助手'):''}</div>${m.image?`<img class="dw-uploaded" src="${safe(m.image.url)}" alt="${safe(m.image.name)}">`:''}<div class="dw-message-text">${safe(m.text)}</div>${m.requirement?`<div class="dw-brief"><div><b>本轮需求摘要</b>${badge('需求记录')}</div><p>${safe(m.requirement)}</p><small>修改维度已整理到右侧，可编辑后确认。</small>${button('查看修改维度 ↗','tab','data-tab="dimensions"')}</div>`:''}${m.versionId?button('查看版本详情 →','version','data-id="'+m.versionId+'"'):''}</div></article>`).join('');
  }
  function candidates(c) {
    if(!c.batch)return '';
    return `<section class="dw-candidates"><div class="dw-section-title"><h3>本轮候选方案</h3>${badge('交互示意 · 非真实生成')}</div><p>修改重点：${safe(c.batch.dimensions.objects)} · 选择一个方向，保存草稿或版本。</p><div class="dw-candidate-grid">${c.batch.options.map((o,i)=>`<button class="dw-candidate ${c.selected===i?'selected':''}" data-dw="select" data-index="${i}" aria-pressed="${c.selected===i}"><img src="${safe(o.src)}" alt="${safe(o.title)}概念示意"><span><b>${String.fromCharCode(65+i)} · ${safe(o.title)}</b><i>${c.selected===i?'✓':'○'}</i></span><small>${safe(o.note)}</small></button>`).join('')}</div><div class="dw-actions">${button('保存修改版本','save-version','',true)}${button('存为草稿','save-draft')}${hasPermission('knowledge','create')?'<button class="dw-button" data-action="nominate-knowledge">提名知识候选</button>':''}</div></section>`;
  }
  function composer(c) {
    return `<div class="dw-composer-area">${state.libraryReference?`<div class="dw-reference">已引用知识：${safe(state.libraryReference.name)} <button data-action="remove-library-reference">移除</button></div>`:''}<div class="dw-composer">${c.image?`<div class="dw-attachment"><img src="${safe(c.image.url)}" alt="待发送场地图片"><span>${safe(c.image.name)}</span>${button('×','remove-image','aria-label="移除待发送图片"')}</div>`:''}<textarea id="dw-prompt" aria-label="设计需求" placeholder="描述你的设计想法，或补充本轮修改要求…" rows="2">${safe(c.draft)}</textarea><div class="dw-compose-tools">${button('＋ 场地图片','upload')}<input type="file" id="dw-upload" accept="image/png,image/jpeg,image/webp" hidden><span>Enter 发送 · Shift + Enter 换行</span><button class="dw-send" data-dw="send" aria-label="发送需求">↑</button></div></div><div class="dw-composer-note">本地原型 · 助手解析与出图为模拟，正式方案需专业确认</div></div>`;
  }
  function dimensionsPanel(c) {
    const confirmed=isConfirmed(c);
    return `<div class="dw-panel-heading"><div class="dw-section-title"><h3>本轮修改范围</h3>${badge(confirmed?'需求已确认':'待确认',confirmed)}</div><p>先明确保留什么，再决定调整什么。</p></div><label class="dw-field">需求摘要<textarea id="dw-requirement" placeholder="发送需求后在此整理，也可以直接填写">${safe(c.requirement)}</textarea></label><div class="dw-dimension-fields">${dimensions.map(([key,label],i)=>`<label class="dw-field"><span><i>${String(i+1).padStart(2,'0')}</i>${label}<small>${key==='objects'?'本轮重点':'约束条件'}</small></span><textarea data-dimension="${key}" rows="2" placeholder="${key==='objects'?'例如：简化铺装、增加休憩座椅':'请填写具体要求'}">${safe(c.dimensions[key])}</textarea></label>`).join('')}</div>${confirmed?`<div class="dw-confirmed">✓ ${safe(c.confirmed.by)} 已确认需求<small>${fulltime(c.confirmed.at)} · 修改后需重新确认</small></div>`:`<div class="dw-tip">确认仅针对修改要求；方案形成后，可单独确认设计成果。</div>`}<div class="dw-panel-actions">${button(confirmed?'已确认修改维度':'确认修改维度','confirm-dimensions',confirmed?'disabled':'',!confirmed)}${button('生成候选方向 →','generate',confirmed?'':'disabled',confirmed)}</div>`;
  }
  function versionsPanel(c) {
    const versions=db.versions.filter(v=>v.conversationId===c.id).sort((a,b)=>b.at.localeCompare(a.at));
    return `<div class="dw-panel-heading"><div class="dw-section-title"><h3>修改版本</h3>${badge(versions.length+' 个版本')}</div><p>保存每轮需求、修改范围与成果快照。</p></div>${button('＋ 保存当前版本','save-version',c.batch?'':'disabled',true)}${versions.length?`<div class="dw-timeline">${versions.map(v=>`<article class="dw-version-card"><div class="dw-section-title"><b>${safe(v.number)}</b>${badge(v.confirmation?'成果已确认':'成果待确认',!!v.confirmation)}</div><h4>${safe(v.title)}</h4><p>${safe(v.requirement)}</p><small>${time(v.at)} · ${safe(v.by)}</small><div class="dw-actions">${button('查看详情','version',`data-id="${v.id}"`)}${button('基于此版继续','continue',`data-id="${v.id}"`)}</div></article>`).join('')}</div>`:empty('还没有保存版本','确认维度、生成候选方向后，即可保存本轮版本。')}`;
  }
  function related(list,c) {return list.filter(x=>c.projectId?x.projectId===c.projectId:x.conversationId===c.id);}
  function workPanel(c) {
    const items=related(db.artifacts,c);
    return `<div class="dw-panel-heading"><div class="dw-section-title"><h3>项目工作台</h3>${badge(items.length+' 项成果')}</div><p>汇集当前项目各次对话中的草稿与方案。</p></div><div class="dw-project-card"><small>当前关联项目</small><b>${safe(projectName(c.projectId))}</b>${c.projectId?button('查看项目详情 ↗','project'):button('关联项目 →','associate')}</div><div class="dw-section-title"><h3>设计成果</h3>${c.batch?button('＋ 保存草稿','save-draft'):''}</div>${items.length?items.slice().reverse().map(a=>`<article class="dw-artifact"><img src="${safe(a.src)}" alt="${safe(a.title)}"><div><span>${a.versionId?'方案版本':'工作草稿'} · ${time(a.at)}</span><b>${safe(a.title)}</b><small>${safe(a.by)} · ${safe(a.number||'未形成版本')}</small>${button(a.versionId?'查看方案 →':'继续此草稿 →',a.versionId?'version':'draft',`data-id="${a.versionId||a.id}"`)}</div></article>`).join(''):empty('把探索保存下来','选中候选方向后保存草稿，或将其保存为正式修改版本。')}<div class="dw-section-title dw-task-heading"><h3>当前任务</h3>${button('＋ 添加','add-task')}</div><div class="dw-tasks">${(c.tasks||[]).length?(c.tasks||[]).map(t=>`<label><input type="checkbox" data-task="${t.id}" ${t.done?'checked':''}><span class="${t.done?'done':''}">${safe(t.title)}</span></label>`).join(''):'<p class="dw-muted">还没有任务，可添加需要跟进的设计事项。</p>'}</div>`;
  }
  function reportsPanel(c) {
    const reports=related(db.reports,c);
    return `<div class="dw-panel-heading"><div class="dw-section-title"><h3>报告与交付</h3>${badge(reports.length+' 份文档')}</div><p>从已保存版本整理报告，保留方案与需求来源。</p></div>${button('＋ 生成报告','new-report','',true)}${reports.length?reports.slice().reverse().map(r=>`<article class="dw-report"><div class="dw-doc-icon">▤</div><div><small>${safe(r.type)}</small><h4>${safe(r.title)}</h4><p>${safe(r.versionNumber)} · ${safe(r.by)} · ${time(r.at)}</p>${button('预览','report',`data-id="${r.id}"`)} ${button('导出 HTML ↗','export-report',`data-id="${r.id}"`)}</div></article>`).join(''):empty('让设计形成交付','选择一个已保存版本，生成阶段报告、最终设计方案或客户交付文档。')}`;
  }
  renderAssistant=function() {
    const c=current();sync(c);
    return `<div class="dw-workspace ${collapsed?'panel-collapsed':''}"><div class="dw-workspace-bar"><div><span class="dw-live-dot"></span><b>设计助手</b><span class="dw-bar-divider">/</span><span class="dw-bar-subtitle">把想法推进为可交付的设计</span></div><div>${button('历史对话','toggle-history','class="dw-mobile-toggle"')}${button(collapsed?'展开工作管理':'工作管理','toggle-panel')}${button('操作记录 ↗','audit')}</div></div><div class="dw-grid">${history(c)}<section class="dw-conversation"><header class="dw-conversation-head"><div><h2>${safe(c.title)}</h2><button data-dw="rename" data-id="${c.id}" aria-label="修改当前对话标题">✎</button>${c.demo?badge('演示对话'):''}</div><label><span>▦</span><select id="dw-project" aria-label="关联项目" ${db.versions.some(v=>v.conversationId===c.id)?'disabled title="已有正式版本，项目归属已固定；可新建对话关联其他项目"':''}>${projectOptions(c.projectId)}</select></label></header><div class="dw-thread" aria-label="设计对话内容">${c.messages.length?`<div class="dw-date-separator">${new Date(c.createdAt).toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai'})} · 设计记录</div>${messages(c)}${c.requirement?`<div class="dw-round-status">${badge(isConfirmed(c)?'需求已确认':'修改维度待确认',isConfirmed(c))}<span>${c.batch?'候选方案已就绪':isConfirmed(c)?'可生成候选方向':'在右侧确认后继续设计'}</span>${button(c.batch?'查看修改版本':isConfirmed(c)?'生成候选方向 →':'查看修改维度 →',c.batch?'tab':isConfirmed(c)?'generate':'tab',`data-tab="${c.batch?'versions':'dimensions'}"`)}</div>`:''}${candidates(c)}`:welcome()}</div>${composer(c)}</section><aside class="dw-management ${panelOpen?'mobile-open':''}" aria-label="工作管理"><div class="dw-management-title"><div><span>◫</span><b>工作管理</b></div>${button('收起','close-panel')}</div><div class="dw-tabs" role="tablist" aria-label="工作管理分类">${tabs.map(([key,label])=>`<button role="tab" id="dw-tab-${key}" aria-selected="${activeTab===key}" aria-controls="dw-panel" tabindex="${activeTab===key?0:-1}" data-dw="tab" data-tab="${key}" class="${activeTab===key?'active':''}">${label}</button>`).join('')}</div><div class="dw-panel" id="dw-panel" role="tabpanel" aria-labelledby="dw-tab-${activeTab}">${({dimensions:dimensionsPanel,versions:versionsPanel,work:workPanel,reports:reportsPanel})[activeTab](c)}</div><div class="dw-management-footer"><span>↳</span> 需求 · 修改 · 确认 · 成果，完整留存</div></aside></div></div>`;
  };
  const previousRender=render;
  render=function() {
    const previousScroll=document.querySelector('.dw-thread')?.scrollTop||0;
    document.body.classList.toggle('design-workspace-page',state.page==='assistant'&&!!state.currentRole);
    previousRender();
    if(state.page==='assistant'){
      const actions=document.querySelector('.dw-panel-actions');
      if(actions)document.querySelector('.dw-panel')?.after(actions);
      const thread=document.querySelector('.dw-thread');
      if(thread&&renderedConversationId===db?.activeId)thread.scrollTop=previousScroll;
      renderedConversationId=db?.activeId;
    }else{
      renderedConversationId=null;
    }
  };
  const previousProjectDetail=renderProjectDetail;
  renderProjectDetail=function(){
    load();
    const html=previousProjectDetail(),projectId=state.activeProjectId||'H001';
    const versions=db.versions.filter(v=>v.projectId===projectId),reports=db.reports.filter(r=>r.projectId===projectId);
    if(!versions.length&&!reports.length)return html;
    return html+`<section class="dw-project-deliverables"><div class="dw-section-title"><h3>设计助手工作成果</h3>${badge(versions.length+' 个版本 · '+reports.length+' 份报告',true)}</div><p class="dw-muted">来自当前账号的项目设计记录，可回到原始对话继续工作。</p><div class="dw-project-output-grid">${versions.map(v=>`<article class="dw-version-card"><div class="dw-section-title"><b>${safe(v.number)}</b>${badge(v.confirmation?'成果已确认':'成果待确认',!!v.confirmation)}</div><h4>${safe(v.title)}</h4><p>${safe(v.note)}</p><small>${safe(v.by)} · ${time(v.at)}</small><div class="dw-actions">${button('查看详情','version',`data-id="${v.id}"`)}${button('继续设计','continue',`data-id="${v.id}"`)}</div></article>`).join('')}${reports.map(r=>`<article class="dw-version-card"><div class="dw-section-title"><b>▤ ${safe(r.type)}</b>${badge(safe(r.versionNumber))}</div><h4>${safe(r.title)}</h4><small>${safe(r.by)} · ${time(r.at)}</small><div class="dw-actions">${button('预览报告','report',`data-id="${r.id}"`)}${button('导出 HTML','export-report',`data-id="${r.id}"`)}</div></article>`).join('')}</div></section>`;
  };
  function closeModal() {document.getElementById('modal-root').innerHTML='';}
  function showModal(title,body,actions='') {
    modal(title,body,actions||button('关闭','close'));
    const backdrop=document.querySelector('.modal-backdrop');
    backdrop.removeAttribute('data-action');
    backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal();});
    document.querySelector('.modal')?.classList.add('dw-modal');
    document.querySelectorAll('.dw-modal .dw-field').forEach(label=>{
      const control=label.querySelector('input,textarea,select');
      if(control)control.setAttribute('aria-label',Array.from(label.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim());
    });
    setTimeout(()=>document.querySelector('.dw-modal input,.dw-modal select,.dw-modal button')?.focus(),0);
  }
  function scrollEnd() {requestAnimationFrame(()=>{const thread=document.querySelector('.dw-thread');if(thread)thread.scrollTop=thread.scrollHeight;});}
  function send(c) {
    const text=c.draft.trim();if(!text&&!c.image){toast('请先输入设计需求或添加场地图片');return;}
    const m={id:id(),role:'user',text:text||'请分析上传的场地图片，并整理设计需求。',image:c.image,at:now(),by:actor()};
    c.messages.push(m);c.image=null;c.draft='';
    if(c.title==='新设计对话')c.title=m.text.slice(0,22);
    c.requirement=m.text;
    const objects=[[/铺装|地面|地坪/,'铺装'],[/入口|识别/,'入口景观节点'],[/植物|绿化|绿地/,'植物与绿地'],[/灯光|照明|夜间/,'灯光与导向'],[/座椅|休憩/,'休憩空间'],[/水景|水池/,'水景（待评估）']].filter(([pattern])=>pattern.test(text)).map(([,label])=>label);
    c.dimensions.objects=objects.length?objects.join('、'):c.dimensions.objects;
    changed(c);
    c.messages.push({id:id(),role:'assistant',at:now(),text:'我已记录本轮需求，并整理了需要确认的修改范围。请检查右侧各项约束，尤其是保留内容与调整对象；确认后，我们再继续探索候选方案。',requirement:c.requirement});
    event(c,'提出需求',m.text);activeTab='dimensions';save();scrollEnd();
  }
  function generate(c) {
    if(!isConfirmed(c)){toast('请先确认本轮修改维度');activeTab='dimensions';render();return;}
    if(!c.messages.length){
      c.messages.push({id:id(),role:'system',at:now(),text:'已根据工作管理中确认的需求开始设计：'+c.requirement});
      if(c.title==='新设计对话')c.title=c.requirement.slice(0,22);
    }
    c.batch={id:id(),revision:c.revision,at:now(),requirement:c.requirement,dimensions:clone(c.dimensions),options:[
      {title:'克制与秩序',src:'assets/candidate-a.svg',note:'减少元素变化，突出清晰的空间关系。'},
      {title:'节点与体验',src:'assets/candidate-b.svg',note:'集中塑造重点节点，增强到达体验。'},
      {title:'氛围与引导',src:'assets/candidate-c.svg',note:'通过层次与导向，补充场地识别。'}]};
    c.selected=0;event(c,'生成候选方向','生成 3 个交互示意候选；非真实模型输出');save();scrollEnd();
  }
  function saveVersion(c) {
    if(!c.projectId){toast('保存正式版本前，请先关联项目');showAssociation(c);return;}
    if(!hasPermission('projects','update')){toast('当前角色没有保存项目版本的权限');return;}
    if(!c.batch||!isConfirmed(c)||c.batch.revision!==c.revision){toast('请先确认当前需求并生成候选方向');return;}
    const existing=db.versions.find(v=>v.batchId===c.batch.id&&v.selected===c.selected);
    if(existing){versionDetail(existing.id);toast('此候选已保存，打开已有版本');return;}
    showModal('保存修改版本',`<div class="dw-modal-note">将同时保存本轮需求、修改维度、选中成果与确认记录。</div><label class="dw-field">版本名称<input id="dw-version-title" maxlength="80" value="${safe(c.title+' · '+c.batch.options[c.selected].title)}"></label><label class="dw-field">本轮修改说明<textarea id="dw-version-note" placeholder="简要说明本轮做了什么调整">${safe(c.dimensions.objects)}</textarea></label><p class="dw-muted">项目：${safe(projectName(c.projectId))} · 需求确认人：${safe(c.confirmed.by)}</p>`,button('取消','close')+button('保存版本','commit-version','',true));
  }
  function commitVersion(c) {
    const title=document.getElementById('dw-version-title').value.trim(),note=document.getElementById('dw-version-note').value.trim();
    if(!title||!note){toast('请填写版本名称和修改说明');return;}
    if(!c.projectId||!isConfirmed(c)||!c.batch||!hasPermission('projects','update'))return;
    const number='V'+(Math.max(c.projectId==='H001'?2:0,window.landspireProjects?.maxSequence(c.projectId)||0,...db.versions.filter(v=>v.projectId===c.projectId).map(v=>v.sequence))+1);
    const v={id:id(),number,sequence:Number(number.slice(1)),title,note,conversationId:c.id,projectId:c.projectId,projectName:projectName(c.projectId),requirement:c.requirement,dimensions:clone(c.dimensions),requirementConfirmation:clone(c.confirmed),by:actor(),at:now(),parentVersion:c.parentVersion,batchId:c.batch.id,selected:c.selected,output:clone(c.batch.options[c.selected]),sourceMessageIds:c.messages.map(m=>m.id),tasks:clone(c.tasks||[]),confirmation:null};
    db.versions.push(v);db.artifacts.push({id:id(),title,number,versionId:v.id,conversationId:c.id,projectId:c.projectId,by:v.by,at:v.at,src:v.output.src});
    c.parentVersion=v.id;c.messages.push({id:id(),role:'system',text:`已保存 ${number}「${title}」。需求与修改范围已归档，设计成果待确认。`,versionId:v.id,at:now()});
    event(c,'保存版本',`${number} · ${title} · ${note}`);closeModal();activeTab='versions';save();toast(`${number} 已保存`);scrollEnd();
  }
  function versionDetail(versionId) {
    const v=db.versions.find(x=>x.id===versionId);if(!v)return;
    const parent=db.versions.find(x=>x.id===v.parentVersion);
    showModal(`${v.number} · ${safe(v.title)}`,`<div class="dw-detail-top">${badge(v.confirmation?'成果已确认':'成果待确认',!!v.confirmation)}<span>${safe(v.projectName)} · ${fulltime(v.at)}</span></div><img class="dw-detail-image" src="${safe(v.output.src)}" alt="${safe(v.output.title)}"><p class="dw-muted">交互示意图 · ${safe(v.output.title)}</p><h4>当时提出了什么需求</h4><p class="dw-pre">${safe(v.requirement)}</p><h4>本轮做了哪些修改</h4><p class="dw-pre">${safe(v.note)}</p><dl class="dw-snapshot">${dimensions.map(([k,label])=>`<div><dt>${label}</dt><dd>${safe(v.dimensions[k])}</dd></div>`).join('')}</dl>${parent?`<details><summary>与 ${safe(parent.number)} 的修改范围对比</summary><div class="dw-diff">${dimensions.filter(([k])=>v.dimensions[k]!==parent.dimensions[k]).map(([k,label])=>`<p><b>${label}</b><del>${safe(parent.dimensions[k])}</del><ins>${safe(v.dimensions[k])}</ins></p>`).join('')||'<p>修改维度保持一致，调整了需求说明或候选方案。</p>'}</div></details>`:''}<div class="dw-audit-summary"><p>修改与保存：${safe(v.by)} · ${fulltime(v.at)}</p><p>需求确认：${safe(v.requirementConfirmation.by)} · ${fulltime(v.requirementConfirmation.at)}</p><p>成果确认：${v.confirmation?safe(v.confirmation.by)+' · '+fulltime(v.confirmation.at):'尚未确认'}</p><p>来源：${safe(db.conversations.find(x=>x.id===v.conversationId)?.title)}${parent?' · 基于 '+safe(parent.number):''}</p></div>`,button('定位原始对话','source',`data-id="${v.id}"`)+button('基于此版继续','continue',`data-id="${v.id}"`)+(v.confirmation||!hasPermission('projects','review')?'':button('确认设计成果','confirm-output',`data-id="${v.id}"`,true)));
  }
  function showAssociation(c) {showModal('关联项目',`<label class="dw-field">选择项目<select id="dw-association">${projectOptions(c.projectId)}</select></label><p class="dw-muted">一个对话关联一个项目；项目下可包含多次设计对话。</p>`,button('取消','close')+button('确认关联','associate-save','',true));}
  function associate(c,value) {
    if(db.versions.some(v=>v.conversationId===c.id)){toast('已有正式版本，请新建对话关联其他项目');return;}
    if(value&&!accessibleProjects().some(p=>p.id===value)){toast('项目不可访问');return;}
    c.projectId=value;db.artifacts.filter(a=>a.conversationId===c.id&&!a.versionId).forEach(a=>a.projectId=value);
    event(c,'关联项目',projectName(value));closeModal();save();
  }
  function draft(c) {
    if(!c.batch){toast('请先生成候选方向');return;}
    if(db.artifacts.some(a=>!a.versionId&&a.batch?.id===c.batch.id&&a.selected===c.selected)){toast('这个候选已保存为草稿');activeTab='work';render();return;}
    const option=c.batch.options[c.selected];db.artifacts.push({id:id(),title:c.title+' · '+option.title,conversationId:c.id,projectId:c.projectId,at:now(),by:actor(),src:option.src,requirement:c.requirement,dimensions:clone(c.dimensions),batch:clone(c.batch),selected:c.selected});
    event(c,'保存草稿',option.title);activeTab='work';save();toast('草稿已保存');
  }
  function reportBody(r) {
    const v=r.snapshot;
    return `<div class="dw-report-preview"><div class="dw-kicker">LANDSPIRE / DESIGN REPORT</div><h2>${safe(r.title)}</h2><p>${safe(r.type)} · ${safe(v.projectName)} · ${safe(v.number)}</p><hr><h3>01 / 设计需求</h3><p class="dw-pre">${safe(v.requirement)}</p><h3>02 / 修改范围与说明</h3><p class="dw-pre">${safe(v.note)}</p><dl class="dw-snapshot">${dimensions.map(([k,label])=>`<div><dt>${label}</dt><dd>${safe(v.dimensions[k])}</dd></div>`).join('')}</dl><h3>03 / 设计成果</h3><img src="${safe(v.output.src)}" alt="${safe(v.output.title)}"><p>${safe(v.output.title)} · 交互示意，非真实生成效果图</p><h3>04 / 确认与版本信息</h3><p>版本形成：${safe(v.by)} · ${fulltime(v.at)}</p><p>需求确认：${safe(v.requirementConfirmation.by)} · ${fulltime(v.requirementConfirmation.at)}</p><p>成果确认：${v.confirmation?safe(v.confirmation.by)+' · '+fulltime(v.confirmation.at):'待确认'}</p><h3>05 / 后续事项</h3><p class="dw-pre">${safe(r.notes||'正式交付前需核验设计效果、规范要求与工程条件。')}</p><hr><small>报告整理：${safe(r.by)} · ${fulltime(r.at)} · ${safe(v.number)} 的生成时快照</small></div>`;
  }
  function download(content,name,type) {
    const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name.replace(/[<>:"/\\|?*]/g,'_');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function exportReport(r) {
    let content=reportBody(r);
    try {
      const response=await fetch(r.snapshot.output.src);if(!response.ok)throw new Error();
      const blob=await response.blob();const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
      content=content.replace(safe(r.snapshot.output.src),data);
    } catch {toast('图片未能嵌入报告，请通过本地预览地址打开后重试');return;}
    download(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>${safe(r.title)}</title><style>body{max-width:880px;margin:50px auto;padding:0 28px;font:15px/1.8 system-ui;color:#283e33}img{max-width:100%}h2{font-size:28px}h3{margin-top:32px;color:#315f4b}hr{border:0;border-top:1px solid #dde5de}dl>div{display:flex;border-bottom:1px solid #e6eae6;padding:10px}dt{width:130px;flex-shrink:0}dd{margin:0}.dw-pre{white-space:pre-wrap}@media print{body{margin:0}h3{break-after:avoid}img{max-height:360px}}</style>${content}</html>`,r.title+'.html','text/html;charset=utf-8');
    toast('已导出可独立打开和打印的 HTML 报告');
  }
  const handlers={
    new:()=>newConversation(),
    switch:(c,b)=>{db.activeId=b.dataset.id;historyOpen=false;save();},
    rename:(c,b)=>{const target=db.conversations.find(x=>x.id===b.dataset.id);showModal('修改对话标题',`<label class="dw-field">对话标题<input id="dw-title" maxlength="60" value="${safe(target.title)}"></label>`,button('取消','close')+button('保存标题','rename-save',`data-id="${target.id}"`,true));},
    'rename-save':(c,b)=>{const title=document.getElementById('dw-title').value.trim();if(!title){toast('标题不能为空');return;}const target=db.conversations.find(x=>x.id===b.dataset.id);event(target,'修改对话标题',`${target.title} → ${title}`);target.title=title;closeModal();save();},
    tab:(c,b)=>{activeTab=b.dataset.tab;panelOpen=true;collapsed=false;render();},
    'toggle-history':()=>{historyOpen=!historyOpen;panelOpen=false;render();},
    'history-close':()=>{historyOpen=false;render();},
    'toggle-panel':()=>{if(matchMedia('(max-width: 1050px)').matches){panelOpen=!panelOpen;historyOpen=false;}else collapsed=!collapsed;render();},
    'close-panel':()=>{panelOpen=false;collapsed=true;render();},
    suggest:(c,b)=>{c.draft=b.dataset.text;save();document.getElementById('dw-prompt')?.focus();},
    send,
    upload:()=>document.getElementById('dw-upload').click(),
    'remove-image':c=>{c.image=null;save();},
    'confirm-dimensions':c=>{if(!c.requirement.trim()||!c.dimensions.objects.trim()){toast('请填写需求摘要和调整对象');return;}c.confirmed={revision:c.revision,by:actor(),at:now()};event(c,'确认修改需求','需求：'+c.requirement+'\n'+dimensions.map(([key,label])=>label+'：'+c.dimensions[key]).join('\n'));save();toast('修改需求已确认，可生成候选方向');},
    generate,
    select:(c,b)=>{c.selected=Number(b.dataset.index);save();scrollEnd();},
    'save-version':saveVersion,
    'commit-version':commitVersion,
    version:(c,b)=>versionDetail(b.dataset.id),
    'confirm-output':(c,b)=>{const v=db.versions.find(x=>x.id===b.dataset.id);if(v.confirmation)return;if(!hasPermission('projects','review')){toast('请由项目经理或超级管理员确认项目成果');return;}v.confirmation={by:actor(),at:now()};event(db.conversations.find(x=>x.id===v.conversationId),'确认设计成果',v.number+' · '+v.title);persist();render();versionDetail(v.id);},
    continue:(c,b)=>{const v=db.versions.find(x=>x.id===b.dataset.id);newConversation(v.projectId);const n=current();n.title=v.title+' · 继续设计';n.parentVersion=v.id;n.requirement=v.requirement;n.dimensions=clone(v.dimensions);n.messages.push({id:id(),role:'system',text:`基于 ${v.number}「${v.title}」继续设计，已沿用修改范围。请提出新需求并重新确认维度。`,at:now(),versionId:v.id});event(n,'继续历史版本',v.number);closeModal();save();},
    source:(c,b)=>{const v=db.versions.find(x=>x.id===b.dataset.id);db.activeId=v.conversationId;state.page='assistant';closeModal();save();const message=v.sourceMessageIds.slice().reverse().find(mid=>document.getElementById('message-'+mid));document.getElementById('message-'+message)?.scrollIntoView({block:'center'});},
    associate:showAssociation,
    'associate-save':c=>associate(c,document.getElementById('dw-association').value),
    project:c=>{state.activeProjectId=c.projectId;state.page='project-detail';render();},
    'save-draft':draft,
    draft:(c,b)=>{const a=db.artifacts.find(x=>x.id===b.dataset.id);db.activeId=a.conversationId;const n=current();n.requirement=a.requirement;n.dimensions=clone(a.dimensions);changed(n);n.messages.push({id:id(),role:'system',at:now(),text:`已载入草稿「${a.title}」的需求与修改范围，请重新确认后继续探索。`});event(n,'继续草稿',a.title);activeTab='dimensions';save();},
    'add-task':()=>showModal('添加设计任务','<label class="dw-field">任务内容<input id="dw-task-title" maxlength="120" placeholder="例如：补充座椅数量与布置要求"></label>',button('取消','close')+button('添加任务','task-save','',true)),
    'task-save':c=>{const title=document.getElementById('dw-task-title').value.trim();if(!title){toast('请填写任务内容');return;}(c.tasks||=[]).push({id:id(),title,done:false,by:actor(),at:now()});event(c,'添加任务',title);closeModal();save();},
    'new-report':c=>{const versions=related(db.versions,c);if(!versions.length){toast('请先关联项目并保存一个修改版本');return;}showModal('生成报告',`<label class="dw-field">报告类型<select id="dw-report-type"><option>阶段报告</option><option>最终设计方案</option><option>客户交付文档</option></select></label><label class="dw-field">关联版本<select id="dw-report-version">${versions.slice().reverse().map(v=>`<option value="${v.id}">${safe(v.number+' · '+v.title)}${v.confirmation?' · 成果已确认':' · 成果待确认'}</option>`).join('')}</select></label><label class="dw-field">后续事项与说明<textarea id="dw-report-notes" placeholder="填写待跟进事项、交付说明等"></textarea></label><p class="dw-muted">最终方案和客户交付文档需选择已确认成果的版本。</p>`,button('取消','close')+button('生成报告','report-save','',true));},
    'report-save':c=>{const v=db.versions.find(x=>x.id===document.getElementById('dw-report-version').value),type=document.getElementById('dw-report-type').value;if(type!=='阶段报告'&&!v.confirmation){toast('请先在版本详情中确认设计成果');return;}const r={id:id(),title:v.projectName+' · '+v.number+' · '+type,type,versionId:v.id,versionNumber:v.number,projectId:v.projectId,conversationId:v.conversationId,snapshot:clone(v),notes:document.getElementById('dw-report-notes').value.trim(),by:actor(),at:now()};db.reports.push(r);event(db.conversations.find(x=>x.id===v.conversationId),'生成报告',r.title);closeModal();activeTab='reports';save();toast('报告已生成，可预览或导出');},
    report:(c,b)=>{const r=db.reports.find(x=>x.id===b.dataset.id);showModal(safe(r.type),reportBody(r),button('关闭','close')+button('导出 HTML','export-report',`data-id="${r.id}"`,true));},
    'export-report':(c,b)=>exportReport(db.reports.find(x=>x.id===b.dataset.id)),
    backup:()=>download(JSON.stringify(db,null,2),'Landspire-工作记录-'+new Date().toISOString().slice(0,10)+'.json','application/json'),
    audit:c=>showModal('对话操作记录',`<p class="dw-muted">${safe(c.title)} · ${safe(projectName(c.projectId))}</p>${c.events.length?`<ol class="dw-audit-list">${c.events.slice().reverse().map(e=>`<li><b>${safe(e.type)}</b><small>${safe(e.by)} · ${fulltime(e.at)}</small><p>${safe(e.detail)}</p></li>`).join('')}</ol>`:empty('尚无操作记录','提出需求后，系统会自动记录关键操作。')}`),
    close:closeModal,
    demo:()=>{newConversation(accessibleProjects().some(p=>p.id==='H001')?'H001':'');const c=current();c.demo=true;c.draft='保留场地关系、鸟瞰视角和总体布局，简化主入口铺装，增加休憩座椅，提升入口识别度。';send(c);c.title='主入口景观优化 · 演示';c.tasks=[{id:id(),title:'核对座椅布置与通行净宽',done:false,at:now(),by:actor()}];save();}
  };
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-dw]');if(!b||!state.currentRole||b.disabled)return;
    e.preventDefault();e.stopPropagation();const c=current();handlers[b.dataset.dw]?.(c,b);
  });
  document.addEventListener('input',e=>{
    if(!state.currentRole)return;const el=e.target;
    if(el.id==='dw-search'){search=el.value;const pos=el.selectionStart;render();const input=document.getElementById('dw-search');input.focus();input.setSelectionRange(pos,pos);return;}
    if(el.id==='dw-prompt'){current().draft=el.value;clearTimeout(saveTimer);saveTimer=setTimeout(persist,250);return;}
    if(el.id==='dw-requirement'||el.dataset.dimension){const c=current();if(el.id==='dw-requirement')c.requirement=el.value;else c.dimensions[el.dataset.dimension]=el.value;changed(c);clearTimeout(saveTimer);saveTimer=setTimeout(persist,250);
      document.querySelectorAll('[data-dw="generate"]').forEach(b=>b.disabled=true);
      const confirm=document.querySelector('[data-dw="confirm-dimensions"]');if(confirm){confirm.disabled=false;confirm.textContent='确认修改维度';confirm.classList.add('primary');}
      document.querySelector('.dw-confirmed')?.remove();document.querySelector('.dw-candidates')?.remove();
      const status=document.querySelector('.dw-panel-heading .dw-badge');if(status){status.textContent='待确认';status.classList.remove('green');}
      const round=document.querySelector('.dw-round-status');if(round)round.innerHTML=badge('修改维度待确认')+'<span>修改后需重新确认需求</span>';
    }
  });
  document.addEventListener('change',e=>{
    if(!state.currentRole)return;const el=e.target,c=current();
    if(el.id==='dw-filter'){filter=el.value;render();}
    if(el.id==='dw-project')associate(c,el.value);
    if(el.dataset.dimension||el.id==='dw-requirement'){event(c,'编辑修改维度',el.dataset.dimension?dimensions.find(([key])=>key===el.dataset.dimension)[1]+'：'+el.value:'需求摘要：'+el.value);save(false);}
    if(el.dataset.task){const task=c.tasks.find(t=>t.id===el.dataset.task);task.done=el.checked;task.updatedAt=now();task.updatedBy=actor();event(c,task.done?'完成任务':'重新打开任务',task.title);save();}
    if(el.id==='dw-upload'){
      const file=el.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)){toast('请选择 PNG、JPG 或 WebP 图片');return;}if(file.size>2*1024*1024){toast('本地原型请上传 2 MB 以内的图片');return;}
      const reader=new FileReader();reader.onload=()=>{c.image={name:file.name,url:reader.result};event(c,'添加场地图片',file.name);save();};reader.onerror=()=>toast('图片读取失败，请重试');reader.readAsDataURL(file);
    }
  });
  document.addEventListener('keydown',e=>{
    if(e.target.id==='dw-prompt'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&e.keyCode!==229){e.preventDefault();send(current());}
    if(e.key==='Escape'){closeModal();historyOpen=false;panelOpen=false;if(state.page==='assistant')render();}
    if(e.target.matches('.dw-tabs [role="tab"]')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
      e.preventDefault();const index=tabs.findIndex(([key])=>key===activeTab);activeTab=tabs[e.key==='Home'?0:e.key==='End'?3:(index+(e.key==='ArrowRight'?1:3))%4][0];render();document.getElementById('dw-tab-'+activeTab).focus();
    }
  });
  window.addEventListener('pagehide',()=>{if(db&&owner)persist();});
})();

