
(function(){
  function setupPoll(id){
    const poll = document.querySelector('[data-poll="'+id+'"]');
    if(!poll) return;
    const key = 'ai_constitution_poll_' + id;
    const voted = localStorage.getItem(key);
    const results = poll.querySelector('.poll-results');
    const base = {support:87, undecided:11, oppose:2};
    const labels = {support:'Support', undecided:'Undecided', oppose:'Oppose'};

    function render(choice){
      const totals = Object.assign({}, base);
      if(choice && totals[choice] !== undefined) totals[choice] += 1;
      const sum = totals.support + totals.undecided + totals.oppose;
      results.innerHTML = Object.keys(totals).map(k => {
        const pct = Math.round((totals[k]/sum)*100);
        return '<div class="result-line"><span>'+labels[k]+'</span><div class="bar"><span style="width:'+pct+'%"></span></div><strong>'+pct+'%</strong></div>';
      }).join('');
      results.classList.add('visible');
    }

    if(voted) render(voted);

    poll.querySelectorAll('button[data-choice]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const choice = btn.getAttribute('data-choice');
        localStorage.setItem(key, choice);
        render(choice);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('[data-poll]').forEach(p => setupPoll(p.getAttribute('data-poll')));
  });
})();
