// Conversation-first, project-neutral landing experience.
state.sessionActive=false;
state.uploadedImage=null;
state.sessionImage=null;
state.chatMessages=[];
state.sessionResponse=false;
state.sessionGenerated=false;
state.sessionDraftSaved=false;
state.sessionGenerationMode='reference';
state.sessionSelected=0;
state.sessionPreserve=['场地关系','视角','总体布局'];
state.sessionAdjust=['铺装','入口体验节点'];

function renderAssistant(){
  if(!state.sessionActive){
    return `<div class="assistant-home"><div class="assistant-intro"><div class="assistant-symbol">✳</div><div class="eyebrow">LANDSCAPE DESIGN ASSISTANT</div><h1>把现场问题，变成下一步设计</h1><p>上传场地图片，描述你想改善的地方。助手会先理解设计意图，再和你一起探索可行方向。</p></div>${composeBox(false)}<div class="prompt-suggestions"><button class="suggestion-chip" data-action="fill-suggestion" data-text="这片铺装看起来有些细碎，我希望空间更简洁、更整体。">铺装太细碎，想简化</button><button class="suggestion-chip" data-action="fill-suggestion" data-text="我想提升入口识别度，但希望保留现有场地布局。">提升入口识别</button><button class="suggestion-chip" data-action="fill-suggestion" data-text="请帮我分析这张场地图片有哪些可以优化的设计方向。">分析场地设计机会</button></div><div class="privacy-footnote">${state.activeProjectId==='H001'?'当前会话已关联华润合肥万象城 · 新会话可重新开始':'新会话不会预载任何项目或案例 · 你提供资料后，助手再开始工作'}</div></div>`;
  }
  let userMessages=state.chatMessages.map(m=>`<div class="chat-message ${m.role}">${m.role==='assistant'?'<div class="chat-avatar">✳</div>':''}<div class="chat-bubble">${m.image?`<img class="chat-image" src="${m.image.url}" alt="用户上传的场地图片"><div class="inline-image-note">本次会话上传 · ${esc(m.image.name)}</div>`:''}${m.text?`<div>${esc(m.text).replace(/\n/g,'<br>')}</div>`:''}</div>${m.role==='user'?'<div class="chat-avatar" style="background:#e8dfd2;color:#806a4c">我</div>':''}</div>`).join('');
  const activeProject=designerProjects?.find(p=>p.id===state.activeProjectId);
  return `<div class="chat-home"><div class="session-title">新设计会话 <span style="margin-left:7px">· ${activeProject?esc(activeProject.name):'未关联项目'}</span><button class="btn btn-sm" data-action="reset-session" style="float:right">＋ 新会话</button></div><div class="chat-thread">${userMessages}${state.sessionResponse?responseCard():''}${state.sessionGenerated?sessionCandidates():''}${state.sessionDraftSaved?`<div class="session-system-note">候选方向已保存为本次会话草稿；关联项目后可纳入项目版本链。</div>`:''}</div><div class="conversation-compose">${composeBox(true)}<div class="chat-disclaimer">AI 输出为设计探索建议；正式方案、规范、成本和施工条件需由专业人员确认。</div></div></div>`;
}

function composeBox(inSession){
  let img=state.uploadedImage;
  const activeProject=designerProjects?.find(p=>p.id===state.activeProjectId);
  const projects=typeof accessibleProjects==='function'?accessibleProjects():(designerProjects||[]);
  return `<div class="assistant-compose">${img?`<div class="upload-preview"><img src="${img.url}" alt="待分析的现场图片"><div class="upload-info"><b>${esc(img.name)}</b><small>已添加到本次会话</small></div><button class="upload-remove" data-action="remove-upload" aria-label="移除图片">×</button></div>`:''}<textarea id="assistant-prompt" class="compose-area" placeholder="${inSession?'继续描述你的想法，或补充设计约束…':'例如：这片铺装太细碎了，我想简化铺装，并探索更有识别度的入口节点。'}"></textarea><input id="image-upload" type="file" accept="image/*" hidden><div class="compose-bottom"><div class="compose-tools"><button class="compose-tool" data-action="add-image">＋ 添加场地图片</button><label class="project-picker-wrap" aria-label="选择关联项目"><span>项目</span><select class="project-picker" id="active-project-picker"><option value="">未关联项目</option>${projects.map(p=>`<option value="${esc(p.id)}" ${state.activeProjectId===p.id?'selected':''}>${esc(p.name)}${p.placeholder?' · 待补资料':''}</option>`).join('')}</select></label></div><button class="send-btn" data-action="send-message" aria-label="发送" title="开始设计">↑</button></div></div>`;
}

function responseCard(){
  const userItems=state.chatMessages.filter(m=>m.role==='user');
  const text=userItems.length?userItems[userItems.length-1].text||'':'';
  const mentionsWater=/水景|水池|水面|水井|water/i.test(text);
  const mentionsPaving=/铺装|地面|地坪|细碎|铺地|paving/i.test(text);
  const object=mentionsPaving?'铺装':(/灯光|照明/.test(text)?'灯光':(/植物|绿化/.test(text)?'植物':'设计重点'));
  return `<div class="response-card"><div class="response-title"><span class="assistant-symbol">✳</span>我先确认一下设计意图</div><p>${state.sessionImage?'我已收到你上传的场地图片。':''}我理解你希望${mentionsPaving?'简化过于细碎的铺装表达':'优化当前场地的设计表达'}，并让空间重点更清晰。${mentionsWater?'你提到的水景，我会先作为一个可探索的入口体验方向，而不是默认当成已确定方案。':''}</p><div class="response-ask"><b>我建议先按这个边界探索：</b><br>默认保留场地关系、拍摄视角和总体布局，只调整${object}${mentionsWater?'与入口体验节点':''}；水景作为可选方向进行比较。成本和维护条件在缺少依据时标记为待评估。</div><div class="control-row" style="margin-top:11px"><span class="small-label">默认保留</span>${['场地关系','视角','总体布局'].map(x=>`<button class="control-chip ${state.sessionPreserve.includes(x)?'selected':''}" data-action="session-preserve" data-item="${x}">${state.sessionPreserve.includes(x)?'✓ ':''}${x}</button>`).join('')}<span class="small-label" style="margin-left:5px">调整对象</span>${[object,...(mentionsWater?['水景节点']:[])].map(x=>`<button class="control-chip ${state.sessionAdjust.includes(x)?'selected':''}" data-action="session-adjust" data-item="${x}">${state.sessionAdjust.includes(x)?'✓ ':''}${x}</button>`).join('')}</div><div class="response-actions"><button class="btn btn-primary" data-action="generate-session-images" data-mode="${state.sessionImage?'reference':'text'}">按此生成 3 张候选方向 →</button><button class="btn" data-action="edit-session-direction">修改调整范围</button><span class="small-label" style="align-self:center">${state.sessionImage?'参考图改图':'文字生成'} · 模拟出图</span></div></div>`;
}

function sessionCandidates(){
  const imgs=['candidate-a.svg','candidate-b.svg','candidate-c.svg'];
  const userText=(state.chatMessages||[]).filter(m=>m.role==='user').map(m=>m.text||'').join(' ');
  const hasWater=/水景|水池|水面|水井/.test(userText),hasLighting=/灯光|照明|夜景/.test(userText),focus=hasWater?'入口体验与水景节点':hasLighting?'夜间识别与灯光':'铺装简化与空间整体性';
  const activeProject=designerProjects?.find(p=>p.id===state.activeProjectId);
  const refs=(records||[]).filter(r=>r.state==='已发布'&&r.auth===true&&((state.activeProjectId&&r.level==='项目私有'&&(r.projectId===state.activeProjectId||String(r.source||'').includes(state.activeProjectId)))||(r.level!=='项目私有'&&/跨项目|组织内部复用|公司内部复用/i.test(`${r.permission||''} ${r.reuseScope||''}`))));
  const referencePanel=refs.length?`<div class="candidate-evidence"><div class="candidate-evidence-head"><div><b>本轮设计依据</b><small>仅展示当前项目可见或明确获准跨项目复用的已发布资料</small></div><span class="pill green">${refs.length} 条可用依据</span></div>${refs.map(r=>`<article class="candidate-reference"><span class="candidate-reference-icon">▤</span><div><b>${esc(r.name)}</b><small>${esc(r.source)} · ${r.level==='项目私有'?'本项目资料':'授权复用资料'}</small><p>${r.level==='项目私有'?'作为当前项目的历史资料对照；不将其视为新的设计结论。':'与本轮设计问题相关的已发布知识，可作为方向参考。'}</p></div>${pill('已发布且可用','green')}</article>`).join('')}</div>`:`<div class="candidate-evidence candidate-evidence-empty"><div class="candidate-evidence-head"><div><b>本轮设计依据</b><small>检索范围：${activeProject?esc(activeProject.name)+' 项目资料 + 有权复用的公司知识':'有权复用的公司知识'}</small></div><span class="pill gray">暂无匹配案例</span></div><p>当前没有检索到符合权限与发布条件的历史案例。以下方向依据你提供的场地图片和文字描述整理，不引用未审核或授权不明的资料。</p></div>`;
  const titles=['铺装简化','入口体验节点','灯光与导向'];
  const rationales=[`回应“铺装太细碎”的问题，优先减少图案变化，保留必要的通行与导向。`,`将入口识别作为独立设计重点；${hasWater?'水景作为可选方向，需另行评估成本与维护':'可对比水景、标识或特色构筑物等节点方向'}。`,`通过光环境与路径提示补充到达识别；若当前任务不涉及夜间体验，可在下一轮替换此方向。`];
  return `<div class="session-candidates"><div class="section-row"><div><h3>候选探索方向</h3><p>本轮重点：${focus} · 请先看设计思路，再选择方向继续细化</p></div>${pill(activeProject?activeProject.name:'本次会话','gray')}</div><div class="candidate-recommendation"><span class="recommendation-mark">✳</span><div><b>Landspire 的设计建议</b><p>保留你指定的场地关系、视角和总体布局，围绕“${focus}”生成 3 个差异化探索方向。成本和维护条件缺少工程依据时标记为待评估。</p><div class="recommendation-tags">${(state.sessionPreserve||[]).map(x=>pill(`保留 · ${x}`,'gray')).join('')}${(state.sessionAdjust||[]).map(x=>pill(`调整 · ${x}`,'green')).join('')}</div></div></div>${referencePanel}<div class="candidate-grid">${imgs.map((im,i)=>`<div class="candidate ${state.sessionSelected===i?'selected':''}" data-action="session-select" data-index="${i}"><img src="assets/${im}" alt="候选方向示意图 ${i+1}"><div class="candidate-foot"><b>${titles[i]}</b><span class="mock-label">界面示意</span><p>${rationales[i]}</p></div></div>`).join('')}</div><div class="response-actions" style="margin-top:10px"><button class="btn btn-primary btn-sm" data-action="save-session-draft">保存为本次会话草稿</button><button class="btn btn-sm" data-action="regenerate-session">调整描述再生成</button><button class="btn btn-sm" data-action="nominate-knowledge">提名为可复用知识候选</button></div><div class="small-label" style="margin-top:8px">当前候选为交互示意；提名仅提交治理审核，不会自动公开或跨项目复用。</div></div>`;
}

function sessionSend(){
  const input=document.getElementById('assistant-prompt');
  const text=input?.value.trim()||'';
  if(!text&&!state.uploadedImage){toast('先描述设计问题，或添加一张场地图片');return}
  state.sessionActive=true;
  const sentImage=state.uploadedImage?{...state.uploadedImage}:null;
  state.chatMessages.push({role:'user',text,image:sentImage});
  if(sentImage)state.sessionImage=sentImage;
  state.uploadedImage=null;
  state.sessionResponse=true;
  state.sessionGenerated=false;
  state.sessionDraftSaved=false;
  state.sessionGenerationMode=state.sessionImage?'reference':'text';
  render();
  setTimeout(()=>document.querySelector('.chat-thread')?.scrollIntoView({block:'end',behavior:'smooth'}),60);
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
  if(['add-image','send-message','remove-upload','fill-suggestion','reset-session','generate-session-images','session-select','save-session-draft','regenerate-session','session-preserve','session-adjust','edit-session-direction'].includes(a)){
    e.preventDefault();e.stopImmediatePropagation();
    if(a==='add-image'){document.getElementById('image-upload')?.click();return}
    if(a==='send-message'){sessionSend();return}
    if(a==='remove-upload'){if(state.uploadedImage?.url?.startsWith('blob:'))URL.revokeObjectURL(state.uploadedImage.url);state.uploadedImage=null;render();return}
    if(a==='fill-suggestion'){let ta=document.getElementById('assistant-prompt');if(ta){ta.value=b.dataset.text;ta.focus()}return}
    if(a==='reset-session'){state.sessionActive=false;state.uploadedImage=null;state.sessionImage=null;state.chatMessages=[];state.sessionResponse=false;state.sessionGenerated=false;state.sessionDraftSaved=false;state.step=1;render();return}
    if(a==='generate-session-images'){state.sessionGenerationMode=b.dataset.mode;state.sessionGenerated=true;state.sessionSelected=0;render();toast('已展示 3 个模拟候选方向');return}
    if(a==='session-select'){state.sessionSelected=Number(b.dataset.index);render();return}
    if(a==='save-session-draft'){state.sessionDraftSaved=true;render();toast('已保存到本次会话草稿（演示）');return}
    if(a==='regenerate-session'){state.sessionGenerated=false;render();document.getElementById('assistant-prompt')?.focus();return}
    if(a==='session-preserve'){state.sessionPreserve=state.sessionPreserve.includes(b.dataset.item)?state.sessionPreserve.filter(x=>x!==b.dataset.item):[...state.sessionPreserve,b.dataset.item];render();return}
    if(a==='session-adjust'){state.sessionAdjust=state.sessionAdjust.includes(b.dataset.item)?state.sessionAdjust.filter(x=>x!==b.dataset.item):[...state.sessionAdjust,b.dataset.item];render();return}
    if(a==='edit-session-direction'){toast('可调整上方保留范围和设计对象后再生成');return}
  }
},true);

document.addEventListener('change',e=>{
  if(e.target.id==='active-project-picker'){
    const draft=document.getElementById('assistant-prompt')?.value||'';
    state.activeProjectId=e.target.value||null;
    render();
    const prompt=document.getElementById('assistant-prompt');if(prompt)prompt.value=draft;
    if(state.activeProjectId)toast(`本次设计已关联${designerProjects.find(p=>p.id===state.activeProjectId)?.name||'所选项目'}`);
    return;
  }
  if(e.target.id!=='image-upload')return;
  const file=e.target.files?.[0];if(!file)return;
  if(!file.type.startsWith('image/')){toast('请选择图片文件');return}
  if(file.size>15*1024*1024){toast('图片大小请控制在 15 MB 以内');return}
  if(state.uploadedImage?.url?.startsWith('blob:'))URL.revokeObjectURL(state.uploadedImage.url);
  state.uploadedImage={name:file.name,url:URL.createObjectURL(file),type:file.type};
  render();toast('场地图片已添加到本次会话');
});

document.addEventListener('keydown',e=>{
  if(e.target.id==='assistant-prompt'&&(e.key==='Enter'&&!e.shiftKey)){e.preventDefault();sessionSend()}
});

render();
