// Designer-facing project workspace, project archive, and knowledge library.
state.activeProjectId = null;
state.libraryReference = null;

function renderDesignerDashboard(){
  const visibleProjects=typeof accessibleProjects==='function'?accessibleProjects():designerProjects;
  const candidates=records.filter(r=>r.kind==='candidate'&&r.ownerId==='designer');
  const todos=[
    {title:'补充 V1 → V2 甲方会议纪要原件',project:'华润合肥万象城 · 主入口',wait:4,status:'待补资料'},
    {title:'归档手绘 / 手版方案',project:'华润合肥万象城 · 方案资料',wait:2,status:'待整理'},
    {title:'补充成本判断依据',project:'华润合肥万象城 · 铺装与水景',wait:1,status:'待评估'}
  ].sort((a,b)=>b.wait-a.wait);
  return `${heading('MY PROJECTS','我的项目','查看你参与的项目、项目版本与个人工作进度')}
  <section class="designer-greeting"><span class="eyebrow">PROJECT WORKSPACE</span><h2>${roleConfig[state.currentRole]?.name||'项目'}，欢迎回来</h2><p>当前数据范围内有 ${visibleProjects.length} 个项目，今天有 ${state.currentRole==='designer'?todos.length:0} 项待办。</p><span class="prototype-note">项目示例位已标注 · 项目数据按角色范围过滤</span></section>
  <section class="designer-section designer-projects-section"><div class="designer-section-head"><div><h2>可访问的项目</h2><p>仅显示当前角色数据范围内的项目；项目操作仍按角色权限控制。</p></div><div class="project-section-actions"><span class="pill gray">${visibleProjects.length} 个项目</span>${hasPermission('projects','create')?'<button class="btn btn-primary btn-sm" data-action="new-project">＋ 新建项目</button>':''}</div></div><div class="project-home-grid">${visibleProjects.map(p=>p.placeholder?`<button class="project-home-card project-home-placeholder" data-page="project-detail" data-project-id="${esc(p.id)}"><div class="project-placeholder-cover"><span>项目资料待补</span><i>＋</i></div><div class="project-home-copy"><div class="project-home-top"><span class="project-code">${esc(p.id)} · ${p.created?'新建项目':'示例占位'}</span><span class="pill gray">资料待补</span></div><h3>${esc(p.name)}</h3><p>${esc(p.subtitle)}</p><div class="project-home-bottom"><span>${esc(p.description)}</span><b>查看项目 →</b></div></div></button>`:`<button class="project-home-card" data-page="project-detail" data-project-id="${esc(p.id)}"><img src="${esc(p.cover)}" alt="${esc(p.name)} 主入口 V2 概念效果图"><div class="project-home-copy"><div class="project-home-top"><span class="project-code">${esc(p.id)} · ${esc(p.projectType)}</span><span class="pill green">可访问项目</span></div><h3>${esc(p.name)}</h3><p>${esc(p.subtitle)}</p><div class="project-home-bottom"><span>${esc(p.description)}</span><b>查看项目与版本 →</b></div></div></button>`).join('')}</div></section>
  <section class="designer-section designer-secondary-section"><div class="designer-section-head"><div><h2>个人工作摘要</h2><p>待办与知识提名保留在工作台，作为项目列表之外的次要信息。</p></div></div><div class="designer-home-grid"><section class="card designer-panel"><div class="card-head"><div><h3>我的待办</h3><small>按等待时长排序</small></div><span class="pill amber">${todos.length} 项</span></div><div class="designer-todo-list">${todos.map((t,i)=>`<button class="designer-todo" data-page="project-detail" data-project-id="H001"><span class="todo-rank">${String(i+1).padStart(2,'0')}</span><span class="todo-copy"><b>${esc(t.title)}</b><small>${esc(t.project)}</small></span><span class="todo-status">${t.status}</span><span class="todo-wait">等待 ${t.wait} 天　→</span></button>`).join('')}</div></section>
  <section class="card designer-panel nomination-summary"><div class="card-head"><div><h3>我的知识提名</h3><small>只有明确提名的成果会进入知识审核</small></div><button class="btn btn-ghost btn-sm" data-page="my-nominations">查看全部 →</button></div><div class="nomination-count"><strong>${candidates.filter(r=>r.state==='待审核').length}</strong><span>项待审核</span><strong>${candidates.filter(r=>r.state==='已发布').length}</strong><span>项已发布</span></div><div class="notice">个人生成的图留在个人工作记录中；提名后，审核员才会在知识管理后台看到。</div></section></div></section>`;
}

function renderProjectDetail(){
  const currentProject=designerProjects.find(p=>p.id===state.activeProjectId)||designerProjects[0];
  if(currentProject.placeholder)return `${heading(`PROJECT · ${esc(currentProject.id)}`,esc(currentProject.name),currentProject.created?'新建项目 · 项目资料尚待补录':'示例占位项目 · 项目资料尚待补录',`${btn('← 返回我的项目','projects','btn btn-sm')} ${btn('在此项目中开始设计','open-project-assistant','btn btn-primary btn-sm','data-project-id="'+esc(currentProject.id)+'"')}`)}<div class="project-placeholder-detail"><div class="project-placeholder-cover project-placeholder-cover-large"><span>${currentProject.created?'项目封面待补':'示例占位 · 封面待补'}</span><i>＋</i></div><div><span class="pill amber">${currentProject.created?'新建项目 · 资料待补':'示例占位 · 非真实项目资料'}</span><h2>${esc(currentProject.name)}</h2><p>项目名称、场地照片、项目阶段和版本资料待补录。选择“在此项目中开始设计”后，设计助手会将本次会话关联到该项目。</p></div></div><div class="empty-inline">项目资料尚未接入，因此暂时没有可展示的历史方案、会议反馈或版本时间线。</div>`;
  const projectCandidates=records.filter(r=>r.kind==='candidate'&&r.projectId==='H001');
  const versionCards=versions.map((v,index)=>`<article class="project-version-card"><div class="project-version-head"><div><span class="project-version-date">${v.date}</span><h3>${v.name}</h3><p>${index===0?'主入口方案基线':'根据甲方反馈形成的方案调整'}</p></div>${pill(index===0?'历史方案':'历史方案 · 反馈修订',index===0?'gray':'green')}</div><div class="project-media-grid">${v.images.map((im,i)=>`<button class="project-media-thumb" data-action="preview-project-image" data-src="assets/${im}" data-title="${v.name} · ${index===0?'效果图':'方案效果图'} ${i+1}"><img src="assets/${im}" alt="${v.name} 方案效果图 ${i+1}"><span>效果图 ${i+1}</span></button>`).join('')}</div><div class="project-version-caption">${index===0?'铺装形式较细碎，作为版本一设计基线。':'简化铺装表达，将入口体验重点转向水景节点。水景维护与成本仍需结合工程条件评估。'}</div></article>`);
  const feedbackCard=`<article class="client-feedback-card"><div class="feedback-marker">甲方反馈</div><div class="feedback-card-main"><div class="feedback-card-meta"><b>由 V1 反馈推动的方案调整</b><span>会议日期待补录</span></div><p>甲方认为 V1 铺装表达较细碎、成本较高，不希望预算过多集中在铺装上；希望降低铺装投入，把设计重点转向提升入口识别和体验的节点，水景是会上提出的可探索方向。</p><div class="feedback-resolution"><span>V1</span><i>→</i><span>简化铺装</span><i>+</i><span>强化入口水景</span><i>→</i><span>V2</span></div><small>版本关系依据设计师提供的项目说明整理；会议纪要原件与具体日期待归档。</small></div></article>`;
  return `${heading('PROJECT · H001','华润合肥万象城','商业景观升级改扩建 · 主入口空间',`${btn('← 返回我的项目','projects','btn btn-sm')} ${btn('基于本项目开始设计','open-project-assistant','btn btn-primary btn-sm')}`)}
  <div class="project-detail-meta"><span>项目编号 H001</span><span>主入口空间</span><span>我参与的项目</span><span>历史方案 2 版</span></div>
  <section class="project-history"><div class="project-history-title"><div><h2>方案版本与反馈</h2><p>每一版都关联对应的设计资料与调整原因。</p></div><span class="pill gray">项目正式版本</span></div>
   <div class="version-story">${versionCards[0]}${feedbackCard}${versionCards[1]}</div>
  </section>
  <div class="project-detail-columns"><section class="card project-materials"><div class="card-head"><div><h3>项目方案资料</h3><small>效果图与设计过程资料</small></div><span class="pill gray">按版本归档</span></div><div class="project-material-row"><span class="material-symbol">▧</span><div><b>效果图</b><small>V1、V2 概念效果图已接入</small></div><span class="pill green">4 张</span></div><div class="project-material-row"><span class="material-symbol">✎</span><div><b>手绘 / 手版方案</b><small>项目资料中暂未找到原始文件，接入后可按版本查看</small></div><span class="pill amber">待补资料</span></div><div class="project-material-row"><span class="material-symbol">▤</span><div><b>甲方会议纪要</b><small>已记录反馈摘要，纪要原件尚待归档</small></div><span class="pill amber">待补原件</span></div></section>
  <section class="card project-materials"><div class="card-head"><div><h3>本项目提名的知识</h3><small>提名后由超级管理员统一处理</small></div><button class="btn btn-ghost btn-sm" data-page="my-nominations">我的提名 →</button></div>${projectCandidates.length?projectCandidates.map(r=>`<div class="project-material-row"><span class="material-symbol">◇</span><div><b>${esc(r.name)}</b><small>${esc(r.date)} · ${esc(r.status)}</small></div>${pill(r.state,r.state==='已发布'?'green':'amber')}</div>`).join(''):`<div class="empty-inline">尚无设计师提名的知识候选。个人生成成果不会自动进入知识审核。</div>`}</section></div>
  <div class="notice project-privacy-note">项目空间保存已确认的正式方案和项目资料。设计师个人会话中的生成候选保持个人归属；只有主动提交项目版本或提名知识，才进入对应的项目版本链或审核队列。</div>`;
}

function renderMyNominations(){
  const items=records.filter(r=>r.kind==='candidate'&&r.ownerId==='designer').sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  return `${heading('MY KNOWLEDGE SUBMISSIONS','我的知识提名','跟踪你主动提交的经验候选；审核通过不代表自动发布',btn('去设计助手提名成果','assistant','btn btn-primary btn-sm'))}<div class="nomination-guidance"><b>只有你明确提名的成果会进入知识管理后台。</b><span>未提名的生成图片保留在个人工作记录中，不进入审核队列。</span></div>${items.length?`<div class="nomination-list">${items.map(r=>`<article class="card nomination-item"><div class="nomination-item-top"><div><span class="project-code">${esc(r.id)}</span><h3>${esc(r.name)}</h3></div>${pill(r.state,r.state==='已发布'?'green':r.state==='已退回'?'amber':'purple')}</div><div class="nomination-item-meta"><span>来源：${esc(r.source)}</span><span>提交日期：${esc(r.date)}</span><span>复用范围：${esc(r.permission)}</span></div><p>${esc(r.summary||'暂无摘要')}</p>${r.boundary?`<small>适用边界：${esc(r.boundary)}</small>`:''}${r.reviewNote?`<div class="notice">审核意见：${esc(r.reviewNote)}</div>`:`<div class="small-label">审核意见将在超级管理员处理后显示。</div>`}</article>`).join('')}</div>`:`<div class="card nomination-empty"><div class="empty-icon">◇</div><h3>还没有提名知识成果</h3><p>在设计助手中完成探索后，可主动提交值得复用的策略、案例或设计经验。</p>${btn('返回设计助手','assistant','btn btn-primary btn-sm')}</div>`}`;
}

function renderCompanyLibrary(){
  const q=(state.search||'').trim().toLowerCase();
  const items=records.filter(r=>r.state==='已发布'&&r.auth===true&&r.level!=='项目私有'&&(!q||`${r.name} ${r.type} ${r.source} ${r.spaceType||''} ${r.designObject||''} ${(r.tags||[]).join(' ')}`.toLowerCase().includes(q)));
  const modes=['scene','specialty'];
  const categories={scene:[['全部场景','all'],['主入口','主入口空间'],['中庭','中庭空间'],['商业街区','街区空间'],['屋顶空间','屋顶花园']],specialty:[['全部专项','all'],['水景','水景设计'],['铺装','铺装设计'],['植物','植物配置'],['灯光','灯光设计'],['景观小品','景观小品与设施']]};
  const shelf=(key,title,eyebrow,description,icon)=>{
    const config=state.libraryBrowse?.[key]||{mode:'scene',category:'all'};
    const mode=config.mode==='specialty'?'specialty':'scene';
    const modeLabel=mode==='scene'?'空间场景':'设计专项';
    const values=categories[mode];
    const sourceItems=items.filter(r=>key==='company'
      ? /公司内部案例|项目案例|company|internal/i.test(`${r.contentSource||''} ${r.sourceType||''} ${r.type||''}`)
      : /灵感|外部公开案例|参考图|inspiration|external/i.test(`${r.contentSource||''} ${r.sourceType||''} ${r.type||''}`));
    const categoryItems=sourceItems.filter(r=>config.category==='all'||(mode==='scene'?`${r.spaceType||''} ${r.spaceGroup||''} ${(r.tags||[]).join(' ')}`:`${r.designObject||''} ${r.elementType||''} ${(r.tags||[]).join(' ')}`).includes(config.category));
    return `<section class="library-shelf"><div class="library-shelf-head"><div class="library-shelf-title"><span class="library-shelf-icon">${icon}</span><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2><p>${description}</p></div></div><span class="library-shelf-count">${categoryItems.length} 条已发布</span></div><div class="library-browse-row"><div class="library-mode-switch" role="group" aria-label="浏览方式"><button class="${mode==='scene'?'active':''}" data-action="library-mode" data-shelf="${key}" data-mode="scene">按空间场景</button><button class="${mode==='specialty'?'active':''}" data-action="library-mode" data-shelf="${key}" data-mode="specialty">按设计专项</button></div><div class="library-category-list">${values.map(([label,value])=>`<button class="library-category ${config.category===value?'active':''}" data-action="library-category" data-shelf="${key}" data-category="${value}">${label}</button>`).join('')}</div></div>${categoryItems.length?`<div class="library-records">${categoryItems.map(r=>`<article class="library-record"><div class="library-record-main"><div class="library-record-icon">▤</div><div><span class="project-code">${esc(r.type)} · ${esc(r.id)}</span><h3>${esc(r.name)}</h3><p>来源：${esc(r.source)}</p><div class="evidence-tags">${pill(r.level,'green')}${pill(r.permission,'gray')}${pill(r.status,'green')}</div></div></div><button class="btn btn-sm" data-action="use-library-reference" data-id="${esc(r.id)}">用于本次设计参考 →</button></article>`).join('')}</div>`:`<div class="library-empty-grid"><div class="library-empty-cell"><span class="empty-icon">⌕</span><b>${q?'没有匹配的已发布内容':`暂无已发布的${modeLabel}资料`}</b><small>${q?'可调整关键词或切换浏览分类。':'审核通过且明确授权复用后，相关资料会显示在这里。'}</small></div><div class="library-empty-cell library-empty-cell-muted"><span>内容位置预留</span><small>${mode==='scene'?'案例卡片将在对应空间场景下展示':'专项图片与策略将在对应设计专项下展示'}</small></div><div class="library-empty-cell library-empty-cell-muted"><span>内容位置预留</span><small>来源、版本与授权信息随内容一并呈现</small></div></div>`}</section>`;
  };
  return `${heading('COMPANY KNOWLEDGE LIBRARY','知识库','按空间场景看完整案例，或按设计专项查找做法',pill('仅展示已发布且有权复用的内容','green'))}<div class="library-intro"><div><b>从场景到专项，直接浏览可复用知识</b><p>公司项目案例与灵感参考分区展示；每个分区都可按空间场景或设计专项浏览。选作参考不会加入你的项目，也不会修改原成果。</p></div><div class="library-permissions"><span>审核通过</span><span>授权可复用</span><span>来源可追溯</span></div></div><div class="card library-results"><div class="filterbar"><label class="searchbox">⌕ <input id="global-search" value="${esc(state.search||'')}" placeholder="搜索项目、空间、设计对象或策略…"></label><button class="btn btn-primary btn-sm" data-action="search-knowledge">搜索知识库</button></div><div class="library-count">${items.length} 条符合发布与授权条件的知识 · 公司项目案例 ${items.filter(r=>/公司内部案例|项目案例|company|internal/i.test(`${r.contentSource||''} ${r.sourceType||''} ${r.type||''}`)).length} 条 · 灵感参考 ${items.filter(r=>/灵感|外部公开案例|参考图|inspiration|external/i.test(`${r.contentSource||''} ${r.sourceType||''} ${r.type||''}`)).length} 条</div>${shelf('inspiration','灵感参考','INSPIRATION','经过来源与授权核验的外部案例、参考图片和设计资料。','✳')}${shelf('company','公司项目案例','COMPANY PROJECTS','经审核并开放复用的公司项目成果与经验。','▧')}</div>`;
}

renderProjects=renderDesignerDashboard;
renderKnowledge=renderCompanyLibrary;
navNames['my-nominations']='我的知识提名';
const roleAwareRender=render;
render=function(){
  if(['project-detail','my-nominations'].includes(state.page)&&pageAllowed(state.page)){
    document.getElementById('crumb-current').textContent=navNames[state.page];
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page));
    document.getElementById('view').innerHTML=state.page==='project-detail'?renderProjectDetail():renderMyNominations();
    return;
  }
  roleAwareRender();
};

document.addEventListener('input',e=>{if(e.target.id==='global-search')state.search=e.target.value;});
window.addEventListener('click',e=>{
  const el=e.target.closest('[data-project-id]');
  if(el)state.activeProjectId=el.dataset.projectId;
  const button=e.target.closest('[data-action]'); if(!button)return;
  if(button.dataset.action==='library-mode'||button.dataset.action==='library-category'){
    e.preventDefault();e.stopImmediatePropagation();
    state.libraryBrowse=state.libraryBrowse||{inspiration:{mode:'scene',category:'all'},company:{mode:'scene',category:'all'}};
    const shelf=button.dataset.shelf;state.libraryBrowse[shelf]=state.libraryBrowse[shelf]||{mode:'scene',category:'all'};
    if(button.dataset.action==='library-mode'){state.libraryBrowse[shelf].mode=button.dataset.mode;state.libraryBrowse[shelf].category='all';}
    else state.libraryBrowse[shelf].category=button.dataset.category;
    render();return;
  }
  if(button.dataset.action==='preview-project-image'){
    e.preventDefault();e.stopImmediatePropagation();
    modal(button.dataset.title||'项目效果图',`<img src="${button.dataset.src}" alt="${button.dataset.title||'项目效果图'}" style="width:100%;max-height:70vh;object-fit:contain;background:#f5f5f0">`);return;
  }
  if(button.dataset.action==='open-project-assistant'){
    if(window.openDesignConversation){e.preventDefault();e.stopImmediatePropagation();window.openDesignConversation(button.dataset.projectId||state.activeProjectId||'H001');return;}
    e.preventDefault();e.stopImmediatePropagation();state.activeProjectId=button.dataset.projectId||'H001';state.sessionActive=false;state.uploadedImage=null;state.sessionImage=null;state.chatMessages=[];state.sessionResponse=false;state.sessionGenerated=false;state.sessionDraftSaved=false;state.page='assistant';render();return;
  }
  if(button.dataset.action==='new-project'){
    e.preventDefault();e.stopImmediatePropagation();
    modal('新建项目',`<div class="form-field"><label>项目名称</label><input id="new-project-name" placeholder="输入项目名称"></div><div class="two-col"><div class="form-field"><label>项目类型</label><select id="new-project-type"><option>商业综合体</option><option>商业街区</option><option>城市更新</option><option>其他</option></select></div><div class="form-field"><label>当前阶段</label><select id="new-project-stage"><option>概念方案</option><option>方案深化</option><option>施工图配合</option><option>建成复盘</option></select></div></div><div class="notice">新项目先建立项目空间；场地资料、成员与方案版本可在后续补充。</div>`,`${btn('取消','close-modal','btn')} ${btn('创建并进入设计','create-project','btn btn-primary')}`);return;
  }
  if(button.dataset.action==='create-project'){
    e.preventDefault();e.stopImmediatePropagation();
    const name=document.getElementById('new-project-name')?.value.trim();if(!name){toast('请先填写项目名称');return;}
    const id=`PRJ-${Date.now().toString().slice(-6)}`;designerProjects.push({id,name,projectType:document.getElementById('new-project-type')?.value||'商业景观项目',subtitle:`${document.getElementById('new-project-stage')?.value||'概念方案'} · 新建项目`,description:'项目资料待补充',placeholder:true,created:true});
    if(window.openDesignConversation){document.getElementById('modal-root').innerHTML='';window.openDesignConversation(id);toast(`已创建项目“${name}”，可以开始设计`);return;}
    state.activeProjectId=id;state.sessionActive=false;state.uploadedImage=null;state.sessionImage=null;state.chatMessages=[];state.sessionResponse=false;state.sessionGenerated=false;state.sessionDraftSaved=false;state.page='assistant';document.getElementById('modal-root').innerHTML='';render();toast(`已创建项目“${name}”，可以开始设计`);return;
  }
  if(button.dataset.action==='use-library-reference'){
    e.preventDefault();e.stopImmediatePropagation();state.libraryReference=records.find(r=>r.id===button.dataset.id)||null;state.page='assistant';render();toast('已将已发布知识加入本次设计参考');return;
  }
},true);

const renderAssistantBase=renderAssistant;
renderAssistant=function(){
  const html=renderAssistantBase();
  if(state.libraryReference&&!state.sessionActive){
    return html.replace('<div class="prompt-suggestions">',`<div class="library-reference-chip">知识库参考：${esc(state.libraryReference.name)} <button data-action="remove-library-reference">移除</button></div><div class="prompt-suggestions">`);
  }
  return html;
};
window.addEventListener('click',e=>{const b=e.target.closest('[data-action="remove-library-reference"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();state.libraryReference=null;render();},true);
