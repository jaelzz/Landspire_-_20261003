/* Candidate reusable knowledge. Case facts remain in LandspireKnowledgeAtlas.
 * A method is a scoped synthesis, not an approved rule or a measured outcome.
 */
(function(){
  const base=window.LandspireKnowledgeAtlas;
  if(!base)return;
  const definitions={
    镜面水:'本库按主要视觉效果识别：以平静水面及倒影表达为主。圆形、台地、齐平等另记为形态属性。',
    静水:'普通平静水面；未明确以倒影为主要效果时使用这一名称。',
    坡面流水:'水沿有坡度的承载面流动；坡面形状、流向与承接水体分别记录。',
    附壁流水:'依附墙面或景墙流动的水景形式；与自由跌落的水帘、瀑布分别记录。',
    旱喷:'喷头与铺装区域结合的喷泉形式。可进入、可戏水及运行模式需另有方案依据。',
    雾森:'本库用于已明确的雾森设计；氛围喷雾不自动代表感应互动。',
    涌泉:'本库已确认的涌泉水形，与跳泉分别登记；以设计师确认及方案表达为依据。',
    跳泉:'本库已确认的跳泉水形；喷射方向、运行时段需在案例内单独记录。',
    叠水:'连续多级跌落的水流组织；形态上叠置但没有落水的池体不自动归入叠水。',
    跌水:'水从较高位置跌落至较低位置的水景形式，需明确上、下游对象。',
    水帘:'以帘状落水为主要表现的水景形式；是否承担水幕演出需单独确认。',
    瀑布:'方案明确为瀑布表现的水景形式；附壁、依附结构与演艺功能单独记录。'
  };
  const methods=[
    {id:'paired',name:'两侧水景界定入口通道',summary:'通过通道两侧的独立水景明确入口路径，同时形成入口氛围。',problem:'入口识别不足',goals:['空间引导','氛围营造'],refs:['C01','C02','S1-01','S2-01','S2-07','S3-05','S3-08'],condition:'案例采用两侧布置，中间保留通行空间；两侧可使用不同水景形式。可用宽度、通行需求需按新项目确认。',boundary:'入口引导策略获认可，不代表所有水景造型获认可。深圳V2方案二的锐利造型未被选择。'},
    {id:'enclose',name:'半围合水面界定外摆',summary:'以半围合水面划定餐饮外摆的边界，形成就餐氛围。',problem:'外摆空间缺少景观氛围',goals:['氛围营造'],refs:['H3-01'],condition:'来源为餐饮次入口外摆场景；各处水体彼此独立。',boundary:'当前仅有一个项目方案依据；甲方对该方案的认可不能直接推广为所有外摆场地的结论。'},
    {id:'performance',name:'水面与表演平台形成观赏中心',summary:'将镜面水、流水与可到达的实体平台组织为观赏中心，服务周边餐饮体验。',problem:'餐饮就餐环境吸引力不足',goals:['氛围营造','视觉焦点','停留休憩'],refs:['C13','C05'],condition:'案例均关联餐饮区域与可供表演的实体平台；各案例的保留改造方式和水流组织不同。',boundary:'表演平台并不意味着整套水景已具备水秀功能。秘境露台与溪谷森林的演艺说明需分别查看。'},
    {id:'modes',name:'旱喷与镜面水分时切换',summary:'在同一区域切换旱喷与镜面水模式，兼顾亲子活动和日常观赏。',problem:'活动空间与日常景观需要兼容',goals:['亲子参与','氛围营造'],refs:['C04'],condition:'来源为主入口广场环形区域；中央是永久固定的抬高地块。',boundary:'旱喷和镜面水不同时出现。中央地块不自动命名为舞台；排水、切换时间等工程参数待补。'},
    {id:'terrace',name:'多级水面组织高差',summary:'通过多标高水面及逐级落水组织景观层次，结合周边路径或休憩空间。',problem:'高差空间景观吸引力不足',goals:['空间引导','氛围营造'],refs:['C06','C07','S3-08','S3-10','H3-02'],condition:'只纳入已明确存在逐级落水的对象或组成部分。',boundary:'深圳V3方案二活动广场仅左侧为三级叠落，右侧为单级。多标高不必然代表水流逐级连通。'},
    {id:'single',name:'单侧水景引导入口',summary:'在场地范围受限时，以单侧水景组织入口边界和景观视线。',problem:'入口可用空间受限',goals:['空间引导','氛围营造'],refs:['S1-05','S2-03','S3-01','S3-10'],condition:'来源为深圳门户广场邻近下沉空间的情境。',boundary:'不同版本分别采用坡面汇流或台地跌落。V3未过会；布局逻辑认可不等于细部定案。'},
    {id:'wall',name:'附壁流水激活下沉界面',summary:'结合高差墙面，以附壁流水配合灯光及植物改善下沉空间的景观氛围。',problem:'下沉阴影空间吸引力不足',goals:['氛围营造','停留休憩'],refs:['S2-10','S3-02','S3-09'],condition:'源于同一项目水景方向的版本延续；并非三个独立项目的验证。',boundary:'V2水景效果获认可，植物与尺度仍需优化；V3尚未过会。底部收水构造尚未核定。'},
    {id:'retain',name:'保留既有水体优化亲水平台',summary:'保留原有静水，通过亲水、观景平台改善观看和休憩体验。',problem:'既有水体周边停留体验不足',goals:['停留休憩','氛围营造'],refs:['S1-06','S2-05','S2-11','S3-03','S3-12'],condition:'来源为深圳水岸广场；主要调整平台及水体露出部分。',boundary:'保留水体和平台造型是两项独立决策；V1平台未获满意评价，V2方案一条带平台获得较好反馈。'},
    {id:'season',name:'水面叠加季节主题',summary:'在镜面水基础上，采用夏日雾森、冬日喷泉灯光水秀形成主题变化。',problem:'景观主题识别度不足',goals:['氛围营造','引流打卡'],refs:['H3-05','H3-09'],condition:'来源为合肥V3与四季共舞方案，内街和中庭共享主题逻辑。',boundary:'各水体物理独立，未确认共用控制系统；冬日火焰感来自水与灯光表达，不是明火。'},
    {id:'street',name:'沿街设置观赏水景',summary:'将镜面水或坡面流水作为外街景观组成，以营造步行氛围。',problem:'沿街界面景观单调',goals:['氛围营造'],refs:['S2-06','S2-12','S3-04'],condition:'来源为深圳外街方案比选。',boundary:'V2甲方要求取消外街水景；V3再次提出有水景方案尚未过会。此处保留未采纳及待讨论的案例。'},
    {id:'mist',name:'植物间点缀雾森',summary:'在沿街植物之间点缀雾森，提出柔化场地氛围的方案。',problem:'沿街界面景观单调',goals:['氛围营造'],refs:['S1-07'],condition:'来源为深圳V1外街提案。',boundary:'甲方不喜欢朦胧效果，明确不要该雾森方案。'},
    {id:'flower',name:'复合水景与坐凳形成停留中心',summary:'组织镜面水、喷泉、跳泉及水秀，结合周边可移动坐凳形成观赏与休憩节点。',problem:'既有水景缺少景观吸引力',goals:['视觉焦点','氛围营造','停留休憩'],refs:['C12'],condition:'来源为成都活力露台重新设计的水景，关联餐饮与零售业态。',boundary:'多种水景可以同时出现；甲方尚未讨论，运行效果未作建成验证。'}
  ].map(m=>({...m,id:'method:'+m.id,status:'案例提炼 · 待专业确认'}));
  const records=base.records,unique=a=>[...new Set(a)];
  const concepts=[];const edges=[];
  function add(id,name,kind,description='',refs=[]){let n=concepts.find(n=>n.id===id);if(!n){n={id,name,kind,description,refs:[]};concepts.push(n);}n.refs=unique([...n.refs,...refs]);return n;}
  function link(from,to,label,refs){edges.push({id:'KE-'+edges.length,from,to,label,refs:unique(refs),status:'案例提炼 · 待专业确认'});}
  base.taxonomy.forEach(([group,types])=>types.forEach(t=>{const n=add('water:'+t,t,'水景类型',definitions[t]||'已预留的水景术语。具体判断口径与案例待补充。',records.filter(r=>r.hasWater&&r.types.includes(t)).map(r=>r.id));n.group=group;}));
  methods.forEach(m=>{
    const cases=m.refs.map(id=>records.find(r=>r.id===id)).filter(Boolean);
    add(m.id,m.name,'设计做法',m.summary,m.refs);
    const p=add('problem:'+m.problem,m.problem,'场地问题','从项目口述中归纳的问题概念，具体条件请对照案例。',m.refs);link(m.id,p.id,'针对',m.refs);
    m.goals.forEach(g=>{const n=add('goal:'+g,g,'设计目标','表示方案的设计意图，不代表已测量的建成效果。',m.refs);link(m.id,n.id,'意在实现',m.refs);});
    unique(cases.flatMap(r=>r.types)).forEach(t=>{const refs=cases.filter(r=>r.types.includes(t)).map(r=>r.id);add('water:'+t,t,'水景类型',definitions[t]||'按当前登记口径记录的水景类型。',refs);link(m.id,'water:'+t,'案例采用',refs);});
    unique(cases.map(r=>r.spaceType)).forEach(t=>{const refs=cases.filter(r=>r.spaceType===t).map(r=>r.id);const n=add('space:'+t,t,'空间场景','已出现这一做法的案例场景。是否适用于新场地需结合条件判断。',refs);link(m.id,n.id,'案例场景',refs);});
  });
  // Commercial organization dimension: independent from design specialty, derived from project classification.
  const orgTypes=unique(base.projects.map(p=>p.organization).filter(Boolean));
  orgTypes.forEach(org=>{
    const refs=records.filter(r=>{const proj=base.projects.find(p=>p.name===r.project);return proj&&proj.organization===org;}).map(r=>r.id);
    add('org:'+org,org,'商业组织形式','项目的商业组织形式分类，与水景类型、空间场景等设计维度相互独立，用于对照不同业态下的问题与做法差异。',refs);
  });
  // Generic spatial interface dimension: cross-project界面概念，区别于具体项目里的空间命名。
  const interfaceDefs={
    '外部空间':'项目红线外或与城市公共空间直接相邻的开放场地；当前案例尚未按此口径单独标注。',
    '沿接界面':'建筑／商业边界与公共通行空间之间的过渡界面；当前案例尚未按此口径单独标注。',
    '消极界面':'人流到达度低、缺少主动使用功能的边界空间；当前案例尚未按此口径单独标注。'
  };
  Object.entries(interfaceDefs).forEach(([name,desc])=>{add('space:'+name,name,'空间场景',desc,[]).interfaceGroup=true;});
  const activeInterface=concepts.find(n=>n.id==='space:积极界面');
  if(activeInterface)activeInterface.interfaceGroup=true;
  // Overview entry point aggregating the six top-level dimensions, used as the default landing focus.
  const overviewRefs=unique(records.filter(r=>r.hasWater).map(r=>r.id));
  add('overview','总览','总览','从商业组织形式、场地问题出发，浏览已沉淀的水景类型、空间场景、设计目标与设计做法；点击任一入口继续下钻，所有推导关系仍标注“案例提炼 · 待专业确认”。',overviewRefs);
  unique([...orgTypes.map(o=>'org:'+o),'water:镜面水','space:主入口空间','problem:入口识别不足','goal:氛围营造','method:paired']).forEach(id=>{const target=concepts.find(n=>n.id===id);if(target)link('overview',id,'总览入口',target.refs.length?target.refs:overviewRefs);});
  window.LandspireKnowledgeExploration={version:'0.5',concepts,edges,methods,definitions,scope:'基于三项目方案与专业口述的候选知识；未形成通用有效性结论。'};
})();
