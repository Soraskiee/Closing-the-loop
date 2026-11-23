const stages=['Received','Under review','Scheduled','In progress','Completed'];
let request={
  ref:'DEMO-01',
  issue:'Sample maintenance request',
  description:'',
  additionalInfo:'',
  beforePhotos:[],
  afterPhotos:[],
  location:'Demo location',
  route:'RMS request',
  status:'Under review',
  owner:'Hostel staff',
  blocker:'',
  next:'The next step will be shared here.',
  update:'Demo update only',
  residentFeedback:'',
  feedbackNote:'',
  feedbackSubmitted:false
};
let role='resident';
let activeResident='resident-home';
let activeStaff='staff-queue';
let selectedIssue='';
let formLanguage='en';
let selectedBeforePhotos=[];
let selectedAfterPhotos=[];
const $=id=>document.getElementById(id);

const formCopy={
  en:{
    residentRole:'Resident view',myRequests:'My requests',reportIssueNav:'Report an issue',requestProgressNav:'Request progress',
    reportTitle:'Report a maintenance issue',reportSubtitle:'Choose an issue and add details.',issueType:'Choose the issue type',
    socket:'Power socket',socketHint:'Socket or switch not working',water:'Water leak or tap',waterHint:'Leak or water fitting',
    ac:'AC leak',acHint:'AC pipe or cooling issue',furniture:'Chair or furniture',furnitureHint:'Broken or loose furniture',
    door:'Door or fixture',doorHint:'Door, knob, or fitting',other:'Other issue',otherHint:'Describe another problem',
    otherLabel:'What is the issue?',otherPlaceholder:'Type a short issue name',describeLabel:'Describe the issue (optional)',
    describePlaceholder:'Add a few details',issueDetailsToggle:'＋ Add details about this issue (optional)',hideIssueDetails:'− Hide issue details',pastDetails:'Add details about previous repairs (optional)',
    hidePastDetails:'Hide previous repair details',pastLabel:'Previous repair or extra information',
    pastPlaceholder:'For example, what was tried before',locationLabel:'Demo location',
    locationPlaceholder:'Use a demo location only',locationHint:'Do not enter a real room number or personal details.',
    routeLabel:'How was it reported?',routeRms:'RMS request',routeStaff:'Warden / hostel staff',routeOther:'Other route',
    beforePhotosToggle:'＋ Add photos of the issue (optional)',hideBeforePhotos:'Hide photos of the issue',
    afterPhotosToggle:'＋ Add after-work photos (optional)',hideAfterPhotos:'Hide after-work photos',
    submitButton:'Continue',cancelButton:'Cancel',chooseIssue:'Choose an issue type to continue.',
    enterOther:'Add a short issue name to continue.',enterLocation:'Add a demo location to continue.'
  },
  hi:{
    residentRole:'निवासी दृश्य',myRequests:'मेरे अनुरोध',reportIssueNav:'समस्या दर्ज करें',requestProgressNav:'अनुरोध की स्थिति',
    reportTitle:'मरम्मत की समस्या दर्ज करें',reportSubtitle:'समस्या चुनें और विवरण जोड़ें।',issueType:'समस्या का प्रकार चुनें',
    socket:'बिजली का सॉकेट',socketHint:'सॉकेट या स्विच काम नहीं कर रहा',water:'पानी का रिसाव या नल',waterHint:'रिसाव या पानी की फिटिंग',
    ac:'AC से पानी का रिसाव',acHint:'AC की पाइप या ठंडक की समस्या',furniture:'कुर्सी या फर्नीचर',furnitureHint:'टूटा या ढीला फर्नीचर',
    door:'दरवाज़ा या फिटिंग',doorHint:'दरवाज़ा, कुंडी या फिटिंग',other:'दूसरी समस्या',otherHint:'कोई दूसरी समस्या बताएं',
    otherLabel:'समस्या क्या है?',otherPlaceholder:'समस्या का छोटा नाम लिखें',describeLabel:'समस्या का विवरण (वैकल्पिक)',
    describePlaceholder:'कुछ जानकारी जोड़ें',issueDetailsToggle:'＋ समस्या का विवरण जोड़ें (वैकल्पिक)',hideIssueDetails:'− समस्या का विवरण छिपाएं',pastDetails:'पिछली मरम्मत की जानकारी जोड़ें (वैकल्पिक)',
    hidePastDetails:'पिछली मरम्मत की जानकारी छिपाएं',pastLabel:'पिछली मरम्मत या अतिरिक्त जानकारी',
    pastPlaceholder:'उदाहरण: पहले क्या किया गया था',locationLabel:'डेमो स्थान',
    locationPlaceholder:'केवल डेमो स्थान लिखें',locationHint:'असली कमरे का नंबर या निजी जानकारी न लिखें।',
    routeLabel:'समस्या कैसे बताई गई?',routeRms:'RMS अनुरोध',routeStaff:'वार्डन / हॉस्टल स्टाफ',routeOther:'अन्य तरीका',
    beforePhotosToggle:'＋ समस्या की तस्वीरें जोड़ें (वैकल्पिक)',hideBeforePhotos:'समस्या की तस्वीरें छिपाएं',
    afterPhotosToggle:'＋ काम के बाद की तस्वीरें जोड़ें (वैकल्पिक)',hideAfterPhotos:'काम के बाद की तस्वीरें छिपाएं',
    submitButton:'आगे बढ़ें',cancelButton:'रद्द करें',chooseIssue:'आगे बढ़ने के लिए समस्या का प्रकार चुनें।',
    enterOther:'आगे बढ़ने के लिए समस्या का छोटा नाम लिखें।',enterLocation:'आगे बढ़ने के लिए डेमो स्थान लिखें।'
  }
};

function toast(msg){
  const t=$('toast');
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2300)
}
function go(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('hidden',v.id!==id));
  if(id.startsWith('resident'))activeResident=id;
  else activeStaff=id;
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  if(id==='resident-detail')renderResidentDetail();
  if(id==='staff-queue')renderStaffQueue();
  if(id==='staff-detail')renderStaffDetail()
}
function setRole(next){
  role=next;
  const res=next==='resident';
  $('residentTab').classList.toggle('active',res);
  $('staffTab').classList.toggle('active',!res);
  $('residentTab').setAttribute('aria-selected',res);
  $('staffTab').setAttribute('aria-selected',!res);
  $('residentNav').classList.toggle('hidden',!res);
  $('staffNav').classList.toggle('hidden',res);
  $('roleLabel').textContent=res?formCopy[formLanguage].residentRole:'Staff / technician view';
  go(res?activeResident:activeStaff)
}
function setFormLanguage(lang){
  formLanguage=lang;
  const words=formCopy[lang];
  document.querySelectorAll('[data-copy]').forEach(el=>{
    const value=words[el.dataset.copy];
    if(value)el.textContent=value
  });
  document.querySelectorAll('[data-placeholder]').forEach(el=>{
    const value=words[el.dataset.placeholder];
    if(value)el.placeholder=value
  });
  $('englishButton').classList.toggle('active',lang==='en');
  $('hindiButton').classList.toggle('active',lang==='hi');
  $('englishButton').setAttribute('aria-pressed',lang==='en');
  $('hindiButton').setAttribute('aria-pressed',lang==='hi');
  const pastDetailsOpen=!$('pastDetailsWrap').classList.contains('hidden');
  $('detailsToggle').setAttribute('aria-expanded',pastDetailsOpen);
  $('detailsToggle').querySelector('[data-copy]').textContent=pastDetailsOpen?words.hidePastDetails:words.pastDetails;
  $('issueDetailsToggle').setAttribute('aria-expanded',!$('issueDetailsWrap').classList.contains('hidden'));
  $('issueDetailsToggle').textContent=$('issueDetailsWrap').classList.contains('hidden')?words.issueDetailsToggle:words.hideIssueDetails;
  $('beforePhotosToggle').setAttribute('aria-expanded',!$('beforePhotosWrap').classList.contains('hidden'));
  $('afterPhotosToggle').setAttribute('aria-expanded',!$('afterPhotosWrap').classList.contains('hidden'));
  $('beforePhotosToggle').textContent=$('beforePhotosWrap').classList.contains('hidden')?words.beforePhotosToggle:`− ${words.hideBeforePhotos}`;
  $('afterPhotosToggle').textContent=$('afterPhotosWrap').classList.contains('hidden')?words.afterPhotosToggle:`− ${words.hideAfterPhotos}`
}
function selectIssue(button){
  selectedIssue=button.dataset.issue;
  document.querySelectorAll('.issue-choice').forEach(option=>{
    const active=option===button;
    option.classList.toggle('selected',active);
    option.setAttribute('aria-pressed',active)
  });
  $('otherIssueWrap').classList.toggle('hidden',selectedIssue!=='Other');
  if(selectedIssue==='Other')$('otherIssue').focus()
}
function chosenIssue(){
  if(selectedIssue!=='Other')return selectedIssue;
  const detail=$('otherIssue').value.trim();
  return detail?`Other: ${detail}`:''
}
function cardHTML(){
  return `<div class="ticket"><div class="row between"><div class="ticket-title">${escapeHtml(request.issue)}</div><span class="tag teal">${escapeHtml(request.status)}</span></div><div class="ticket-meta"><span>${escapeHtml(request.ref)}</span><span>·</span><span>${escapeHtml(request.location||'Demo location')}</span><span>·</span><span>${escapeHtml(request.route)}</span></div><div class="ticket-next"><b>Next step:</b> ${escapeHtml(request.next||'No next action entered yet.')}</div><div class="row between" style="margin-top:12px"><span class="small muted">Next role: ${escapeHtml(request.owner)}</span><button class="btn" data-go="${role==='resident'?'resident-detail':'staff-detail'}">Open details</button></div></div>`
}
function renderResidentHome(){
  $('residentTickets').innerHTML=cardHTML();
  wireGoButtons()
}
function renderResidentDetail(){
  $('residentDetailTitle').textContent=request.issue;
  $('residentDetailMeta').textContent=`${request.ref} · ${request.location||'Demo location'} · Reported through ${request.route}`;
  $('residentStatusTag').textContent=request.status;
  $('residentNext').innerHTML=`<b>Next step:</b> ${escapeHtml(request.next||'No next action entered yet.')}${request.blocker?`<br><span class="small"><b>Note:</b> ${escapeHtml(request.blocker)}</span>`:''}`;
  $('residentOwner').textContent=request.owner;
  $('residentUpdate').textContent=request.update;
  $('residentRef').textContent=request.ref;
  let current=stages.indexOf(request.status);
  if(request.status==='Needs follow-up')current=1;
  if(request.status==='Resolved')current=4;
  current=Math.max(0,current);
  $('progressSummary').textContent=`Stage ${current+1} of ${stages.length} · ${request.status}`;
  $('progressFill').style.width=`${((current+1)/stages.length)*100}%`;
  document.querySelector('.progress-meter').setAttribute('aria-valuenow',current+1);
  $('progress').innerHTML=stages.map((s,i)=>`<div class="step ${i<current?'done':''} ${i===current?'current':''}"><div class="dot">${i<current?'✓':i+1}</div><div class="step-label">${s}</div></div>`).join('')
  const hasPhotos=request.beforePhotos.length||request.afterPhotos.length;
  $('residentPhotos').classList.toggle('hidden',!hasPhotos);
  renderPhotoPreview($('residentBeforePhotos'),request.beforePhotos);
  renderPhotoPreview($('residentAfterPhotos'),request.afterPhotos);
  const canRespond=request.status==='Completed'||request.status==='Resolved'||request.status==='Needs follow-up';
  $('repairFeedback').classList.toggle('hidden',!canRespond);
  $('feedbackDivider').classList.toggle('hidden',!canRespond);
  $('resolvedBtn').classList.toggle('selected-feedback',request.residentFeedback==='resolved');
  $('unresolvedBtn').classList.toggle('selected-feedback',request.residentFeedback==='unresolved');
  $('resolvedBtn').disabled=request.feedbackSubmitted;
  $('unresolvedBtn').disabled=request.feedbackSubmitted;
  $('sendRepairFeedback').disabled=request.feedbackSubmitted;
  $('repairFeedbackNote').value=request.feedbackNote||'';
  $('repairFeedbackNote').disabled=request.feedbackSubmitted;
  $('feedbackSaved').classList.toggle('hidden',!request.feedbackSubmitted);
  $('feedbackSaved').textContent=request.feedbackSubmitted?'Demo feedback recorded on this page.':''
}
function renderStaffQueue(){
  $('staffTicket').innerHTML=cardHTML();
  wireGoButtons()
}
function renderStaffDetail(){
  $('staffRef').textContent=request.ref;
  const description=request.description?`<div class="small staff-detail-note"><b>Issue details:</b> ${escapeHtml(request.description)}</div>`:'';
  const extra=request.additionalInfo?`<div class="small staff-detail-note"><b>Previous repair / extra information:</b> ${escapeHtml(request.additionalInfo)}</div>`:'';
  $('staffIssue').innerHTML=`<b>${escapeHtml(request.issue)}</b><br><span class="small">${escapeHtml(request.location||'Demo location')} · Route: ${escapeHtml(request.route)}</span>${description}${extra}`;
  $('staffBeforePhotosSection').classList.toggle('hidden',!request.beforePhotos.length);
  renderPhotoPreview($('staffBeforePhotos'),request.beforePhotos);
  selectedAfterPhotos=request.afterPhotos||[];
  renderPhotoPreview($('afterPhotoPreview'),selectedAfterPhotos);
  $('staffStatus').value=stages.includes(request.status)?request.status:'Under review';
  $('owner').value=['Hostel staff','Maintenance technician','Resident','Not assigned yet'].includes(request.owner)?request.owner:'Hostel staff';
  $('blocker').value=request.blocker;
  $('nextAction').value=request.next
}
function photoRecords(input){
  return Array.from(input.files||[]).filter(file=>file.type.startsWith('image/')).map(file=>({
    name:file.name,
    url:URL.createObjectURL(file)
  }))
}
function renderPhotoPreview(container,photos){
  container.innerHTML=(photos||[]).map(photo=>`<div class="photo-thumb"><img src="${escapeHtml(photo.url)}" alt="Selected demo photo"><span title="${escapeHtml(photo.name)}">${escapeHtml(photo.name)}</span></div>`).join('')
}
function openSubmissionConfirmation(){
  $('confirmationRef').textContent=request.ref;
  $('submissionModal').classList.remove('hidden');
  $('viewProgressButton').focus()
}
function closeSubmissionConfirmation(){
  $('submissionModal').classList.add('hidden')
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))
}
function wireGoButtons(){document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go))}

document.querySelectorAll('.issue-choice').forEach(button=>button.addEventListener('click',()=>selectIssue(button)));
$('englishButton').onclick=()=>setFormLanguage('en');
$('hindiButton').onclick=()=>setFormLanguage('hi');
$('issueDetailsToggle').onclick=()=>{
  const open=$('issueDetailsWrap').classList.toggle('hidden')===false;
  $('issueDetailsToggle').setAttribute('aria-expanded',open);
  const words=formCopy[formLanguage];
  $('issueDetailsToggle').textContent=open?words.hideIssueDetails:words.issueDetailsToggle
};
$('detailsToggle').onclick=()=>{
  const open=$('pastDetailsWrap').classList.toggle('hidden')===false;
  $('detailsToggle').setAttribute('aria-expanded',open);
  const words=formCopy[formLanguage];
  const label=$('detailsToggle').querySelector('[data-copy]');
  label.textContent=open?words.hidePastDetails:words.pastDetails
};
function wireOptionalPhotoToggle(buttonId,wrapId,showKey,hideKey){
  const button=$(buttonId),wrap=$(wrapId);
  button.onclick=()=>{
    const open=wrap.classList.toggle('hidden')===false;
    button.setAttribute('aria-expanded',open);
    const words=formCopy[formLanguage];
    button.textContent=open?`− ${words[hideKey]}`:words[showKey]
  };
}
wireOptionalPhotoToggle('beforePhotosToggle','beforePhotosWrap','beforePhotosToggle','hideBeforePhotos');
wireOptionalPhotoToggle('afterPhotosToggle','afterPhotosWrap','afterPhotosToggle','hideAfterPhotos');
$('timelineToggle').onclick=()=>{
  const open=$('progress').classList.toggle('hidden')===false;
  $('timelineToggle').setAttribute('aria-expanded',open);
  $('timelineToggle').textContent=open?'Hide stages':'View all stages'
};
$('beforePhotos').addEventListener('change',()=>{
  selectedBeforePhotos=photoRecords($('beforePhotos'));
  renderPhotoPreview($('beforePhotoPreview'),selectedBeforePhotos)
});
$('afterPhotos').addEventListener('change',()=>{
  selectedAfterPhotos=photoRecords($('afterPhotos'));
  renderPhotoPreview($('afterPhotoPreview'),selectedAfterPhotos)
});
$('residentTab').onclick=()=>setRole('resident');
$('staffTab').onclick=()=>setRole('staff');
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>go(b.dataset.view));
wireGoButtons();

$('submitRequest').onclick=()=>{
  const issue=chosenIssue();
  const location=$('location').value.trim();
  if(!selectedIssue){toast(formCopy[formLanguage].chooseIssue);return}
  if(!issue){toast(formCopy[formLanguage].enterOther);$('otherIssue').focus();return}
  if(!location){toast(formCopy[formLanguage].enterLocation);$('location').focus();return}
  request={
    ref:'DEMO-02',issue,description:$('issueDetails').value.trim(),
    additionalInfo:$('pastDetails').value.trim(),beforePhotos:selectedBeforePhotos,
    afterPhotos:[],location,route:$('route').value,
    status:'Received',owner:'Not assigned yet',blocker:'',
    next:'The request has been received. The next step has not been set in this demo.',
    update:'Just now · demo',residentFeedback:'',feedbackNote:'',feedbackSubmitted:false
  };
  openSubmissionConfirmation()
};
$('viewProgressButton').onclick=()=>{
  closeSubmissionConfirmation();
  go('resident-detail')
};
$('closeConfirmation').onclick=closeSubmissionConfirmation;
$('submissionModal').addEventListener('click',event=>{
  if(event.target===$('submissionModal'))closeSubmissionConfirmation()
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!$('submissionModal').classList.contains('hidden'))closeSubmissionConfirmation()
});
$('saveUpdate').onclick=()=>{
  request.status=$('staffStatus').value;
  request.owner=$('owner').value;
  request.blocker=$('blocker').value.trim();
  request.next=$('nextAction').value.trim()||'No next action entered yet.';
  request.afterPhotos=selectedAfterPhotos;
  request.update='Just now · demo';
  toast('Demo update saved in this page only.');
  go('staff-queue')
};
$('resolvedBtn').onclick=()=>{
  request.residentFeedback='resolved';
  $('resolvedBtn').classList.add('selected-feedback');
  $('unresolvedBtn').classList.remove('selected-feedback')
};
$('unresolvedBtn').onclick=()=>{
  request.residentFeedback='unresolved';
  $('unresolvedBtn').classList.add('selected-feedback');
  $('resolvedBtn').classList.remove('selected-feedback')
};
$('sendRepairFeedback').onclick=()=>{
  if(!request.residentFeedback){toast('Choose whether the issue seems resolved.');return}
  request.feedbackNote=$('repairFeedbackNote').value.trim();
  request.feedbackSubmitted=true;
  if(request.residentFeedback==='resolved'){
    request.status='Resolved';
    request.next='Resident confirmed that the demo issue appears resolved.';
    request.update='Resident feedback · demo'
  }else{
    request.status='Needs follow-up';
    request.owner='Hostel staff';
    request.next='Resident says the demo issue is still happening. Staff review is needed.';
    request.update='Follow-up requested · demo'
  }
  renderResidentDetail()
};
setFormLanguage('en');
renderResidentHome();
renderResidentDetail();
