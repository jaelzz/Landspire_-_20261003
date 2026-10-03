/* Design Copilot (v2): requirement -> confirmed decision -> case-based directions -> candidate variants -> lightweight version log.
   Local prototype persistence; AI parsing, case retrieval and image generation are illustrative only. */
(() => {
  'use strict';
  const schema = 1;
  navNames['assistant-v2'] = '设计助手 · 新版';
  pageModules['assistant-v2'] = 'assistant';
  const tabs = [['decision', '当前决策'], ['versions', '版本记录'], ['work', '项目 / 任务'], ['reports', '报告']];
  const clone = value => JSON.parse(JSON.stringify(value));
  const id = () => crypto.randomUUID();
  const now = () => new Date().toISOString();
  const time = value => value ? new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '—';
  const fulltime = value => value ? new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) : '—';
  const safe = value => esc(value ?? '');
  const actor = () => accessUsers.find(u => u.account.toLowerCase() === state.currentAccount)?.name || roleConfig[state.currentRole]?.name || '当前用户';
  const account = () => state.currentAccount || roleConfig[state.currentRole]?.account;
  const button = (text, action, attrs = '', primary = false) => `<button class="dc-button ${primary ? 'primary' : ''}" data-dc="${action}" ${attrs}>${text}</button>`;
  const badge = (text, tone = '') => `<span class="dc-badge ${tone}">${text}</span>`;
  const empty = (title, desc) => `<div class="dc-empty"><span>◇</span><b>${title}</b><p>${desc}</p></div>`;

  const STAGE_LABEL = { input: '待输入需求', decision: '待确认本轮决策', direction: '待选择设计方向', candidates: '待选择候选方案', saved: '本轮已保存版本' };

  const VARIABLE_RULES = [
    [/入口|识别/, '入口识别度', 'AI 从描述推断'],
    [/人流|动线|通行/, '人流引导', 'AI 从描述推断'],
    [/铺装|地面|地坪/, '铺装秩序', 'AI 从描述推断'],
    [/植物|绿化|绿地|乔木/, '植物层次', 'AI 从描述推断'],
    [/水景|水池|喷泉/, '水景存在感', '案例参考得出'],
    [/灯光|照明|夜景|夜间/, '夜间氛围', 'AI 从描述推断'],
    [/商业|店铺|界面|招商/, '商业界面活力', '案例参考得出'],
  ];
  const CONSTRAINT_RULES = [
    [/成本|预算|造价/, '控制改造成本', '用户明确提出'],
    [/消防|安全|通行宽/, '不能影响消防通行', '用户明确提出'],
    [/保留|不变|不动/, '保留用户指定内容', '用户明确提出'],
    [/工期|进度|时间/, '工期需求待明确', '用户明确提出'],
  ];
  const DEFAULT_CONSTRAINTS = () => ([
    { id: id(), label: '保留原有建筑与主要道路', value: '不改变建筑界面与主要通行组织', source: '默认约束' },
    { id: id(), label: '不改变主入口位置', value: '主入口位置与总体布局保持不变', source: '默认约束' },
  ]);
  const OPEN_QUESTIONS_POOL = [
    [/水景|水池|喷泉/, '水景的设备选型与维护条件尚未确认，需要专业评估'],
    [/成本|预算|造价/, '具体预算范围尚未明确，需要客户补充'],
    [/标识|导向|指示/, '是否需要保留原有标识系统，需要客户确认'],
  ];

  const DIRECTION_TEMPLATES = [
    { id: 'order', title: '秩序强化型', tag: '克制改造', strategy: '简化铺装分区与材质层次，强化主入口轴线与通行秩序，用最小改动获得最高识别度提升。', caseRef: '华润合肥万象城 · 铺装简化案例：减少铺装图案种类、保留对称轴线，验证"少即是清晰"的改造路径。', reuse: '可借鉴：铺装分区简化逻辑、轴线强化方式。', avoid: '不建议直接复制：具体铺装材料与色彩，需结合本项目材料清单确认。', scope: '预计调整：铺装、入口标识；保留场地关系、视角与总体布局。', risk: '改动幅度小，识别度提升有限，需结合客户诉求判断是否足够。' },
    { id: 'scene', title: '场景营造型', tag: '氛围提升', strategy: '通过植物层次与水景节点，在入口区塑造可停留、有记忆点的场景氛围。', caseRef: '行业镜面水案例库：入口镜面水结合低矮绿篱，验证不新增大型构筑物也能提升停留感。', reuse: '可借鉴：水景与绿植的组合逻辑、尺度控制方式。', avoid: '不建议直接复制：水景设备选型与维护方案，需结合本项目维护条件单独评估。', scope: '预计调整：水景（待评估）、植物、入口节点；保留场地关系与总体布局。', risk: '涉及设备与维护成本，需在方案确认前补充造价与维护依据。' },
    { id: 'commercial', title: '商业激活型', tag: '界面联动', strategy: '强化沿街/沿商业界面的可见性与连续性，让入口与商业氛围联动，而非孤立处理。', caseRef: '同类商业项目沿街界面案例：连续铺装与灯光导向，让入口与店铺界面形成统一的商业语言。', reuse: '可借鉴：界面连续性组织方式、灯光导向节奏。', avoid: '不建议直接复制：具体灯具规格与店铺配合细节，需与运营、招商条件核对。', scope: '预计调整：铺装、灯光与导向、入口节点；保留场地关系与总体布局。', risk: '涉及与商业运营方协调，推进周期可能更长。' },
  ];
  const VARIANT_NOTE = { a: '保守改造 · 调整幅度最小，优先降低风险', b: '平衡改造 · 在识别度与改动范围间取得平衡', c: '强化表达 · 更明显地体现本轮方向，改动范围也更大' };

  let db, owner, activeTab = 'decision', search = '', storageOK = true, historyOpen = false, panelOpen = false, collapsed = false;
  let saveTimer, renderedConversationId;

  function makeConversation(projectId = '') {
    return { id: id(), title: '新设计探索', projectId, createdAt: now(), updatedAt: now(), messages: [], draft: '', image: null, requirement: '', variables: [], constraints: DEFAULT_CONSTRAINTS(), openQuestions: [], stage: 'input', confirmed: null, directions: [], selectedDirection: null, batch: null, selectedCandidate: 0, versions: [], events: [] };
  }
  function load() {
    if (owner === account() && db) return;
    owner = account(); db = { schema, conversations: [], activeId: null };
    storageOK = true; activeTab = 'decision'; search = '';
    try {
      const saved = JSON.parse(localStorage.getItem(`landspire.copilot.v1.${owner}`) || 'null');
      if (saved?.schema === schema && Array.isArray(saved.conversations)) db = saved;
    } catch { storageOK = false; }
    if (!visible().length) { const c = makeConversation(); db.conversations.push(c); db.activeId = c.id; }
    if (!visible().some(c => c.id === db.activeId)) db.activeId = visible()[0].id;
  }
  function visible() { return db.conversations.filter(c => !c.projectId || accessibleProjects().some(p => p.id === c.projectId)); }
  function current() { load(); return visible().find(c => c.id === db.activeId) || visible()[0]; }
  function persist() {
    clearTimeout(saveTimer);
    try { localStorage.setItem(`landspire.copilot.v1.${owner}`, JSON.stringify(db)); storageOK = true; } catch { storageOK = false; }
    document.querySelectorAll('.dc-storage').forEach(el => { el.textContent = storageOK ? '已保存到此浏览器' : '本地保存失败，请导出备份'; el.classList.toggle('error', !storageOK); });
  }
  function event(c, type, detail) { c.events.push({ id: id(), type, detail, by: actor(), at: now() }); c.updatedAt = now(); }
  function save() { persist(); render(); }
  function newConversation(projectId = '') {
    load(); if (projectId && !accessibleProjects().some(p => p.id === projectId)) { toast('当前账号无权访问此项目'); return; }
    const c = makeConversation(projectId); db.conversations.unshift(c); db.activeId = c.id; search = ''; activeTab = 'decision'; historyOpen = false;
    event(c, '创建探索', projectId ? '已关联项目' : '暂未关联项目'); save();
  }
  function projectName(projectId) { return designerProjects.find(p => p.id === projectId)?.name || '未关联项目'; }
  function projectOptions(selected) { return `<option value="">暂不关联项目</option>${accessibleProjects().map(p => `<option value="${safe(p.id)}" ${selected === p.id ? 'selected' : ''}>${safe(p.name)}</option>`).join('')}`; }
  function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

  function history(c) {
    const items = visible().filter(x => !search || `${x.title} ${projectName(x.projectId)}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return `<aside class="dc-history ${historyOpen ? 'mobile-open' : ''}"><div class="dc-history-title"><b>设计探索</b><span>${visible().length}</span>${button('×', 'history-close', 'aria-label="关闭历史对话" class="dc-mobile-close"')}</div>${button('＋ 新建探索', 'new', '', true)}<label class="dc-search"><span>⌕</span><input id="dc-search" aria-label="搜索对话" placeholder="搜索项目或标题…" value="${safe(search)}"></label><div class="dc-list-label">历史对话 <span>按最近更新</span></div><div class="dc-history-list">${items.length ? items.map(x => `<button class="dc-history-row ${x.id === c.id ? 'active' : ''}" data-dc="switch" data-id="${x.id}"><strong>${safe(x.title)}</strong><span>${safe(projectName(x.projectId))}</span><small>${badge(STAGE_LABEL[x.stage] || '进行中', x.stage === 'saved' ? 'green' : '')}${time(x.updatedAt)}</small></button>`).join('') : empty('还没有历史探索', '开始一轮需求输入即可创建')}</div><div class="dc-history-footer"><span class="dc-storage ${storageOK ? '' : 'error'}">${storageOK ? '已保存到此浏览器' : '本地保存失败，请导出备份'}</span></div></aside>`;
  }
  function welcome() {
    return `<div class="dc-welcome"><div class="dc-kicker">LANDSPIRE / DESIGN COPILOT</div><div class="dc-orb">✳</div><h1>案例有依据，方案可比较。</h1><p>先说清楚需求和约束，再从案例中选一个方向，<br>最后比较同一方向下的三个方案变体。</p><div class="dc-suggestions">${[['01', '优化主入口识别', '保留场地关系、鸟瞰视角和总体布局，简化主入口铺装，提升入口识别度。'], ['02', '控制铺装成本', '客户希望控制改造成本，适当简化铺装，把重点放在入口节点和水景评估上。'], ['03', '提升夜间商业氛围', '保持现有道路，优化沿街灯光导向，让入口与商业界面联动。']].map(([n, title, prompt]) => `<button data-dc="suggest" data-text="${prompt}"><span>${n}</span><b>${title}</b><i>↗</i></button>`).join('')}</div></div>`;
  }
  function parseText(c, text) {
    const newVars = VARIABLE_RULES.filter(([re]) => re.test(text)).map(([, label, source]) => ({ id: id(), label, value: '需求中提到，建议作为本轮设计变量', source }));
    newVars.forEach(v => { if (!c.variables.some(x => x.label === v.label)) c.variables.push(v); });
    const newCons = CONSTRAINT_RULES.filter(([re]) => re.test(text)).map(([, label, source]) => ({ id: id(), label, value: text, source }));
    newCons.forEach(v => { if (!c.constraints.some(x => x.label === v.label)) c.constraints.push(v); });
    c.openQuestions = OPEN_QUESTIONS_POOL.filter(([re]) => re.test(text)).map(([, q]) => q);
    if (!c.openQuestions.length) c.openQuestions = ['是否有希望完全保留、不作为本轮讨论对象的部分？'];
    if (!c.variables.length) c.variables.push({ id: id(), label: '入口识别度', value: '默认纳入讨论，可删除或编辑', source: '待确认' });
  }
  function messages(c) {
    return c.messages.map(m => `<article class="dc-message ${m.role}" id="message-${m.id}"><div class="dc-message-avatar">${m.role === 'user' ? safe((m.by || actor()).slice(0, 1)) : m.role === 'system' ? '✓' : '✳'}</div><div class="dc-message-content"><div class="dc-message-meta"><b>${m.role === 'user' ? safe(m.by) : m.role === 'system' ? '工作记录' : 'Landspire'}</b><time>${time(m.at)}</time>${m.role === 'assistant' ? badge('模拟助手') : ''}</div>${m.image ? `<img class="dc-uploaded" src="${safe(m.image.url)}" alt="${safe(m.image.name)}">` : ''}<div class="dc-message-text">${safe(m.text)}</div></div></article>`).join('');
  }
  function decisionCard(c) {
    const confirmed = c.confirmed && c.confirmed.revision === c.events.filter(e => e.type === '提出需求' || e.type === '编辑决策').length;
    return `<section class="dc-card"><div class="dc-section-title"><h3>我先确认一下本轮需求</h3>${badge(c.stage === 'decision' ? '待确认' : '已确认', c.stage !== 'decision')}</div><label class="dc-field">需求摘要<textarea id="dc-requirement" rows="2">${safe(c.requirement)}</textarea></label>
      <div class="dc-dim-block"><div class="dc-dim-head"><b>AI 识别的设计变量</b><small>来源已标注，可编辑或删除</small></div><div class="dc-dim-list">${c.variables.map(v => `<div class="dc-dim-row"><input data-var="${v.id}" value="${safe(v.value)}"><span class="dc-dim-tag">${safe(v.label)}</span><small>${safe(v.source)}</small><button data-dc="remove-var" data-id="${v.id}" aria-label="删除">×</button></div>`).join('')}</div>${button('＋ 添加设计变量', 'add-var')}</div>
      <div class="dc-dim-block"><div class="dc-dim-head"><b>约束条件</b><small>只展示与本轮任务相关的约束</small></div><div class="dc-dim-list">${c.constraints.map(v => `<div class="dc-dim-row"><input data-con="${v.id}" value="${safe(v.value)}"><span class="dc-dim-tag">${safe(v.label)}</span><small>${safe(v.source)}</small><button data-dc="remove-con" data-id="${v.id}" aria-label="删除">×</button></div>`).join('')}</div>${button('＋ 添加约束条件', 'add-con')}</div>
      ${c.openQuestions.length ? `<div class="dc-questions"><b>待确认事项</b><ul>${c.openQuestions.map(q => `<li>${safe(q)}</li>`).join('')}</ul></div>` : ''}
      <div class="dc-panel-actions-inline">${button('确认，查看设计方向 →', 'confirm-decision', '', true)}</div></section>`;
  }
  function directionsCard(c) {
    return `<section class="dc-card"><div class="dc-section-title"><h3>本轮设计方向</h3>${badge('基于案例推荐 · 待专业确认')}</div><p class="dc-muted">保留已确认约束，围绕不同策略整理 3 个方向；每个方向先看策略和案例依据，再决定生成方案。</p><div class="dc-direction-list">${c.directions.map(d => `<button class="dc-direction ${c.selectedDirection === d.id ? 'selected' : ''}" data-dc="select-direction" data-id="${d.id}"><div class="dc-direction-head"><b>${safe(d.title)}</b>${badge(safe(d.tag))}</div><p class="dc-direction-strategy">${safe(d.strategy)}</p><div class="dc-direction-case"><b>案例依据</b><p>${safe(d.caseRef)}</p><p class="dc-reuse">${safe(d.reuse)}</p><p class="dc-avoid">${safe(d.avoid)}</p></div><div class="dc-direction-meta"><span>${safe(d.scope)}</span><span class="dc-risk">${safe(d.risk)}</span></div></button>`).join('')}</div><div class="dc-panel-actions-inline">${button('← 返回修改需求', 'back-decision')}${button('生成该方向的三张方案 →', 'generate-candidates', c.selectedDirection ? '' : 'disabled', !!c.selectedDirection)}</div></section>`;
  }
  function candidatesCard(c) {
    if (!c.batch) return '';
    const direction = DIRECTION_TEMPLATES.find(d => d.id === c.batch.directionId);
    return `<section class="dc-card"><div class="dc-section-title"><h3>候选方案 · ${safe(direction.title)}</h3>${badge('交互示意 · 非真实生成')}</div><p class="dc-muted">三张图共享同一组已确认约束，仅在改动幅度上变化，用于判断哪种程度更合适。</p><div class="dc-candidate-grid">${c.batch.options.map((o, i) => `<button class="dc-candidate ${c.selectedCandidate === i ? 'selected' : ''}" data-dc="select-candidate" data-index="${i}"><img src="${safe(o.src)}" alt="${safe(o.title)}概念示意"><span><b>${String.fromCharCode(65 + i)} · ${safe(o.title)}</b><i>${c.selectedCandidate === i ? '✓' : '○'}</i></span><small>${safe(o.note)}</small></button>`).join('')}</div><div class="dc-panel-actions-inline">${button('← 换一个方向', 'back-direction')}${button('保存为版本', 'save-version', '', true)}</div></section>`;
  }
  function composer(c) {
    return `<div class="dc-composer-area"><div class="dc-composer">${c.image ? `<div class="dc-attachment"><img src="${safe(c.image.url)}" alt="待发送场地图片"><span>${safe(c.image.name)}</span>${button('×', 'remove-image', 'aria-label="移除待发送图片"')}</div>` : ''}<textarea id="dc-prompt" aria-label="设计需求" placeholder="描述你的设计想法、约束或补充要求…" rows="2">${safe(c.draft)}</textarea><div class="dc-compose-tools">${button('＋ 场地图片', 'upload')}<input type="file" id="dc-upload" accept="image/png,image/jpeg,image/webp" hidden><span>Enter 发送 · Shift + Enter 换行</span><button class="dc-send" data-dc="send" aria-label="发送需求">↑</button></div></div><div class="dc-composer-note">本地原型 · 需求解析、案例检索与出图均为模拟，正式方案需专业确认</div></div>`;
  }
  function decisionTab(c) {
    return `<div class="dc-panel-heading"><div class="dc-section-title"><h3>当前决策</h3></div><p>与对话中最新一轮保持同步，可追溯是谁改了什么。</p></div><div class="dc-decision-snapshot"><div><span>本轮需求</span><p>${c.requirement ? safe(c.requirement) : '尚未提出需求'}</p></div><div><span>已确认约束</span><p>${c.constraints.map(x => safe(x.label)).join('、') || '—'}</p></div><div><span>AI 识别变量</span><p>${c.variables.map(x => safe(x.label)).join('、') || '—'}</p></div><div><span>当前方向</span><p>${c.selectedDirection ? safe(DIRECTION_TEMPLATES.find(d => d.id === c.selectedDirection).title) : '尚未选择'}</p></div><div><span>待确认事项</span><p>${c.openQuestions.map(safe).join('；') || '—'}</p></div></div><div class="dc-event-log"><b>最近操作</b>${c.events.length ? `<ol>${c.events.slice(-5).reverse().map(e => `<li><b>${safe(e.type)}</b><small>${safe(e.by)} · ${time(e.at)}</small></li>`).join('')}</ol>` : '<p class="dc-muted">尚无操作记录</p>'}</div>`;
  }
  function versionsTab(c) {
    return `<div class="dc-panel-heading"><div class="dc-section-title"><h3>版本记录</h3>${badge(c.versions.length + ' 个版本')}</div><p>保存每轮需求、方向与成果快照，可追溯迭代过程。</p></div>${c.versions.length ? `<div class="dc-timeline">${c.versions.slice().reverse().map(v => `<article class="dc-version-card"><div class="dc-section-title"><b>${safe(v.number)}</b></div><h4>${safe(v.title)}</h4><p>${safe(v.requirement)}</p><small>${time(v.at)} · ${safe(v.by)}</small><div class="dc-panel-actions-inline">${button('查看详情', 'version-detail', `data-id="${v.id}"`)}</div></article>`).join('')}</div>` : empty('还没有保存版本', '确认决策、选择方向并生成候选后，即可保存本轮版本。')}`;
  }
  function workTab(c) {
    return `<div class="dc-panel-heading"><div class="dc-section-title"><h3>项目 / 任务</h3></div><p>汇集当前项目的成果与待办，与设计助手（旧版）共享项目数据。</p></div><div class="dc-project-card"><small>当前关联项目</small><b>${safe(projectName(c.projectId))}</b>${c.projectId ? button('查看项目详情 ↗', 'project') : button('关联项目 →', 'associate')}</div>${empty('任务管理即将开放', '当前版本聚焦需求—方向—候选的设计探索主流程，任务跟进将在下一阶段接入。')}`;
  }
  function reportsTab() {
    return `<div class="dc-panel-heading"><div class="dc-section-title"><h3>报告</h3></div><p>从已确认的版本整理交付文档。</p></div>${empty('报告生成将在成果确认后开放', '先完成一轮需求确认、方向选择与候选保存，报告能力会在后续版本中接入。')}`;
  }
  function panelBody(c) {
    if (activeTab === 'decision') return decisionTab(c);
    if (activeTab === 'versions') return versionsTab(c);
    if (activeTab === 'work') return workTab(c);
    return reportsTab(c);
  }

  function renderCopilot() {
    const c = current();
    const cards = c.stage === 'decision' ? decisionCard(c) : c.stage === 'direction' ? directionsCard(c) : c.stage === 'candidates' ? candidatesCard(c) : '';
    return `<div class="dc-workspace ${collapsed ? 'panel-collapsed' : ''}"><div class="dc-workspace-bar"><div><span class="dc-live-dot"></span><b>设计助手 · 新版</b><span class="dc-bar-divider">/</span><span class="dc-bar-subtitle">需求 → 决策 → 方向 → 候选 → 版本</span></div><div>${button('历史对话', 'toggle-history', 'class="dc-mobile-toggle"')}${button(collapsed ? '展开工作管理' : '工作管理', 'toggle-panel')}</div></div><div class="dc-grid">${history(c)}<section class="dc-conversation"><header class="dc-conversation-head"><div><h2>${safe(c.title)}</h2><button data-dc="rename" aria-label="修改标题">✎</button></div><label><span>▦</span><select id="dc-project" aria-label="关联项目">${projectOptions(c.projectId)}</select></label></header><div class="dc-thread" aria-label="设计对话内容">${c.messages.length ? `<div class="dc-date-separator">${new Date(c.createdAt).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })} · 设计记录</div>${messages(c)}` : welcome()}${cards}</div>${composer(c)}</section><aside class="dc-management ${panelOpen ? 'mobile-open' : ''}" aria-label="工作管理"><div class="dc-management-title"><div><span>◫</span><b>工作管理</b></div>${button('收起', 'close-panel')}</div><div class="dc-tabs" role="tablist">${tabs.map(([key, label]) => `<button role="tab" aria-selected="${activeTab === key}" data-dc="tab" data-tab="${key}" class="${activeTab === key ? 'active' : ''}">${label}</button>`).join('')}</div><div class="dc-panel">${panelBody(c)}</div></aside></div></div>`;
  }

  function send(c) {
    const text = c.draft.trim(); if (!text && !c.image) { toast('请先输入设计需求或添加场地图片'); return; }
    const m = { id: id(), role: 'user', text: text || '请分析上传的场地图片，并整理设计需求。', image: c.image, at: now(), by: actor() };
    c.messages.push(m); c.image = null; c.draft = '';
    if (c.title === '新设计探索') c.title = m.text.slice(0, 22);
    c.requirement = c.requirement ? c.requirement + '；' + m.text : m.text;
    parseText(c, c.requirement);
    c.confirmed = null; c.stage = 'decision'; c.directions = []; c.selectedDirection = null; c.batch = null;
    c.messages.push({ id: id(), role: 'assistant', at: now(), text: '我已记录本轮需求，并识别了可能相关的设计变量与约束。请在下方核对，确认后我会结合案例给出设计方向。' });
    event(c, '提出需求', m.text); save();
  }
  function confirmDecision(c) {
    if (!c.requirement.trim()) { toast('请先填写需求摘要'); return; }
    c.confirmed = { by: actor(), at: now() };
    c.directions = DIRECTION_TEMPLATES.map(d => ({ ...d }));
    c.stage = 'direction';
    c.messages.push({ id: id(), role: 'system', at: now(), text: '本轮决策已确认，以下是结合案例推荐的 3 个设计方向。' });
    event(c, '确认决策', c.requirement); save();
  }
  function selectDirection(c, dirId) { c.selectedDirection = dirId; save(); }
  function generateCandidates(c) {
    if (!c.selectedDirection) { toast('请先选择一个设计方向'); return; }
    const direction = DIRECTION_TEMPLATES.find(d => d.id === c.selectedDirection);
    c.batch = { id: id(), directionId: direction.id, at: now(), options: [
      { title: '保守改造', src: 'assets/candidate-a.svg', note: VARIANT_NOTE.a },
      { title: '平衡改造', src: 'assets/candidate-b.svg', note: VARIANT_NOTE.b },
      { title: '强化表达', src: 'assets/candidate-c.svg', note: VARIANT_NOTE.c },
    ] };
    c.selectedCandidate = 0; c.stage = 'candidates';
    c.messages.push({ id: id(), role: 'assistant', at: now(), text: `已基于「${direction.title}」方向生成 3 张候选示意图，共享同一组约束，仅改动幅度不同。` });
    event(c, '生成候选方案', direction.title); save();
  }
  function saveVersion(c) {
    if (!c.batch) { toast('请先生成候选方案'); return; }
    const direction = DIRECTION_TEMPLATES.find(d => d.id === c.batch.directionId), option = c.batch.options[c.selectedCandidate];
    showModal('保存为版本', `<div class="dc-modal-note">将保存本轮需求、方向、约束与选中成果。</div><label class="dc-field">版本名称<input id="dc-version-title" maxlength="80" value="${safe(c.title + ' · ' + direction.title + ' · ' + option.title)}"></label><label class="dc-field">本轮修改说明<textarea id="dc-version-note">${safe(c.requirement)}</textarea></label>`, button('取消', 'close') + button('保存版本', 'commit-version', '', true));
  }
  function commitVersion(c) {
    const title = document.getElementById('dc-version-title').value.trim(), note = document.getElementById('dc-version-note').value.trim();
    if (!title || !note) { toast('请填写版本名称和修改说明'); return; }
    const direction = DIRECTION_TEMPLATES.find(d => d.id === c.batch.directionId), option = c.batch.options[c.selectedCandidate];
    const number = 'V' + (c.versions.length + 1);
    const v = { id: id(), number, title, note, requirement: c.requirement, directionTitle: direction.title, constraints: clone(c.constraints), variables: clone(c.variables), output: clone(option), by: actor(), at: now() };
    c.versions.push(v); c.stage = 'saved';
    c.messages.push({ id: id(), role: 'system', text: `已保存 ${number}「${title}」。需求、方向与约束已归档，可在右侧版本记录中追溯。`, at: now() });
    event(c, '保存版本', `${number} · ${title}`); closeModal(); activeTab = 'versions'; save(); toast(`${number} 已保存`);
  }
  function versionDetail(c, versionId) {
    const v = c.versions.find(x => x.id === versionId); if (!v) return;
    showModal(`${v.number} · ${safe(v.title)}`, `<img class="dc-detail-image" src="${safe(v.output.src)}" alt="${safe(v.output.title)}"><p class="dc-muted">交互示意图 · ${safe(v.output.title)} · ${safe(v.directionTitle)}方向</p><h4>当时提出了什么需求</h4><p class="dc-pre">${safe(v.requirement)}</p><h4>约束条件</h4><p class="dc-pre">${v.constraints.map(x => safe(x.label)).join('、')}</p><div class="dc-audit-summary"><p>保存：${safe(v.by)} · ${fulltime(v.at)}</p></div>`, button('关闭', 'close'));
  }
  function showModal(title, body, actions = '') {
    modal(title, body, actions); const backdrop = document.querySelector('.modal-backdrop'); backdrop.removeAttribute('data-action');
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
    document.querySelector('.modal')?.classList.add('dc-modal');
    setTimeout(() => document.querySelector('.dc-modal input,.dc-modal textarea')?.focus(), 0);
  }
  function scrollEnd() { requestAnimationFrame(() => { const thread = document.querySelector('.dc-thread'); if (thread) thread.scrollTop = thread.scrollHeight; }); }

  const handlers = {
    new: () => newConversation(),
    switch: (c, b) => { db.activeId = b.dataset.id; historyOpen = false; save(); },
    rename: c => { showModal('修改对话标题', `<label class="dc-field">对话标题<input id="dc-title" maxlength="60" value="${safe(c.title)}"></label>`, button('取消', 'close') + button('保存标题', 'rename-save', '', true)); },
    'rename-save': c => { const title = document.getElementById('dc-title').value.trim(); if (!title) { toast('标题不能为空'); return; } c.title = title; closeModal(); save(); },
    tab: (c, b) => { activeTab = b.dataset.tab; panelOpen = true; collapsed = false; render(); },
    'toggle-history': () => { historyOpen = !historyOpen; panelOpen = false; render(); },
    'history-close': () => { historyOpen = false; render(); },
    'toggle-panel': () => { if (matchMedia('(max-width: 1050px)').matches) { panelOpen = !panelOpen; historyOpen = false; } else collapsed = !collapsed; render(); },
    'close-panel': () => { panelOpen = false; collapsed = true; render(); },
    suggest: (c, b) => { c.draft = b.dataset.text; save(); document.getElementById('dc-prompt')?.focus(); },
    send,
    upload: () => document.getElementById('dc-upload').click(),
    'remove-image': c => { c.image = null; save(); },
    'add-var': c => { c.variables.push({ id: id(), label: '新设计变量', value: '', source: '设计师手动添加' }); save(); },
    'remove-var': (c, b) => { c.variables = c.variables.filter(v => v.id !== b.dataset.id); save(); },
    'add-con': c => { c.constraints.push({ id: id(), label: '新约束条件', value: '', source: '设计师手动添加' }); save(); },
    'remove-con': (c, b) => { c.constraints = c.constraints.filter(v => v.id !== b.dataset.id); save(); },
    'confirm-decision': confirmDecision,
    'back-decision': c => { c.stage = 'decision'; save(); },
    'select-direction': (c, b) => selectDirection(c, b.dataset.id),
    'generate-candidates': generateCandidates,
    'select-candidate': (c, b) => { c.selectedCandidate = Number(b.dataset.index); save(); },
    'back-direction': c => { c.stage = 'direction'; c.batch = null; save(); },
    'save-version': saveVersion,
    'commit-version': commitVersion,
    'version-detail': (c, b) => versionDetail(c, b.dataset.id),
    associate: c => showModal('关联项目', `<label class="dc-field">选择项目<select id="dc-association">${projectOptions(c.projectId)}</select></label>`, button('取消', 'close') + button('确认关联', 'associate-save', '', true)),
    'associate-save': c => { c.projectId = document.getElementById('dc-association').value; event(c, '关联项目', projectName(c.projectId)); closeModal(); save(); },
    project: c => { state.activeProjectId = c.projectId; state.page = 'project-detail'; render(); },
    close: closeModal,
  };
  const previousRender = render;
  render = function () {
    if (state.page === 'assistant-v2') {
      document.getElementById('crumb-current').textContent = '设计助手 · 新版';
      document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === state.page));
      const previousScroll = document.querySelector('.dc-thread')?.scrollTop || 0;
      document.body.classList.add('design-workspace-page');
      document.getElementById('view').innerHTML = renderCopilot();
      const thread = document.querySelector('.dc-thread');
      if (thread && renderedConversationId === db?.activeId) thread.scrollTop = previousScroll; else scrollEnd();
      renderedConversationId = db?.activeId;
      return;
    }
    if (document.body.classList.contains('design-workspace-page') && state.page !== 'assistant') document.body.classList.remove('design-workspace-page');
    renderedConversationId = null;
    previousRender();
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-dc]'); if (!b || !state.currentRole || b.disabled) return;
    e.preventDefault(); e.stopPropagation(); const c = current(); handlers[b.dataset.dc]?.(c, b);
  });
  document.addEventListener('input', e => {
    if (!state.currentRole || state.page !== 'assistant-v2') return; const el = e.target, c = current();
    if (el.id === 'dc-search') { search = el.value; const pos = el.selectionStart; render(); const input = document.getElementById('dc-search'); input.focus(); input.setSelectionRange(pos, pos); return; }
    if (el.id === 'dc-prompt') { c.draft = el.value; clearTimeout(saveTimer); saveTimer = setTimeout(persist, 250); return; }
    if (el.id === 'dc-requirement') { c.requirement = el.value; clearTimeout(saveTimer); saveTimer = setTimeout(persist, 250); return; }
    if (el.dataset.var) { const v = c.variables.find(x => x.id === el.dataset.var); if (v) v.value = el.value; clearTimeout(saveTimer); saveTimer = setTimeout(persist, 250); }
    if (el.dataset.con) { const v = c.constraints.find(x => x.id === el.dataset.con); if (v) v.value = el.value; clearTimeout(saveTimer); saveTimer = setTimeout(persist, 250); }
  });
  document.addEventListener('change', e => {
    if (!state.currentRole || state.page !== 'assistant-v2') return; const el = e.target, c = current();
    if (el.id === 'dc-project') { c.projectId = el.value; event(c, '关联项目', projectName(c.projectId)); save(); }
    if (el.id === 'dc-upload') {
      const file = el.files?.[0]; if (!file) return; if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { toast('请选择 PNG、JPG 或 WebP 图片'); return; } if (file.size > 2 * 1024 * 1024) { toast('本地原型请上传 2 MB 以内的图片'); return; }
      const reader = new FileReader(); reader.onload = () => { c.image = { name: file.name, url: reader.result }; event(c, '添加场地图片', file.name); save(); }; reader.onerror = () => toast('图片读取失败，请重试'); reader.readAsDataURL(file);
    }
  });
  document.addEventListener('keydown', e => {
    if (e.target.id === 'dc-prompt' && e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); send(current()); }
    if (e.key === 'Escape' && state.page === 'assistant-v2') { closeModal(); historyOpen = false; panelOpen = false; render(); }
  });
  window.addEventListener('pagehide', () => { if (db && owner) persist(); });
})();
