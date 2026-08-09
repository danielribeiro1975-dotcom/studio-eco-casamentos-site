/* ==========================================================================
   AQ Studio & Co. — Analytics (GA4) + eventos de conversão
   IMPORTANTE: substitua GA4_ID pelo Measurement ID real (formato G-XXXXXXXXXX)
   obtido em analytics.google.com antes de publicar. Enquanto o ID não for
   substituído, o GA4 NÃO é carregado (evita enviar dados para uma
   propriedade inexistente). Combine com o Google Tag Manager se preferir
   gerenciar as tags por lá em vez deste arquivo.
   ========================================================================== */
(function(){
  var GA4_ID = 'G-XXXXXXXXXX'; // TODO: colar o Measurement ID real do GA4

  var hasRealId = GA4_ID && GA4_ID.indexOf('XXXXXX') === -1;

  if(hasRealId){
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
  }

  function track(name, params){
    if(hasRealId && window.gtag){ window.gtag('event', name, params || {}); }
    // Sempre loga no console em ambiente de desenvolvimento para facilitar QA dos eventos
    if(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'){
      console.info('[AQ analytics]', name, params || {});
    }
  }
  window.aqTrack = track;

  document.addEventListener('DOMContentLoaded', function(){

    // click_whatsapp — qualquer link para wa.me
    document.addEventListener('click', function(e){
      var wa = e.target.closest && e.target.closest('a[href*="wa.me"]');
      if(wa) track('click_whatsapp', { link_url: wa.href, link_text: (wa.textContent || '').trim() });
    });

    // Abertura do chat (início de captação de lead)
    document.addEventListener('click', function(e){
      var trigger = e.target.closest && e.target.closest('[data-open-chat]');
      if(trigger) track('chat_open', { page: window.location.pathname });
    });

    // portfolio_view — página com galeria
    if(document.querySelector('.gallery-grid')){ track('portfolio_view'); }

    // destination_wedding_view — páginas de Destination Wedding
    if(document.body.dataset.pageType === 'destination-wedding'){ track('destination_wedding_view'); }

    // scroll_90 — usuário rolou 90% da página
    var scrolled90 = false;
    window.addEventListener('scroll', function(){
      if(scrolled90) return;
      var doc = document.documentElement;
      var pct = (window.scrollY + window.innerHeight) / (doc.scrollHeight || 1);
      if(pct > 0.9){ scrolled90 = true; track('scroll_90', { page: window.location.pathname }); }
    }, { passive:true });

  });

  // form_submit / lead_generated — disparado pelo chatbot.js ao concluir a qualificação
  document.addEventListener('aq:lead_complete', function(e){
    track('form_submit', { form_id: 'chatbot_qualificacao' });
    track('lead_generated', {
      method: 'chatbot',
      destino: (e.detail && e.detail.destino) || 'não informado'
    });
  });

})();
