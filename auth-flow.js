// Prototype-only role routing. No credentials are sent or persisted.
state.currentRole = null;
const roleConfig = {
  designer: { label:'设计师', name:'林嘉', account:'lin.jia@example.com', workspace:'设计工作台', subtitle:'项目设计与 AI 助手', initial:'林', landing:'assistant' },
  manager: { label:'项目经理', name:'王宇', account:'pm@example.com', workspace:'项目管理', subtitle:'项目协作与交付管理', initial:'王', landing:'assistant' },
  superadmin: { label:'超级管理员', name:'陈敏', account:'admin@example.com', workspace:'管理工作台', subtitle:'项目、知识中心与权限管理', initial:'陈', landing:'governance-home' }
};
const roleNames={designer:'设计师',manager:'项目经理',superadmin:'超级管理员'};
const moduleNames={assistant:'问答与设计助手',projects:'项目列表与项目资料',knowledge:'知识库与提名',records:'知识资产管理',reviews:'审核',publishing:'发布与下线',access:'角色权限配置'};
const operationNames=['查看','新建','修改','删除','审核','发布','下线'];
const operations=['read','create','update','delete','review','publish','offline'];
const rolePermissions={
  designer:{scope:'participating',projectIds:['H001','DEMO-002','DEMO-003'],assistant:['read'],projects:['read','create','update','delete'],knowledge:['read','create'],records:[],reviews:[],publishing:[],access:[]},
  manager:{scope:'participating',projectIds:['H001','DEMO-002','DEMO-003'],assistant:['read'],projects:['read','create','update','review'],knowledge:['read','create'],records:[],reviews:[],publishing:[],access:[]},
  superadmin:{scope:'all',projectIds:['H001','DEMO-002','DEMO-003'],assistant:['read'],projects:['read','create','update','delete','review'],knowledge:['read','create','update','delete'],records:['read','create','update','delete'],reviews:['read','review'],publishing:['read','publish','offline'],access:['read','create','update','delete']}
};
const rolePages={designer:['assistant','projects','project-list','project-detail','knowledge','my-nominations'],manager:['assistant','projects','project-list','project-detail','knowledge','my-nominations'],superadmin:['assistant','projects','project-list','project-detail','knowledge','my-nominations','governance-home','intake','records','reviews','inspections','publishing','rules','access-control']};
const accountRoles=Object.fromEntries(Object.entries(roleConfig).map(([key,value])=>[value.account,key]));
accountRoles['zhang.yue@example.com']='designer';
const pageModules={assistant:'assistant',projects:'projects','project-detail':'projects',knowledge:'knowledge','my-nominations':'knowledge','governance-home':'records',intake:'records',records:'records',reviews:'reviews',inspections:'records',publishing:'publishing',rules:'records','access-control':'access'};
function hasPermission(module,operation){return module==='assistant'&&operation==='read'||!!rolePermissions[state.currentRole]?.[module]?.includes(operation);}
function pageAllowed(page){return page==='assistant'||page==='access-control'&&state.currentRole==='superadmin'&&hasPermission('access','read')||!!pageModules[page]&&hasPermission(pageModules[page],'read');}
const actionPermissions={
  'send-message':['assistant','read'],'new-project':['projects','create'],'create-project':['projects','create'],'open-project-assistant':['projects','read'],'save-candidate':['projects','update'],'edit-strategy':['projects','update'],'save-strategy':['projects','update'],'nominate-knowledge':['knowledge','create'],'submit-knowledge-candidate':['knowledge','create'],
  'new-record':['records','create'],'save-record':['records','create'],'record-update':['records','update'],'auth-submit':['records','update'],'review-record':['reviews','review'],'approve-record':['reviews','review'],'review-return-record':['reviews','review'],'review-approve':['reviews','review'],'review-return':['reviews','review'],'review-restrict':['reviews','review'],'bulk-review':['reviews','review'],'publish-batch':['publishing','publish'],'manage-publish':['publishing','publish'],'unpublish':['publishing','offline'],'new-tag':['records','create'],'rule-edit':['records','update'],'intake-submit':['records','create'],'fake-upload':['records','create'],'run-inspection':['records','read'],'fix-inspection':['records','create'],'search-knowledge':['knowledge','read'],'use-library-reference':['knowledge','read'],'toggle-user':['access','update'],'invite-user':['access','create'],'confirm-invite':['access','create']
};
function accessibleProjects(){const projects=designerProjects||[],p=rolePermissions[state.currentRole];if(!p)return [];if(p.scope==='all')return projects;if(p.scope==='assigned')return projects.filter(x=>p.projectIds.includes(x.id));return projects;}
const loginScreen=document.getElementById('login-screen');
const appShell=document.getElementById('app-shell');
function applyRole(role){
  if(!roleConfig[role])return;
  const c=roleConfig[role]; state.currentRole=role;
  document.getElementById('design-nav').hidden=false;
  document.getElementById('design-nav-label').hidden=false;
  document.getElementById('governance-nav').hidden=true;
  document.getElementById('governance-nav-label').hidden=true;
  document.getElementById('admin-nav').hidden=role!=='superadmin';
  document.getElementById('admin-nav-label').hidden=role!=='superadmin';
  document.querySelectorAll('#design-nav [data-page]').forEach(button=>button.hidden=!pageAllowed(button.dataset.page));
  const showGovernance=['records','reviews','publishing'].some(m=>hasPermission(m,'read')||hasPermission(m,'create')||hasPermission(m,'review')||hasPermission(m,'publish'));
  document.getElementById('governance-nav').hidden=!showGovernance;document.getElementById('governance-nav-label').hidden=!showGovernance;
  document.querySelectorAll('#governance-nav [data-page]').forEach(button=>button.hidden=!pageAllowed(button.dataset.page));
  const helpButton=document.querySelector('.help-card button');
  helpButton.hidden=false;
  helpButton.dataset.page='knowledge';
  helpButton.innerHTML='检索可用知识 <span>→</span>';
  document.getElementById('workspace-name').textContent=c.workspace;
  document.getElementById('workspace-subtitle').textContent=c.subtitle;
  document.getElementById('crumb-workspace').textContent=c.workspace;
  document.getElementById('profile-name').textContent=c.name;
  document.getElementById('profile-role').textContent=c.label;
  document.getElementById('profile-initial').textContent=c.initial;
  document.getElementById('top-avatar').textContent=c.initial;
  document.getElementById('role-badge').textContent=c.label;
  document.title='Landspire · '+c.workspace;
  state.page=c.landing;
}
function governanceHome(){
  const title='知识管理后台';
  const desc='接收设计师提名的知识候选，统一完成资料治理、专业审核与知识发布。';
  return `<div class="page-heading"><div><div class="eyebrow">LANDSPIRE KNOWLEDGE HUB</div><h1>${title}</h1><p>${desc}</p></div><div class="heading-actions"><span class="pill purple">角色：${roleConfig[state.currentRole].label}</span></div></div>
    <div class="governance-welcome"><div><span class="eyebrow">KNOWLEDGE LIFECYCLE</span><h2>从项目经验，到可信可用的组织知识</h2><p>设计师负责发现和提名；超级管理员统一核验来源、授权、专业结论与适用条件，并决定发布及复用范围。候选经过人工审核后才可发布。</p></div><div class="governance-flow"><span>项目实践</span><i>→</i><span>设计师提名</span><i>→</i><span>知识审核</span><i>→</i><span>授权发布</span></div></div>
    <div class="metric-grid"><div class="card metric"><span class="metric-icon">⇧</span><label>待治理候选</label><strong>4</strong><small>等待来源与权限核验</small></div><div class="card metric"><span class="metric-icon">☷</span><label>待专业复核</label><strong>2</strong><small>高影响结论需人工判断</small></div><div class="card metric"><span class="metric-icon">▤</span><label>知识资产</label><strong>28</strong><small>按权限范围检索与复用</small></div><div class="card metric"><span class="metric-icon">◎</span><label>待处理风险</label><strong>3</strong><small>授权、时效或证据待确认</small></div></div>
    <div class="governance-shortcuts"><button class="card shortcut-card" data-page="intake"><span>⇧</span><b>资料接入</b><small>导入项目文件、会议纪要与规范</small><em>进入资料接入 →</em></button><button class="card shortcut-card" data-page="reviews"><span>☷</span><b>审核队列</b><small>核查候选知识及其证据、权限边界</small><em>处理审核任务 →</em></button><button class="card shortcut-card" data-page="records"><span>▤</span><b>知识资产</b><small>查看来源、状态、授权和复用范围</small><em>管理知识资产 →</em></button><button class="card shortcut-card" data-page="publishing"><span>↗</span><b>发布与版本</b><small>按项目、团队或组织范围管理可见性</small><em>查看发布记录 →</em></button></div>`;
}
const accessUsers=[
  {name:'林嘉',account:'lin.jia@example.com',team:'景观设计团队',role:'designer',status:'启用',scope:'参与项目',initial:'林'},
  {name:'张悦',account:'zhang.yue@example.com',team:'景观设计团队',role:'designer',status:'启用',scope:'参与项目',initial:'张'},
  {name:'王宇',account:'pm@example.com',team:'项目管理组',role:'manager',status:'启用',scope:'参与项目',initial:'王'},
  {name:'陈敏',account:'admin@example.com',team:'平台与知识管理组',role:'superadmin',status:'启用',scope:'全部项目',initial:'陈'}
];
function accessControlPage(){
  const rows=accessUsers.map((u,i)=>`<tr><td><div class="access-person"><span>${u.initial}</span><div><b>${u.name}</b><small>${u.account}</small></div></div></td><td>${u.team}</td><td><select class="access-role" data-user="${i}">${Object.entries(roleNames).map(([key,label])=>`<option value="${key}" ${u.role===key?'selected':''}>${label}</option>`).join('')}</select></td><td><span class="pill ${u.status==='启用'?'green':'amber'}">${u.status}</span></td><td><button class="btn btn-sm" data-action="toggle-user" data-user="${i}">${u.status==='启用'?'停用':'启用'}</button></td></tr>`).join('');
  const roleHead=Object.entries(roleNames).map(([key,label])=>`<th>${label}</th>`).join('');
  const matrix=Object.entries(moduleNames).map(([module,label])=>`<tr><td>${label}</td>${Object.keys(roleNames).map(role=>`<td><div class="permission-checks">${operations.map((op,i)=>`<label title="${operationNames[i]}"><input type="checkbox" data-permission-role="${role}" data-module="${module}" data-operation="${op}" ${module==='assistant'&&op==='read'||rolePermissions[role][module]?.includes(op)?'checked':''} ${module==='assistant'&&op==='read'||role==='superadmin'&&module==='access'&&['read','update'].includes(op)?'disabled':''}><span>${operationNames[i]}</span></label>`).join('')}</div></td>`).join('')}</tr>`).join('');
  const scopes=Object.entries(roleNames).map(([role,label])=>`<div class="scope-role"><b>${label}</b><select data-scope-role="${role}"><option value="all" ${rolePermissions[role].scope==='all'?'selected':''}>全部项目</option><option value="participating" ${rolePermissions[role].scope==='participating'?'selected':''}>本人参与的项目</option><option value="assigned" ${rolePermissions[role].scope==='assigned'?'selected':''}>明确授权的项目</option></select>${rolePermissions[role].scope==='assigned'?`<div class="project-assign-list">${designerProjects.map(project=>`<label><input type="checkbox" data-project-role="${role}" value="${project.id}" ${rolePermissions[role].projectIds.includes(project.id)?'checked':''}><span>${project.id} · ${project.name}</span></label>`).join('')}</div>`:''}</div>`).join('');
  return `<div class="page-heading"><div><div class="eyebrow">IDENTITY & ACCESS MANAGEMENT</div><h1>角色与权限</h1><p>按角色配置功能操作和项目数据范围；登录角色由账号识别。</p></div><div class="heading-actions"><span class="pill green">角色访问控制</span><button class="btn btn-primary" data-action="invite-user">＋ 添加成员</button></div></div>
  <div class="metric-grid"><div class="card metric"><span class="metric-icon">♙</span><label>成员账号</label><strong>${accessUsers.length}</strong><small>按账号匹配角色</small></div><div class="card metric"><span class="metric-icon">◈</span><label>业务角色</label><strong>3</strong><small>设计师、项目经理、超级管理员</small></div><div class="card metric"><span class="metric-icon">✓</span><label>启用账号</label><strong>${accessUsers.filter(u=>u.status==='启用').length}</strong><small>停用后拒绝登录</small></div><div class="card metric"><span class="metric-icon">⟳</span><label>身份认证</label><strong>演示模式</strong><small>生产接入企业 SSO</small></div></div>
  <div class="card access-card"><div class="card-head"><div><h2>成员账号与角色</h2><small>更改角色后，下次登录按新角色授予权限</small></div><input id="user-filter" class="access-search" placeholder="搜索姓名或邮箱"></div><div class="table-wrap"><table class="access-table"><thead><tr><th>成员</th><th>团队</th><th>角色</th><th>状态</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div></div>
  <div class="card access-card"><div class="card-head"><div><h2>功能操作权限</h2><small>全员可使用问答入口；问答引用资料仍受项目数据范围控制</small></div></div><div class="table-wrap"><table class="access-table permission-table"><thead><tr><th>功能模块</th>${roleHead}</tr></thead><tbody>${matrix}</tbody></table></div><div class="access-note">超级管理员统一负责全部项目、知识中心和账号权限；设计师与项目经理按授权范围访问项目。</div></div>
  <div class="card access-card"><div class="card-head"><div><h2>项目数据范围</h2><small>项目范围独立于功能权限，问答检索也遵循此范围</small></div></div><div class="scope-grid">${scopes}</div><div class="access-divider"></div><div class="access-detail"><b>对话与交付可见性（默认建议，可调整）</b><p>项目成员可查看本项目共享的已交付结果；完整设计对话保留在创建者的账号下，项目成员可追溯其来源摘要。项目经理和超级管理员负责确认并指定当前交付方案；知识发布与下线由超级管理员负责。</p></div></div>
  <div class="access-note access-footnote">演示数据仅保存在当前页面会话。真实环境需要服务端对每次查看和操作执行权限校验；权限变更审计可作为后续设计项。</div>`;
}
const baseRender=render;
render=function(){
  if(!state.currentRole)return;
  if(!pageAllowed(state.page)){
    state.page=roleConfig[state.currentRole].landing;
  }
  if(state.page==='governance-home'){
    document.getElementById('crumb-current').textContent='治理总览';
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page));
    document.getElementById('view').innerHTML=governanceHome(); return;
  }
  if(state.page==='access-control'){
    document.getElementById('crumb-current').textContent='用户与权限';
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page));
    document.getElementById('view').innerHTML=accessControlPage(); return;
  }
  baseRender();
  document.getElementById('crumb-workspace').textContent=roleConfig[state.currentRole||'designer'].workspace;
};
navNames['governance-home']='治理总览';
navNames.projects='我的项目';
navNames.knowledge='知识库';
navNames['project-detail']='项目详情';
navNames['my-nominations']='我的知识提名';
document.addEventListener('click',e=>{
  const demoAccount=e.target.closest('[data-demo-account]');
  if(demoAccount){document.getElementById('login-account').value=demoAccount.dataset.demoAccount;document.getElementById('login-password').focus();return;}
  const adminAction=e.target.closest('[data-action]')?.dataset.action;
  if(adminAction==='toggle-user'){const u=accessUsers[Number(e.target.closest('[data-action]').dataset.user)];if(u){u.status=u.status==='启用'?'停用':'启用';render();toast(u.status==='启用'?'账号已恢复':'账号已停用')}return;}
  if(adminAction==='invite-user'){modal('添加组织成员',`<div class="notice">账号登录后会自动继承所分配角色的权限。</div><div class="form-field"><label>姓名</label><input id="invite-name" placeholder="成员姓名"></div><div class="form-field"><label>公司邮箱 / 工号</label><input id="invite-email" placeholder="name@example.com"></div><div class="form-field"><label>角色</label><select id="invite-role">${Object.entries(roleNames).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></div>`,`${btn('取消','close-modal','btn')} ${btn('添加成员','confirm-invite','btn btn-primary')}`);return;}
  if(adminAction==='confirm-invite'){const name=document.getElementById('invite-name')?.value.trim(),account=document.getElementById('invite-email')?.value.trim();if(!name||!account){toast('请填写姓名和账号');return;}const role=document.getElementById('invite-role').value;accountRoles[account.toLowerCase()]=role;accessUsers.push({name,account,team:'待分配团队',role,status:'启用',scope:rolePermissions[role].scope,initial:name.slice(0,1)});document.getElementById('modal-root').innerHTML='';render();toast('账号已添加并绑定角色');return;}
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(action==='nominate-knowledge'){
    e.preventDefault();e.stopImmediatePropagation();
    modal('提名为知识候选',`<div class="notice">提交后进入超级管理员的审核队列。设计师负责提名；审核员决定是否发布及复用范围。</div><div class="form-field"><label>候选名称</label><input id="candidate-title" value="${['铺装简化','水景节点','灯光导向'][state.sessionSelected||0]} · 设计策略"></div><div class="form-field"><label>设计问题与策略摘要</label><textarea id="candidate-summary" placeholder="描述遇到的问题、设计调整与验证结果">${(state.chatMessages||[]).filter(m=>m.role==='user').map(m=>m.text).filter(Boolean).join('；')}</textarea></div><div class="form-field"><label>来源与适用边界</label><textarea id="candidate-boundary" placeholder="项目/版本来源、可适用场景、限制条件"></textarea></div><div class="form-field"><label>复用授权</label><select id="candidate-scope"><option>仅项目内，跨项目授权待确认</option><option>申请组织内部复用（需证明有权共享）</option></select></div>`,`${btn('取消','close-modal','btn')} ${btn('提交审核','submit-knowledge-candidate','btn btn-primary')}`);return;
  }
  if(action==='submit-knowledge-candidate'){
    e.preventDefault();e.stopImmediatePropagation();
    const title=document.getElementById('candidate-title')?.value.trim(), summary=document.getElementById('candidate-summary')?.value.trim(), boundary=document.getElementById('candidate-boundary')?.value.trim();
    if(!title||!summary||!boundary){toast('请补全候选名称、问题策略摘要和来源边界');return;}
    const sourceProject=designerProjects.find(p=>p.id===state.activeProjectId);
    records.push({id:'CAND-'+Date.now(),name:title,type:'设计经验候选',source:sourceProject?`${sourceProject.name} / ${sourceProject.id} · 设计助手会话`:'设计助手会话 · 未关联项目',projectId:state.activeProjectId||null,ownerId:'designer',level:'项目私有',permission:document.getElementById('candidate-scope')?.value||'项目内；跨项目授权待确认',status:'待超级管理员审核',state:'待审核',date:new Date().toLocaleDateString('zh-CN'),kind:'candidate',auth:false,summary,boundary});
    document.getElementById('modal-root').innerHTML='';render();toast('候选已提交超级管理员审核，尚未发布');return;
  }
  if(e.target.closest('#login-submit')){
    const account=document.getElementById('login-account').value.trim();
    if(!account){toast('请输入工号或公司邮箱');document.getElementById('login-account').focus();return;}
    const role=accountRoles[account.toLowerCase()];
    const member=accessUsers.find(u=>u.account.toLowerCase()===account.toLowerCase());
    if(!role||member?.status!=='启用'){toast(role?'账号已停用，请联系管理员':'未识别此账号，请联系管理员分配角色');return;}
    state.currentAccount=account.toLowerCase();applyRole(role);loginScreen.hidden=true;appShell.hidden=false;appShell.classList.remove('auth-hidden');
    document.getElementById('login-password').value='';render();window.scrollTo(0,0);return;
  }
  if(e.target.closest('#logout-button')){
    appShell.hidden=true;appShell.classList.add('auth-hidden');loginScreen.hidden=false;state.currentRole=null;state.currentAccount=null;document.body.classList.remove('design-workspace-page');
    state.activeProjectId=null;state.libraryReference=null;state.sessionActive=false;state.uploadedImage=null;state.sessionImage=null;state.chatMessages=[];state.sessionResponse=false;state.sessionGenerated=false;state.sessionDraftSaved=false;
    document.title='Landspire · 登录';
    document.getElementById('modal-root').innerHTML='';document.getElementById('toast').classList.remove('show');
    window.scrollTo(0,0);document.getElementById('login-account').focus();return;
  }
},true);
document.addEventListener('change',e=>{
  if(e.target.matches('.access-role')){const u=accessUsers[Number(e.target.dataset.user)];if(u){u.role=e.target.value;accountRoles[u.account.toLowerCase()]=u.role;u.scope=rolePermissions[u.role].scope;toast(`已将 ${u.name} 的角色更新为${roleNames[u.role]}`);render();}}
  if(e.target.matches('[data-permission-role]')){const {permissionRole:role,module,operation}=e.target.dataset;const list=rolePermissions[role][module]||(rolePermissions[role][module]=[]);if(e.target.checked&&!list.includes(operation))list.push(operation);if(!e.target.checked)rolePermissions[role][module]=list.filter(x=>x!==operation);render();toast('角色操作权限已更新');}
  if(e.target.matches('[data-scope-role]')){const role=e.target.dataset.scopeRole;rolePermissions[role].scope=e.target.value;accessUsers.filter(u=>u.role===role).forEach(u=>u.scope=e.target.value);toast(`${roleNames[role]}的数据范围已更新`);}
  if(e.target.matches('[data-project-role]')){const role=e.target.dataset.projectRole,list=rolePermissions[role].projectIds;if(e.target.checked&&!list.includes(e.target.value))list.push(e.target.value);if(!e.target.checked)rolePermissions[role].projectIds=list.filter(id=>id!==e.target.value);toast(`${roleNames[role]}的授权项目已更新`);}
});
document.addEventListener('input',e=>{if(e.target.id==='user-filter'){const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.access-table tbody tr').forEach(row=>row.hidden=!row.textContent.toLowerCase().includes(q));}});
// Window capture precedes legacy document handlers, including data-action routes.
window.addEventListener('click',e=>{
  const button=e.target.closest('[data-page],[data-action]');
  if(!button||!appShell.contains(button)&&!document.getElementById('modal-root').contains(button))return;
  const page=button.dataset.page||(navNames[button.dataset.action]?button.dataset.action:null);
  const required=button.dataset.action==='save-fix'?(state.page==='publishing'?['publishing','publish']:['records','create']):actionPermissions[button.dataset.action];
  const projectId=button.dataset.projectId;
  if(!state.currentRole||(page&&!pageAllowed(page))||(required&&!hasPermission(...required))||(projectId&&!accessibleProjects().some(project=>project.id===projectId))){
    e.preventDefault();e.stopImmediatePropagation();toast('请使用对应身份进入工作台');
  }
},true);
document.getElementById('login-password').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('login-submit').click()});
