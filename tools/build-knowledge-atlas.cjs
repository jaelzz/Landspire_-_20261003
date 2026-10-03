// Read-only prototype data: R03 register + explicitly scoped designer statements.
// This builds frontend assets; it does not overwrite any source workbook.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const rows = JSON.parse(fs.readFileSync(path.join(root,'assets/knowledge-samples/register-r03.json'),'utf8'));
const amendments = {};
function set(ids, data) { ids.split(',').forEach(id => amendments[id] = {...amendments[id], ...data}); }
set('C01,C02',{problem:'场地开阔平坦，玻璃立面入口识别不清，缺少视觉焦点。',strategy:'两处独立水体夹出中间通行空间，引导人走向次入口。',goals:'空间引导、氛围营造',feedback:'认可入口引导逻辑；未明确对所有细部的评价。',spaceType:'次入口空间',system:'左右各一处独立水体'});
set('C01',{form:'镜面水与邻近铺装齐平',components:['左侧镜面水'],quote:'我们就贴合这个场地做了一个贴地的镜面水。'});
set('C02',{form:'自由曲线顶部、翻起的坡面',components:['坡面流水'],flow:'远离行人的高处向靠近通行空间的低处缓慢流动',quote:'人行的这个地方是比较低的，距离我们人比较远的是高的。'});
set('C04',{problem:'主入口需兼容品牌活动、临时活动和日常景观吸引力。',strategy:'同一区域分时切换旱喷与镜面水，中央固定抬高地块可供表演。',system:'同一水景区域，两种互斥模式',form:'环形水景区域略低于周围地面；中央地块固定抬高',components:['环形水景区域','中央固定抬高地块'],modes:['旱喷模式：亲子戏水','镜面水模式：围合中央表演地块'],modeRule:'旱喷与镜面水不同时出现；中央地块不命名为舞台',feedback:'甲方未讨论',spaceType:'主入口空间',quote:'有旱喷就没有镜面水，有镜面水就没有旱喷。'});
set('C05',{problem:'普通下行楼梯缺少吸引力，餐饮外摆就餐环境欠佳。',strategy:'圆碟状楼梯结合水帘与镜面水，连接固定水舞台，形成餐饮区视觉焦点。',goals:'空间引导、氛围营造、引流打卡、视觉焦点',components:['水帘','镜面水','水舞台'],flows:[['水帘','落入','镜面水']],operation:'分时运行、活动模式、水幕表演',feedback:'甲方未讨论',spaceType:'下沉广场',quote:'水帘会落入到这个镜面水。楼梯……下达到这个镜面水中的……水舞台。'});
set('C06',{types:'瀑布、镜面水、叠水',problem:'下沉空间吸引力弱，需要停留空间及通往溪谷森林餐饮区的路径引导。',strategy:'廊桥侧瀑布与对面楼梯圆碟叠水分别组织；休憩模块面向瀑布。',system:'两套独立水景：廊桥侧瀑布、楼梯侧圆碟叠水',components:['廊桥侧瀑布','楼梯侧圆碟叠水'],flow:'各圆碟盛有镜面水，上一级跌落至下一级；与廊桥侧瀑布独立',goals:'空间引导、氛围营造、视觉焦点、引流打卡、停留休憩',operation:'光影瀑布表演、分时运行、活动模式',feedback:'甲方未讨论',spaceType:'下沉广场',quote:'它这个小圆碟子里边是各自盛有镜面水……从一个小圆碟跌落到下一个小圆碟。'});
set('C07',{types:'镜面水、叠水',form:'圆碟状、多标高；已删除水盒',problem:'连接休闲广场与上层商业的楼梯缺少吸引力，活动人群需要休憩空间。',strategy:'镜面水圆碟逐级跌落，与绿化及休憩模块共同组织楼梯。',flow:'上一级圆碟流入下一级圆碟',feedback:'甲方暂未确认',quote:'删掉水盒。',spaceType:'节点空间'});
set('C12',{problem:'既有普通圆形水景缺少景观吸引力，周边为餐饮与零售。',strategy:'重新设计花瓣语言的复合水景，结合可移动坐凳形成观赏与休憩中心。',treatment:'重新设计水景；原池结构处置未明确',system:'镜面水、喷泉、跳泉可同时出现',components:['镜面水','喷泉','跳泉'],operation:'分时运行、活动模式、水秀（方案中明确）',feedback:'甲方未讨论',quote:'重新做的水景。可以同时出现。方案中已经明确。',spaceType:'屋顶平台'});
set('C13',{problem:'餐饮露台景观普通，原有圆形水池氛围不足，外摆缺少可观赏的视觉中心。',strategy:'保留并改造原水景，将坡面流水接入圆形镜面水，关联可供音乐表演的实体平台。',treatment:'保留并改造',components:['坡面流水','圆形镜面水','周边收水口','水舞台'],flows:[['坡面流水','流入','圆形镜面水'],['圆形镜面水','排入','周边收水口'],['水舞台','关联','圆形镜面水']],form:'圆形镜面水、自由曲线顶部、圆形平台',goals:'氛围营造、视觉焦点、引流打卡、停留休憩',feedback:'本次口述未明确甲方评价',spaceType:'屋顶平台',quote:'从那个曲线顶部出水口……顺着这个斜坡面缓慢地向下流到镜面水里。',image:'assets/knowledge-samples/E04.png',pdf:'assets/knowledge-samples/E01.pdf#page=31'});
set('S1-01',{types:'镜面水、涌泉',form:'抬高、台地',system:'左右两处独立水景，中间为入口通道',problem:'两条外街交汇的主入口需要清晰引导与景观氛围。',strategy:'两侧水景界定入口通道。',feedback:'认可两侧水景引导入口及成本投入方向；认为水景效果粗糙，具体原因未明确。',quote:'它这边不是跳泉，是涌泉，我写错了。'});
set('S1-04',{problem:'电梯、楼梯附近的下沉阴影空间缺少景观吸引力。',strategy:'结合既有高差，在靠近电梯的位置设置瀑布。',form:'靠近电梯设置；并非附壁',feedback:'认可水景激活空间的逻辑；不喜欢瀑布形式，建议改成附壁流水。',uncertainty:'结构实现困难是团队对甲方建议的推测，不能记为甲方明确结论。',quote:'它没有贴着墙面设置，它反而是贴着这个电梯做的。'});
set('S1-05',{problem:'门户主入口邻近下沉广场，可用范围较小。',strategy:'单侧几何折面坡面流水，从远端高处流向靠近人行区域的低处。',system:'单侧水景',form:'几何折面',feedback:'认可单侧水景引导入口及成本投入逻辑；对当前形式不满意。'});
set('S1-06,S2-05,S2-11,S3-03,S3-12',{treatment:'保留既有静水',goals:'氛围营造、停留休憩',strategy:'通过亲水、观景平台组织观看与休憩，水体本身保留。'});
set('S1-06',{form:'不规则块状亲水、观景平台；部分为台阶式',feedback:'认可保留既有静水；对平台处理方式不满意。',components:['既有静水','亲水平台','观景平台']});
set('S1-07',{problem:'连接两个入口的外街平直，景观吸引力不足。',strategy:'结合植物点缀雾森。',feedback:'甲方不喜欢朦胧效果，明确不要雾森；未明确其他水景是否设置。'});
set('S2-01',{system:'左右两侧各一处独立水景，形成中间入口通道',strategy:'静水、跳泉与喷泉组成入口两侧水景。',goals:'空间引导、氛围营造、停留休憩',feedback:'选择方案一继续深化；要求保证跳泉、喷泉关闭后的景观效果。',quote:'他希望我们……保证这个跳泉啊喷泉啊这些关闭之后的这种景观效果。'});
set('S2-03',{system:'单侧、同一套连续水景系统',components:['上层镜面水','坡面流水','跌水','涌泉','底部收水槽'],flows:[['上层镜面水','过渡到','坡面流水'],['坡面流水','流入','底部收水槽'],['上层镜面水','形成','跌水']],form:'多标高、自由曲线',feedback:'选择方案一；认可单侧布局，要求优化水景及立面效果。'});
set('S2-05',{form:'条带状亲水、观景平台',feedback:'甲方比较满意调整后的平台做法。',strategy:'由不规则块状平台改为条带状平台，调整水体露出部分。'});
set('S2-06',{types:'镜面水、涌泉',system:'两处独立、镜像布置的水景',form:'沿台阶的台地状镜面水',goals:'氛围营造',feedback:'认可方案一的条带空间及绿化组织；要求取消外街水景。',decision:'空间组织保留、水景取消；图中仍记录当时提出的水景',quote:'整体的空间组织和绿化组织按照方案一来做……希望我们取消水景。'});
set('S2-07',{types:'镜面水、涌泉',form:'几何折面、锐利造型',system:'两侧独立水景引导入口',feedback:'持续认可两侧水景引导入口；不喜欢方案二锐利的几何折面造型。'});
set('S2-09',{system:'两侧各一套独立水景，靠近下沉广场的一侧较窄',types:'坡面流水、涌泉',form:'几何折面、三角形分割、局部凸起三角单元',feedback:'未选择方案二，要求按方案一深化。'});
set('S2-10',{problem:'下沉阴影空间景观吸引力弱，需要增加停留氛围。',strategy:'承接V1反馈，改为依附墙面的多高差流水，结合灯光和植物。',form:'附壁、多高差',flow:'沿墙面流下；底部收水槽仅为口述设想，未核定',feedback:'满意附壁流水效果，选择该方向；仍需优化植物组织和空间尺度。',quote:'甲方……对这个水景效果是满意的……需要去优化……植物组织，和一些空间尺度的关系。',image:'assets/knowledge-samples/E06.png'});
set('S2-12',{components:['坡面流水','端部跌水','下端收水槽'],flows:[['坡面流水','形成','端部跌水'],['端部跌水','流入','下端收水槽']],form:'三角形分割、几何折面',feedback:'未选择该方案；偏好方案一条带构图，但同时要求取消外街水景。'});
set('S3-01',{system:'单侧复合水景',components:['底部大镜面水','多标高坡面流水','涌泉'],flows:[['多标高坡面流水','分别直接流入','底部大镜面水']],form:'多标高坡面；底部水面相对铺装标高未明确',flow:'各坡面直接流入底部镜面水，不逐级流入下一坡面',strategy:'在V2方案一基础上深化，保留单侧入口引导。'});
set('S3-02,S3-09',{strategy:'沿用V2方案二附壁流水，水景设计无实质调整。',form:'附壁、多高差',inherit:'S2-10',uncertainty:'植物及空间组织有调整，本轮未展开植物专项。'});
set('S3-03,S3-12',{form:'条带状平台',strategy:'保留原有静水，继续优化条带平台。'});
set('S3-04',{types:'镜面水、涌泉',goals:'氛围营造',strategy:'沿用条带空间风格，再提出有水景的比选方案。',uncertainty:'V2要求取消水景；团队推测甲方可能不喜欢复杂形式，尚未得到甲方证实。'});
set('S3-05',{system:'左右两套独立水景；左侧面积约为右侧2—3倍（口述估计）',form:'底部齐平镜面水、内部台地镜面水',components:['左侧水景','右侧水景'],flow:'靠通道侧跳泉向内喷射；台地与底部镜面水均布置涌泉',strategy:'延续两侧水景界定入口的策略。'});
set('S3-08',{system:'左右两套独立水景',form:'全部抬高；左侧三级台地，右侧一级台地；无底部齐平大水面',components:['左侧三级镜面水与涌泉','右侧单级镜面水与涌泉'],flow:'左侧逐级跌落；右侧无叠水',strategy:'延续两侧引导入口的策略，以抬高台地与方案一比选。'});
set('S3-10',{system:'单侧连续水景',form:'三级抬高台地镜面水，无底部齐平大水面',flow:'上一级流入下一级，每级设涌泉',strategy:'保留单侧水景，以逐级跌落台地替代方案一多坡面汇入底池。'});
rows.filter(r=>r.id.startsWith('S3')).forEach(r=>set(r.id,{feedback:'V3尚未过会，甲方意见待补'}));
set('H1-03',{types:'静水',form:'三个抬高圆形池，视觉上叠置',flow:'没有形成跌落；地下水力连接未明确',problem:'主入口一侧大楼梯形成消极界面。',strategy:'利用静水池化解消极面，增加景观吸引力。',feedback:'认可入口做水景的思路；对水景造型不满意，认为不应把主要投入放在铺装。',quote:'没有形成跌落。只是普通平静水面。抬高。'});
set('H2-03',{types:'静水、水帘',form:'两个圆形静水池，加高处落下的水帘',flow:'水帘落入圆形静水池；池间是否连通未明确',feedback:'甲方不想要水帘，仍对整体形式不满意。'});
set('H2-04',{types:'旱喷',problem:'中庭以铺装为主，甲方认为空间简单、缺少特色。',strategy:'提出可分时运行的感应互动旱喷。',goals:'氛围营造、视觉焦点、引流打卡、亲子参与、戏水、感应互动',feedback:'甲方认为太常规、没有特点；没有明确认可互动水景方向。'});
set('H3-01',{system:'多个彼此独立水体，数量待补',form:'半圆形、半围合',strategy:'镜面水半围合餐饮外摆，框定就餐空间并营造氛围。',feedback:'甲方对当前方案比较满意；不单独归因为左右交叠形式。',goals:'氛围营造',quote:'彼此独立的水体。'});
set('H3-02',{system:'同一套连续水景系统',form:'方U形线条、多标高',flow:'各级镜面水依次跌落，流入下一级镜面水',strategy:'将前两版圆形水池调整为方U形多标高水景。',goals:'空间引导、氛围营造',feedback:'甲方对当前水景方向比较认可。',components:['上级镜面水','下级镜面水'],flows:[['上级镜面水','跌落流入','下级镜面水']]});
set('H3-05,H3-06,H3-09,H3-10',{scheme:'方案三·与四季共舞（水火拟态）',types:'镜面水、雾森、喷泉',operation:'分时运行、活动模式、夏冬主题切换',modes:['夏日：镜面水＋雾森','冬日：镜面水＋喷泉灯光水秀'],modeRule:'共享主题和运行逻辑；不代表同时运行或共用控制设备',feedback:'水景具体反馈的范围及对应来源待定位',strategy:'回应缺乏特色的反馈，采用夏日雾森与冬日水火拟态主题。',quote:'共用一套主题和运行逻辑，他们在物理上不是相互连通的。'});
set('H3-05,H3-06',{system:'内街多个独立镜面水系统；数量待补',goals:'氛围营造、引流打卡'});
set('H3-09,H3-10',{system:'与内街水体物理独立',goals:'空间引导、氛围营造、视觉焦点、引流打卡、停留休憩'});

const projects={C:{id:'P-CD',name:'华润置地成都万家湾',organization:'MALL型商业'},S:{id:'P-SZ',name:'深圳鸿荣源观城3—4地块',organization:'MALL＋街区型商业'},H:{id:'P-HF',name:'华润合肥万象城',organization:'MALL型商业'}};
const clean=v=>v && v!=='—'?v:'';
const split=v=>clean(v)?String(v).split(/[、；]/).filter(Boolean):[];
const merged={'H3-06':'H3-05','H3-10':'H3-09'};
const records=rows.filter(r=>!merged[r.id]).map(r=>{
 const a=amendments[r.id]||{}, p=projects[r.id[0]];
 const d={...r,...a,projectId:p.id,project:p.name,sourceIds:[r.id,...Object.keys(merged).filter(k=>merged[k]===r.id)],hasWater:r.presence!=='明确无水景'};
 d.spaceType=a.spaceType||(r.space.includes('下沉')?'下沉广场':r.space.includes('外街')?'积极界面':r.space.includes('内街')?'内街空间':r.space.includes('中庭')?'中庭空间':r.space.includes('次入口')||r.space==='水岸广场'?'次入口空间':r.space==='活动广场'||r.space==='门户广场'||r.space==='主入口'?'主入口空间':'节点空间');
 d.feedback=d.feedback||(d.hasWater?'本轮未明确具体评价':'该方案明确未设置水景，不生成水景实体');
 d.types=split(d.types); d.goals=split(d.goals); d.amended=!!amendments[r.id];
 d.evidence={register:'三项目水景登记_核对稿R03_20261003.xlsx / 01_水景登记 / 记录 '+d.sourceIds.join('、'),oral:a.quote||[a.problem,a.strategy,a.system,a.flow,a.feedback].filter(Boolean).join('；'),oralKind:a.quote?'专业人员原话摘录（口语整理）':'专业人员口述摘要',scope:'属性以登记底表及后续口述为依据；关联原始PDF的页码仍需逐项补齐。'};
 return d;
});
const nodes=[],edges=[],seen=new Set();
function node(id,label,type,attrs={},record=null){if(!seen.has(id)){nodes.push({id,label,type,attrs,record});seen.add(id);}return id;}
function edge(from,to,label,evidence){edges.push({id:'E'+(edges.length+1),from,to,label,evidence});}
Object.values(projects).forEach(p=>node(p.id,p.name,'项目',{'商业组织形式':p.organization}));
for(const r of records){
 const ev='SRC-'+r.id, v=r.projectId+'-'+r.version, s=v+'-'+r.scheme, sp=r.projectId+'-SPACE-'+r.space.replace(/·[左右]侧$/,'');
 node(v,r.version,'方案版本',{},r.id); edge(v,r.projectId,'属于项目',ev);
 node(s,r.scheme,'设计方案',{},r.id);edge(s,v,'属于版本',ev);
 node(sp,r.space.replace(/·[左右]侧$/,''),'空间',{'统一空间类型':r.spaceType,'项目原名':r.space.replace(/·[左右]侧$/,'')},r.id);edge(sp,r.projectId,'位于项目',ev);
 node(ev,'依据 · '+r.sourceIds.join(' / '),'资料依据',{'登记位置':r.evidence.register,'口述整理':r.evidence.oral||'未追加口述','来源状态':'登记及口述整理；PDF逐项定位待补'},r.id);
 const subject=r.hasWater?'W-'+r.id:'D-'+r.id;
 node(subject,r.hasWater?r.space+' · 水景设计':r.space+' · 无水景方案',''+(r.hasWater?'水景设计':'方案记录'),{'水景类型':r.types.join('、')||'无','系统组织':clean(r.system)||'未明确','形态与标高':clean(r.form)||'待补','水流关系':clean(r.flow)||'待补','运行方式':clean(r.operation)||'待补','既有处置':clean(r.treatment)||'未明确'},r.id);
 r.node=subject; r.spaceNode=sp; r.schemeNode=s;
 edge(subject,s,'属于方案',ev);edge(subject,sp,'位于空间',ev);edge(subject,ev,'依据',ev);
 r.types.forEach(t=>{const id=node('TYPE-'+t,t,'水景类型');edge(subject,id,'具有类型',ev);});
 r.goals.forEach(t=>{const id=node('GOAL-'+t,t,'设计目标');edge(subject,id,'意在实现',ev);});
 if(r.problem){const id=node('ISSUE-'+r.id,r.problem,'场地问题',{},r.id);edge(subject,id,'响应问题',ev);}
 const feedback=node('FB-'+r.id,r.feedback,'评审反馈',{},r.id);edge(feedback,subject,'评价',ev);
 const parts={};(r.components||[]).forEach((t,i)=>{parts[t]=node(subject+'-PART-'+i,t,/平台|舞台|地块|收水/.test(t)?'关联设施':'水景组成',{},r.id);edge(subject,parts[t],'包含',ev);});
 (r.flows||[]).forEach(([a,l,b])=>edge(parts[a],parts[b],l,ev));
 (r.modes||[]).forEach((m,i)=>{const id=node(subject+'-MODE-'+i,m,'运行模式',{'切换说明':r.modeRule},r.id);edge(subject,id,'可采用',ev);});
 if(r.modes?.length===2&&r.id==='C04')edge(subject+'-MODE-0',subject+'-MODE-1','互斥切换',ev);
}
records.filter(r=>r.inherit).forEach(r=>edge(r.node,'W-'+r.inherit,'沿用水景方向','SRC-'+r.id));
edge('W-H3-05','W-H3-09','共享主题，水体独立','SRC-H3-05');
// De-duplicate structural links without merging design instances across versions.
const uniqueEdges=edges.filter((e,i,all)=>all.findIndex(x=>x.from===e.from&&x.to===e.to&&x.label===e.label)===i);
const schema=[
 ['基础身份',['对象编号','所属项目','所属版本','所属方案','所在空间','对象名称']],
 ['水景特征',['水景类型','系统组织','组成对象','几何形态','水面相对标高','水流关系']],
 ['设计逻辑',['既有处置','场地问题','设计目标','设计策略','关联设施']],
 ['运行与评审',['运行方式','主题模式','模式切换约束','甲方反馈','后续设计决策']],
 ['来源与可选参数',['来源位置','确认状态','材质（选填）','尺寸（选填）','成本及口径（选填）','维护要求（选填）']]
];
const taxonomy=[['静水',['镜面水','静水','生态水池']],['流水',['坡面流水','溪流／水渠','附壁流水']],['跌落',['跌水','叠水','水帘','瀑布']],['喷泉',['喷泉','涌泉','跳泉','珍珠泉','旱喷']],['喷雾',['喷雾','雾森']]];
const industryNodes=[['水景设计','设计对象'],['项目','项目'],['方案版本','方案版本'],['设计方案','设计方案'],['空间','空间'],['水景组成','水景组成'],['关联设施','关联设施'],['场地问题','场地问题'],['设计目标','设计目标'],['运行模式','运行模式'],['评审反馈','评审反馈'],['资料依据','资料依据']].map(([label,type])=>({id:'CLASS-'+label,label,type,attrs:{层级:'行业模型定义，非具体项目事实'}}));
const industryEdges=[['设计方案','方案版本','属于'],['方案版本','项目','属于'],['水景设计','设计方案','属于'],['水景设计','空间','位于'],['水景设计','水景组成','包含'],['水景设计','关联设施','关联'],['水景设计','场地问题','响应'],['水景设计','设计目标','意在实现'],['水景设计','运行模式','可采用'],['评审反馈','水景设计','评价'],['水景设计','资料依据','依据']].map(([a,b,label],i)=>({id:'IR'+i,from:'CLASS-'+a,to:'CLASS-'+b,label,evidence:'模型定义'}));
const data={version:'0.3',date:'2026-10-03',scope:'本地设计预览，尚未接入后台入库或发布服务',sourceRecordCount:rows.length,projects:Object.values(projects),records,nodes,edges:uniqueEdges,schema,taxonomy,industryNodes,industryEdges,templateReuse:['项目编号与商业组织形式','空间分组与统一空间类型','方案版本与素材来源','需求—策略关系','属性来源及核验状态','成本口径（选填）'],sourcePath:'D:\\商业景观知识中心资料库\\04_结构化登记\\待核对\\三项目水景登记_核对稿R03_20261003.xlsx'};
fs.writeFileSync(path.join(root,'knowledge-atlas-data.js'),'// Generated by tools/build-knowledge-atlas.cjs.\nwindow.LandspireKnowledgeAtlas = '+JSON.stringify(data,null,2)+';\n');
fs.writeFileSync(path.join(root,'assets/knowledge-samples/knowledge-atlas-v03.json'),JSON.stringify(data,null,2));
console.log('Built knowledge atlas: '+records.length+' context records from '+rows.length+' source rows.');
