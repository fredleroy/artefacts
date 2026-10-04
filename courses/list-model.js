export function validateItems(items){
 if(!Array.isArray(items)||items.length>20)throw Error('La liste est limitée à 20 articles.');
 if(items.some(x=>!x||Object.keys(x).length!==3||typeof x.id!=='string'||!x.id.length||x.id.length>80||typeof x.name!=='string'||!x.name.length||x.name.length>200||typeof x.checked!=='boolean'))throw Error('Format de liste invalide.');
 if(new Set(items.map(x=>x.id)).size!==items.length)throw Error('Identifiants d’articles dupliqués.');
 return items;
}
export function addItem(items,item){return validateItems([...items,item])}
export function changeItem(items,id,changes){return validateItems(items.map(x=>x.id===id?{...x,...changes}:x))}
export function removeItem(items,id){return items.filter(x=>x.id!==id)}
