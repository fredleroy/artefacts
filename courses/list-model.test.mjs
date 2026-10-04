import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateItems,addItem,changeItem,removeItem} from './list-model.js';
const item=i=>({id:String(i),name:'Article '+i,checked:false});
test('enforces the 20-item limit and validates fields',()=>{
 const items=Array.from({length:20},(_,i)=>item(i));
 assert.equal(validateItems(items).length,20);
 assert.throws(()=>addItem(items,item(20)));
 assert.throws(()=>validateItems([{...item(0),checked:'true'}]));
 assert.throws(()=>validateItems([{...item(0),name:'x'.repeat(201)}]));
 assert.throws(()=>validateItems([item(0),item(0)]));
});
test('an action applied to fresh server data preserves another user’s addition',()=>{
 const fresh=[item(0),item(1)];
 const result=changeItem(fresh,'0',{checked:true});
 assert.deepEqual(result,[{...item(0),checked:true},item(1)]);
 assert.equal(fresh[0].checked,false);
 assert.deepEqual(removeItem(result,'0'),[item(1)]);
});
test('a stale action on an already deleted item does not recreate it',()=>{
 assert.deepEqual(changeItem([item(1)],'0',{checked:true}),[item(1)]);
});
