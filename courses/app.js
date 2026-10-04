import { firebaseConfig } from './firebase-config.js';
import { validateItems, addItem, changeItem, removeItem } from './list-model.js';
const $=id=>document.getElementById(id),list=$('list'),input=$('article'),error=$('error');
let items=[],ready=false,busy=false,reference,database,runTransaction;
function showError(message){error.textContent=message;error.hidden=false}
function render(){
 list.replaceChildren();
 const done=items.filter(x=>x.checked).length,remaining=items.length-done;
 $('counter').textContent=ready?`${remaining} article${remaining>1?'s':''} à acheter · ${done}/${items.length} coché${done>1?'s':''}`:'Connexion à la liste partagée…';
 $('empty').hidden=!ready||items.length>0;list.hidden=!ready||items.length===0;
 input.disabled=!ready||busy||items.length>=20;$('add').querySelector('button').disabled=input.disabled;
 $('reset').disabled=!ready||busy||!done;$('clear').disabled=!ready||busy||!done;
 for(const item of [...items].sort((a,b)=>Number(a.checked)-Number(b.checked))){
  const li=document.createElement('li');li.className=item.checked?'done':'';
  const label=document.createElement('label'),check=document.createElement('input'),span=document.createElement('span'),del=document.createElement('button');
  check.type='checkbox';check.checked=item.checked;check.disabled=busy||!ready;check.dataset.id=item.id;span.textContent=item.name;
  check.onchange=()=>mutate(current=>changeItem(current,item.id,{checked:check.checked}));
  del.type='button';del.className='delete';del.textContent='×';del.disabled=busy||!ready;del.setAttribute('aria-label','Supprimer '+item.name);
  del.onclick=()=>mutate(current=>removeItem(current,item.id));
  label.append(check,span);li.append(label,del);list.append(li);
 }
}
async function mutate(transform){
 if(!ready||busy)return false;busy=true;render();
 try{
  await runTransaction(database,async tx=>{
   const snapshot=await tx.get(reference);
   if(!snapshot.exists())throw Error('La liste partagée est introuvable.');
   const next=transform(validateItems(snapshot.data().items));
   tx.update(reference,{items:validateItems(next)});
  });
  error.hidden=true;return true;
 }catch(e){showError('Modification non enregistrée. '+(e.code==='permission-denied'?'Vérifiez les règles Firestore.':e.message));return false}
 finally{busy=false;render()}
}
$('add').onsubmit=async event=>{
 event.preventDefault();const name=input.value.trim();if(!name)return;
 const id=crypto.randomUUID();
 if(await mutate(current=>addItem(current,{id,name,checked:false}))){input.value='';input.focus()}
};
$('reset').onclick=()=>mutate(current=>current.map(x=>({...x,checked:false})));
$('clear').onclick=()=>mutate(current=>current.filter(x=>!x.checked));
render();
async function connect(){
 if(!firebaseConfig.apiKey||!firebaseConfig.projectId||!firebaseConfig.appId){
  $('counter').textContent='Liste partagée non configurée';
  showError('La connexion Firebase doit être configurée avant de pouvoir utiliser la liste.');return;
 }
 try{
  const [app,firestore]=await Promise.all([
   import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')
  ]);
  // Memory only: no localStorage or persistent IndexedDB cache.
  database=firestore.initializeFirestore(app.initializeApp(firebaseConfig),{localCache:firestore.memoryLocalCache()});
  runTransaction=firestore.runTransaction;reference=firestore.doc(database,'lists','courses');
  const response=await fetch('./initial-list.json');if(!response.ok)throw Error('Initialisation indisponible.');
  const seed=validateItems((await response.json()).items);
  // Seed only when absent; simultaneous visitors cannot overwrite an existing list.
  await runTransaction(database,async tx=>{const snapshot=await tx.get(reference);if(!snapshot.exists())tx.set(reference,{items:seed})});
  firestore.onSnapshot(reference,{includeMetadataChanges:true},snapshot=>{
   try{
    if(!snapshot.exists())throw Error('La liste partagée est introuvable.');
    items=validateItems(snapshot.data().items);ready=!snapshot.metadata.fromCache;
    if(ready)error.hidden=true;else showError('Connexion interrompue. Les modifications sont désactivées jusqu’au retour de la connexion.');
    render();
   }catch(e){ready=false;render();showError(e.message)}
  },e=>{ready=false;render();showError('Connexion à la liste indisponible : '+e.message)});
 }catch(e){ready=false;render();$('counter').textContent='Connexion indisponible';showError('Impossible de charger la liste partagée : '+e.message)}
}
connect();
