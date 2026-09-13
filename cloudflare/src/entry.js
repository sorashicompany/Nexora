import bot from './nexora_v5.js';

const WEBHOOK_URL = 'https://nexora-api.sorashithegod.workers.dev/telegram/webhook';

export default { async fetch(request, env, ctx) {
  const url=new URL(request.url);
  if(url.pathname==='/telegram/setup'){
    if(request.method!=='GET')return new Response(JSON.stringify({ok:false,error:'GET only'}),{status:405,headers:{'content-type':'application/json'}});
    const body={url:WEBHOOK_URL}; if(env.TELEGRAM_WEBHOOK_SECRET)body.secret_token=env.TELEGRAM_WEBHOOK_SECRET;
    const r=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const result=await r.json();
    return new Response(JSON.stringify({ok:Boolean(result.ok),webhook:WEBHOOK_URL,telegram:result}),{status:result.ok?200:502,headers:{'content-type':'application/json'}});
  }
  if(url.pathname==='/telegram/webhook' && request.method==='POST'){
    const cloned=request.clone();
    ctx.waitUntil(bot.fetch(cloned,env,ctx));
    return new Response('ok',{status:200,headers:{'content-type':'text/plain'}});
  }
  return bot.fetch(request,env,ctx);
} };