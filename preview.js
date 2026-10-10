'use strict';
document.getElementById('print').onclick=()=>window.print();
const channel=new BroadcastChannel('safety-preview-'+location.hash.slice(1));
channel.onmessage=e=>{if(typeof e.data.html!=='string')return;document.getElementById('document').innerHTML=e.data.html.replace(/body\s*\{/g,'.document-host{');document.getElementById('loading').remove();channel.close();};
channel.postMessage('ready');
