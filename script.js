
(function(){
  const POLL_API_URL = "https://script.google.com/macros/s/AKfycbzOBKiI8kD9JmQN8s_Egy4uNtwlfn1rEfOksE-ZAp3UIItoPpXQ8oICo6-AyQqie5XIEQ/exec";
  const DEFAULT_BASE = {support:0, undecided:0, oppose:0};
  const LABELS_EN = {support:"Support", undecided:"Undecided", oppose:"Oppose"};
  const LABELS_DA = {support:"Bakker op", undecided:"Ved ikke", oppose:"Bakker ikke op"};

  function labelsForPoll(){
    return document.documentElement.lang === "da" ? LABELS_DA : LABELS_EN;
  }

  function key(id){ return "aic_poll_" + id; }

  async function api(params){
    if(!POLL_API_URL) return null;
    const url = POLL_API_URL + "?" + new URLSearchParams(params).toString();
    const res = await fetch(url, {method:"GET", cache:"no-store"});
    if(!res.ok) throw new Error("Poll API error: " + res.status);
    return await res.json();
  }

  function render(poll, counts, selected){
    const results = poll.querySelector(".poll-results");
    const labels = labelsForPoll();
    const support = Number(counts.support || 0);
    const undecided = Number(counts.undecided || 0);
    const oppose = Number(counts.oppose || 0);
    const total = support + undecided + oppose;

    if(total === 0){
      results.classList.remove("visible");
      return;
    }

    const rows = [["support",support],["undecided",undecided],["oppose",oppose]];
    results.innerHTML = rows.map(([name,value])=>{
      const pct = Math.round((value / total) * 100);
      const chosen = selected === name ? " ✓" : "";
      return '<div class="result-line"><span>'+labels[name]+chosen+'</span><div class="bar"><span style="width:'+pct+'%"></span></div><strong>'+pct+'%</strong></div>';
    }).join("") 

    results.classList.add("visible");
  }

  function status(poll, msg){
    const results = poll.querySelector(".poll-results");
    results.innerHTML = "<p>"+msg+"</p>";
    results.classList.add("visible");
  }

  async function load(poll, id){
    const chosen = localStorage.getItem(key(id));
    try{
      const data = await api({action:"results", poll:id});
      if(data && data.ok){
        render(poll, data.counts || DEFAULT_BASE, chosen);
        return;
      }
    }catch(e){
      console.warn(e);
    }

    if(chosen){
      const fallback = {support:0, undecided:0, oppose:0};
      fallback[chosen] = 1;
      render(poll, fallback, chosen);
    }
  }

  async function vote(poll, id, choice){
    const previous = localStorage.getItem(key(id));
    if(previous){
      status(poll, "You have already voted on this device.");
      await load(poll, id);
      return;
    }

    localStorage.setItem(key(id), choice);

    try{
      const data = await api({action:"vote", poll:id, choice:choice});
      if(data && data.ok){
        render(poll, data.counts || DEFAULT_BASE, choice);
        return;
      }
    }catch(e){
      console.warn(e);
      status(poll, "Vote saved on this device. Central poll is not connected yet.");
    }

    const fallback = {support:0, undecided:0, oppose:0};
    fallback[choice] = 1;
    render(poll, fallback, choice);
  }

  function setup(id){
    const poll = document.querySelector('[data-poll="'+id+'"]');
    if(!poll) return;

    poll.querySelectorAll("button[data-choice]").forEach(btn=>{
      btn.addEventListener("click", ()=>vote(poll, id, btn.dataset.choice));
    });

    load(poll, id);
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    document.querySelectorAll("[data-poll]").forEach(p=>setup(p.dataset.poll));
  });
})();
