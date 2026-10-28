'use strict';
const $=id=>document.getElementById(id);
const fields=['company_name','phone','contract_name','school_name','manager_name','inspector_name','start_date','end_date'];
const messageFields=['hazard_1','hazard_2','measure_1','measure_2','measure_3','ppe'];
const riskNames=['추락','감전','질식','화재'];
const schoolKey='safety_web.school_preferences.v1';
let worker,sequence=0,pending=new Map(),catalogue={},modelState={},revision=0,classifyToken=0;
let runtimeReady=false,titleTimer,previewTimer,lastClassifiedTitle=null,documentResult=null,previewRequested=false;
const urls={};
function rpc(request){return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});worker.postMessage({id,request});});}
function status(text){$('status').textContent=text;}
function captureState(){return {...modelState,category:$('category').value,detail_type:$('detail').value,contract_name:$('contract_name').value,...Object.fromEntries(messageFields.map(k=>[k,$(k).value])),...Object.fromEntries(riskNames.map(r=>['risk_'+r,$('risk_'+r).checked]))};}
function disableDownload(id){if(urls[id])URL.revokeObjectURL(urls[id]);delete urls[id];$(id).removeAttribute('href');$(id).removeAttribute('download');$(id).setAttribute('aria-disabled','true');$(id).tabIndex=-1;}
function changed(){revision++;documentResult=null;$('window').disabled=true;['hwpx','pdf'].forEach(disableDownload);$('preview-content').hidden=true;clearTimeout(previewTimer);if(runtimeReady&&previewRequested)previewTimer=setTimeout(()=>makePreview(false),900);}
function options(category,selected='공통'){$('detail').replaceChildren();for(const name of ['공통',...Object.keys(catalogue).filter(n=>catalogue[n]===category).sort((a,b)=>a.localeCompare(b,'ko'))]){const o=document.createElement('option');o.value=o.textContent=name;$('detail').append(o);}$('detail').value=selected;if(!$('detail').value)$('detail').value='공통';}
function apply(data){modelState=data.state;$('category').value=data.category;options(data.category,data.detail);for(const r of riskNames){$('risk_'+r).checked=!!data.checks[r];const span=$('state_'+r).firstElementChild;const [text,bg,color]=data.risk_styles[r];span.textContent=text;span.style.background=bg;span.style.color=color;}for(const k of messageFields)$(k).value=data.messages[k]||'';
 const result=data.result;$('classification-group').hidden=!$('contract_name').value.trim()||!result;
 $('classification').textContent=data.detail==='공통'?'자동분류 어려움 · 공통 적용':`자동분류 결과: ${data.detail} · 직접 변경 가능`;
 $('classification').className='alert '+(data.detail==='공통'?'warning':'success');$('selection-help').hidden=data.confirmed;changed();}
async function classify(){clearTimeout(titleTimer);if(!runtimeReady)return;const title=$('contract_name').value;if(lastClassifiedTitle===title)return;const token=++classifyToken;try{const data=await rpc({action:'classify',title,state:captureState()});if(token!==classifyToken||title!==$('contract_name').value)return;lastClassifiedTitle=title;apply(data);}catch{status('자동분류를 완료하지 못했습니다. 작업유형을 직접 선택해주세요.');}}
async function chooseDetail(category,detail){clearTimeout(titleTimer);const token=++classifyToken;lastClassifiedTitle=$('contract_name').value;try{const data=await rpc({action:'detail',title:lastClassifiedTitle,category,detail,state:captureState()});if(token!==classifyToken)return;apply(data);$('classification-group').hidden=true;}catch{status('유형을 적용하지 못했습니다. 다시 선택해주세요.');}}
function goToStep(step){for(const b of document.querySelectorAll('[data-step]')){const active=Number(b.dataset.step)===step;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');}$('previous').hidden=step!==2;const anchor=['basic','types','doc'][step-1];history.replaceState(null,'','#'+anchor);$(anchor).scrollIntoView({behavior:'smooth'});if(step===3)makePreview(false);}
for(const b of document.querySelectorAll('[data-step]'))b.onclick=()=>goToStep(Number(b.dataset.step));
$('next_basic').onclick=()=>goToStep(2);$('previous').onclick=()=>goToStep(1);$('edit_preview').onclick=()=>goToStep(2);$('preview').onclick=()=>goToStep(3);
const today=new Date(),todayText=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');$('start_date').value=$('end_date').value=todayText;
function schoolFeedback(text){$('school-feedback').hidden=false;$('school-feedback').textContent=text;}
function saveSchool(){try{localStorage.setItem(schoolKey,JSON.stringify({school_name:$('school_name').value,inspector_name:$('inspector_name').value}));}catch{schoolFeedback('브라우저 설정으로 학교정보를 저장할 수 없습니다.');}}
try{const saved=JSON.parse(localStorage.getItem(schoolKey)||localStorage.getItem('safety_browser_school')||'{}');for(const k of ['school_name','inspector_name'])$(k).value=typeof saved[k]==='string'?saved[k]:'';}catch{}
$('delete').onclick=()=>{if(!confirm('저장된 학교정보를 삭제할까요?'))return;try{localStorage.removeItem(schoolKey);localStorage.removeItem('safety_browser_school');}catch{schoolFeedback('브라우저 저장소 접근이 차단되어 삭제 여부를 확인할 수 없습니다.');return;}$('school_name').value=$('inspector_name').value='';changed();schoolFeedback('저장정보를 삭제했습니다.');};
for(const key of fields)$(key).addEventListener('input',()=>{if(['school_name','inspector_name'].includes(key))saveSchool();changed();if(key==='contract_name'){classifyToken++;clearTimeout(titleTimer);titleTimer=setTimeout(classify,700);}});
$('contract_name').addEventListener('blur',classify);$('contract_name').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();classify();}});
$('has_period').onchange=()=>{for(const k of ['start_date','end_date'])$(k).disabled=!$('has_period').checked;changed();};
for(const k of messageFields)$(k).addEventListener('input',changed);for(const r of riskNames)$('risk_'+r).onchange=changed;$('auto').checked = false;$('auto').onchange=changed;
$('category').onchange=()=>{const category=$('category').value;options(category);chooseDetail(category,'공통');};$('detail').onchange=()=>chooseDetail($('category').value,$('detail').value);
function values(){const v=Object.fromEntries(fields.map(k=>[k,$(k).value]));if(!$('has_period').checked)v.start_date=v.end_date=null;return {...v,category:$('category').value,detail_type:$('detail').value,risks:Object.fromEntries(riskNames.map(r=>[r,$('risk_'+r).checked])),messages:Object.fromEntries(messageFields.map(k=>[k,$(k).value])),auto_check:$('auto').checked};}
function downloadReady(id,data,mime){disableDownload(id);urls[id]=URL.createObjectURL(new Blob([Uint8Array.from(atob(data.file),c=>c.charCodeAt(0))],{type:mime}));$(id).href=urls[id];$(id).download=data.name;$(id).setAttribute('aria-disabled','false');$(id).tabIndex=0;$(id).dataset.bytes=String(atob(data.file).length);}
function zoom(){for(const page of $('document').querySelectorAll('.a4-page'))page.style.zoom=Number($('preview_zoom').value)/100;}$('preview_zoom').onchange=zoom;
async function makePreview(scroll=false){previewRequested=true;if(!runtimeReady)return;await classify();const version=revision;const snapshot=values();try{status('브라우저에서 문서 생성 중…');const data=await rpc({action:'preview',values:snapshot});if(version!==revision)return;$('preview-errors').hidden=true;if(data.validation_errors){$('preview-errors').textContent=data.validation_errors.join(' ');$('preview-errors').hidden=false;status('필수 입력정보를 확인해주세요.');return;}documentResult=data;
 // Scope the document's body rule so it cannot alter the input form theme.
 $('document').innerHTML=data.html.replace(/body\s*\{/g,'.document-host{');zoom();$('page-count').textContent=`${data.titles.length}쪽 · 생성 HWPX의 문서별 페이지 구분 기준`;
 $('preview-content').hidden=false;$('preview-placeholder').hidden=true;$('window').disabled=false;$('pdf-error').hidden=true;downloadReady('hwpx',data,'application/hwp+zip');status('문서 생성 완료 · 모든 처리는 브라우저 안에서 수행됩니다.');if(scroll)$('doc').scrollIntoView({behavior:'smooth'});
 try{const pdf=await rpc({action:'pdf',values:snapshot});if(version!==revision)return;if(pdf.validation_errors)throw Error();downloadReady('pdf',pdf,'application/pdf');}catch{if(version===revision)$('pdf-error').hidden=false;}
 }catch{if(version===revision)status('문서 생성에 실패했습니다. 입력값을 확인한 뒤 다시 시도해주세요.');}}
$('window').onclick=()=>{if(!documentResult)return;const snapshot=documentResult.html;const token=crypto.randomUUID();const channel=new BroadcastChannel('safety-preview-'+token);const popup=window.open('preview.html#'+token,'_blank');if(!popup){channel.close();status('브라우저에서 새 창이 차단되었습니다.');return;}const timeout=setTimeout(()=>channel.close(),30000);channel.onmessage=e=>{if(e.data==='ready'){channel.postMessage({html:snapshot});clearTimeout(timeout);setTimeout(()=>channel.close(),1000);}};};
for(const id of ['hwpx','pdf'])$(id).addEventListener('click',e=>{if($(id).getAttribute('aria-disabled')==='true')e.preventDefault();});
async function start(){try{worker=new Worker('worker.js',{type:'module'});worker.onmessage=e=>{const p=pending.get(e.data.id);if(!p)return;pending.delete(e.data.id);e.data.error?p.reject(Error()):p.resolve(e.data.result);};worker.onerror=()=>{for(const p of pending.values())p.reject(Error());pending.clear();status('실행환경을 불러오지 못했습니다. 새로고침해주세요. 기본정보는 계속 입력할 수 있습니다.');};catalogue=await rpc({action:'catalogue'});runtimeReady=true;options('공통');await classify();$('category').disabled=$('detail').disabled=$('preview').disabled=false;status('준비 완료 · 모든 입력정보는 브라우저 안에서 처리됩니다.');}catch{status('실행환경을 불러오지 못했습니다. 새로고침해주세요.');}}
start();

