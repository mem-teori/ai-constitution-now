
(function(){
  function setupPoll(id){
    const poll=document.querySelector('[data-poll="'+id+'"]'); if(!poll)return;
    const key='aic_poll_'+id, results=poll.querySelector('.poll-results');
    const base={support:87,undecided:11,oppose:2}, labels={support:'Support',undecided:'Undecided',oppose:'Oppose'};
    function render(choice){
      const t=Object.assign({},base); if(choice&&t[choice]!==undefined)t[choice]+=1;
      const sum=t.support+t.undecided+t.oppose;
      results.innerHTML=Object.keys(t).map(k=>{const pct=Math.round(t[k]/sum*100);return '<div class="result-line"><span>'+labels[k]+'</span><div class="bar"><span style="width:'+pct+'%"></span></div><strong>'+pct+'%</strong></div>'}).join('');
      results.classList.add('visible');
    }
    const voted=localStorage.getItem(key); if(voted)render(voted);
    poll.querySelectorAll('button[data-choice]').forEach(btn=>btn.addEventListener('click',()=>{localStorage.setItem(key,btn.dataset.choice);render(btn.dataset.choice)}));
  }
  document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-poll]').forEach(p=>setupPoll(p.dataset.poll)));
})();
