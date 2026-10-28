(() => {
'use strict';
const $ = s => document.querySelector(s);
const EXP='day9-transfer-qa', forced='B', preview=true, KEY='day9-transfer-qa-before-B';
const banks = ['새봄은행','온유은행','나무은행','바다은행','다온은행','별빛은행','하늘은행','구름은행','한결은행','이음은행','누리은행','달빛은행'];
const colors = ['#357456','#9458aa','#ca8932','#297cb1','#7262b3','#4a6c9d'];
let state = {runs:[],current:null,landing:false};
const nav = performance.getEntriesByType('navigation')[0];
try { if(nav?.type === 'reload') state = JSON.parse(sessionStorage.getItem(KEY)) || state; } catch { $('#storage-status').textContent='저장 공간을 사용할 수 없어 새로고침하면 기록이 사라집니다. 결과를 내려받으세요.'; }
function save(){try{sessionStorage.setItem(KEY,JSON.stringify(state));}catch{$('#storage-status').textContent='기록은 현재 화면에서만 유지됩니다. 나가기 전에 내려받으세요.';}}
function current(){return state.runs.find(r=>r.id===state.current);}
function elapsed(r){return Math.max(0,(r.endedAt || Date.now())-r.startedAt);}
function event(type,code){const r=current();r.events.push({type,step:r.step,elapsedMs:elapsed(r),...(code?{code}:{})});save();}
function start(forced){if(current()?.status==='running')return;
const id=crypto.randomUUID();const variant='B';
const r={schemaVersion:1,experimentId:EXP,id,assignmentSource:'qa-fixed-B',variant,mode:'qa',status:'running',startedAt:Date.now(),endedAt:null,step:variant==='A'?'bank':'account',bank:null,accountValid:false,amountValid:false,events:[]};
state.runs.push(r);state.current=id;event('exposure','qa_fixed_B');event('step_view');render();$('#screen').scrollIntoView({block:'start'});}

function go(step){current().step=step;event('step_view');render();$('#screen h2')?.focus();}
function fail(code,message){event('error',code);$('#error').textContent=message;document.querySelector('#account, #amount')?.setAttribute('aria-invalid','true');}
function finish(status){const r=current();r.status=status;r.endedAt=Date.now();event(status==='completed'?'completion':'abandonment');render();}
function bankButtons(list){return list.map((name)=>`<button class="bank" data-bank="${name}"><span class="bank-icon" style="--bank-color:${colors[banks.indexOf(name)%colors.length]}" aria-hidden="true">${name[0]}</span>${name}</button>`).join('');}
function render(){const r=current(),running=r?.status==='running';
$('#intro').hidden=!!r||state.landing;$('#banking').hidden=!r&&!state.landing;
if(!r){if(state.landing){$('#screen').innerHTML='<div class="appnav"><strong>하루</strong></div><h2 class="landing-title">반가워요</h2><p class="sub">오늘도 편안한 하루 보내세요</p><div class="balance-card"><span class="small">내 생활비 통장</span><div class="amount">250,000<span class="currency">원</span></div><button class="primary" id="transfer">송금하기</button></div><div class="landing-note"><span class="account-dot">↗</span><div><strong>마음을 전하는 가장 쉬운 방법</strong><p>필요할 때, 간편하게 보내세요</p></div></div>';$('#transfer').onclick=()=>start(preview?forced:undefined);}return;}
const first=r.variant==='A'?'bank':'account';let html=`<div class="appnav">${running&&r.step!==first?'<button class="back" id="back" aria-label="이전 단계">‹</button>':'<span>송금</span>'}<span>내 계좌에서</span>${running?'<button class="cancel" id="cancel">나가기</button>':''}</div>`;
if(r.status==='completed'){html+='<div class="welcome"><div class="wallet success" aria-hidden="true">✓</div><h2 tabindex="-1">송금을 완료했어요</h2><p>김하늘님에게</p><div class="amount">30,000원</div><p>하늘은행 · 000-1234-5678</p></div>';}
else if(r.status==='abandoned'){html+='<div class="welcome"><h2 tabindex="-1">송금을 종료했어요</h2><p>진행하던 송금이 취소되었어요.</p></div>';}
else if(r.step==='bank'){html+=`<h2 class="app-title" tabindex="-1">어느 은행으로<br>보낼까요?</h2><p class="sub">받는 분의 은행을 선택해 주세요</p><div class="bankgrid">${bankButtons(banks)}</div>`;}
else if(r.step==='account'){html+=`<h2 class="app-title" tabindex="-1">계좌번호를<br>알려주세요</h2><p class="sub">${r.variant==='A'?r.bank:'받는 분의 계좌번호를 입력해 주세요'}</p><form id="account-form" style="display:flex;flex:1;flex-direction:column" novalidate><div class="field"><label for="account">계좌번호</label><input id="account" inputmode="numeric" autocomplete="off" maxlength="24" placeholder="숫자만 입력" aria-describedby="error" value="${r.accountValid?'00012345678':''}"></div><p id="error" class="error" role="alert"></p><button class="primary bottom" type="submit">다음</button></form>`;}
else if(r.step==='suggestions'){html+=`<h2 class="app-title" tabindex="-1">이 중에<br>받는 은행이 있나요?</h2><p class="sub">000-1234-5678</p><div class="suggestions">${bankButtons(['하늘은행','구름은행','별빛은행'])}</div><p class="small">계좌번호를 바탕으로 찾았어요</p>`;}
else if(r.step==='amount'){html+=`<h2 class="app-title" tabindex="-1">얼마를<br>보낼까요?</h2><p class="sub">김하늘님에게</p><form id="amount-form" style="display:flex;flex:1;flex-direction:column" novalidate><div class="field"><label for="amount">보낼 금액 (원)</label><input id="amount" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="금액 입력" aria-describedby="error" value="${r.amountValid?'30,000':''}"></div><p id="error" class="error" role="alert"></p><button class="primary bottom" type="submit">다음</button></form>`;}
else if(r.step==='confirm'){html+='<h2 class="app-title" tabindex="-1">김하늘님에게<br>보낼까요?</h2><div class="amount">30,000원</div><div class="confirm"><dl><div><dt>받는 은행</dt><dd>하늘은행</dd></div><div><dt>계좌번호</dt><dd>000-1234-5678</dd></div><div><dt>출금 계좌</dt><dd>내 생활비 통장</dd></div><div><dt>수수료</dt><dd>무료</dd></div></dl></div><button class="primary bottom" id="send">보내기</button>';}
if(!running)html+='<div class="completion-actions"><button class="primary" id="download">내 결과 내려받기</button><button id="close">처음으로</button></div>';$('#screen').innerHTML=html;
$('#download')?.addEventListener('click',()=>download(r));$('#close')?.addEventListener('click',()=>{state.current=null;state.landing=false;save();render();});$('#cancel')?.addEventListener('click',()=>{const dialog=document.createElement('dialog');dialog.innerHTML='<h2>송금을 그만할까요?</h2><p>지금까지의 결과는 내려받을 수 있어요.</p><button id="stay">계속하기</button><button id="exit-run" class="primary">그만하기</button>';document.body.append(dialog);dialog.showModal();$('#stay').onclick=()=>dialog.remove();$('#exit-run').onclick=()=>{dialog.remove();finish('abandoned');};dialog.addEventListener('cancel',()=>dialog.remove());});
$('#back')?.addEventListener('click',()=>{event('backtrack');go(r.step==='confirm'?'amount':r.step==='amount'?(r.variant==='A'?'account':'suggestions'):r.step==='suggestions'?'account':'bank');});
document.querySelectorAll('[data-bank]').forEach(b=>b.addEventListener('click',()=>{r.bank=b.dataset.bank;event('bank_selected',r.bank==='하늘은행'?'target':'other');if(r.variant==='A'){go('account');}else if(r.bank!=='하늘은행'){event('error','wrong_bank');let e=$('#error');if(!e){e=document.createElement('p');e.id='error';e.className='error';e.setAttribute('role','alert');$('#screen').append(e);}e.textContent='받는 분의 은행을 다시 확인해 주세요.';}else go('amount');}));
$('#account-form')?.addEventListener('submit',e=>{e.preventDefault();const raw=$('#account').value.trim();if(!raw)return fail('empty_account','계좌번호를 입력해 주세요.');if(!/^[0-9\s-]+$/.test(raw)||raw.replace(/[\s-]/g,'')!=='00012345678')return fail('incorrect_account','계좌번호를 다시 확인해 주세요.');r.accountValid=true;event('account_valid');if(r.variant==='A'&&r.bank!=='하늘은행')return fail('wrong_bank','받는 분의 은행을 다시 확인해 주세요.');go(r.variant==='A'?'amount':'suggestions');});
$('#amount')?.addEventListener('input',e=>{const raw=e.target.value;if(/^[0-9,]*$/.test(raw)){const digits=raw.replace(/,/g,'');e.target.value=digits.replace(/\B(?=(\d{3})+(?!\d))/g,',');}r.amountValid=false;});
$('#amount-form')?.addEventListener('submit',e=>{e.preventDefault();const raw=$('#amount').value.trim();if(!raw)return fail('empty_amount','금액을 입력해 주세요.');if(!/^[0-9,]+$/.test(raw)||Number(raw.replace(/,/g,''))!==30000)return fail('incorrect_amount','실습 금액 30,000원을 입력해 주세요.');r.amountValid=true;event('amount_valid');go('confirm');});
$('#send')?.addEventListener('click',()=>finish('completed'));}
function result(r){return {layoutVersion:'mobile-v2-amount',schemaVersion:1,experimentId:EXP,id:r.id,assignmentSource:r.assignmentSource,variant:r.variant,mode:r.mode,status:r.status,elapsedMs:elapsed(r),errors:r.events.filter(e=>e.type==='error').length,backtracks:r.events.filter(e=>e.type==='backtrack').length,events:r.events};}
function download(r){const blob=new Blob([JSON.stringify(result(r),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`transfer-${r.mode}-${r.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

const introMarkup=$('#intro').innerHTML;
function enter(){$('#intro').innerHTML=introMarkup;$('#next').onclick=next;state.landing=true;save();render();window.scrollTo(0,0);}
function next(){enter();}
$('#next').onclick=next;
document.addEventListener('visibilitychange',()=>{if(current()?.status==='running')event(document.hidden?'page_hidden':'page_visible');});
$('#qa-reset').onclick=()=>{sessionStorage.removeItem(KEY);location.reload();};
save();render();
})();
