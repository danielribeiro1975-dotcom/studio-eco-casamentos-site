/* ==========================================================================
   AQ Studio & Co. — Chatbot di qualificazione lead (versione italiana)
   100% client-side: alla fine, i dati raccolti vengono inviati al
   WhatsApp del team (nessun backend/archiviazione su questo sito, per ora).
   ========================================================================== */
(function(){

  var WA_PHONE = '5541996221890';

  var lead = {};
  var stepIndex = 0;
  var started = false;

  var steps = [
    {
      bot: "Ciao! Volete organizzare un Destination Wedding senza pensieri? 💍",
      type: 'options',
      options: [{ label: "Sì, ho bisogno di aiuto 🙏", value: "si" }]
    },
    {
      bot: "Sono qui per aiutarvi! 😊 Per iniziare, mi servono solo alcune risposte rapide. Come vi chiamate?",
      type: 'text',
      key: 'nome',
      placeholder: 'Il vostro nome'
    },
    {
      bot: function(l){ return 'Piacere, ' + l.nome + '! 👋 A quale email volete ricevere maggiori informazioni?'; },
      type: 'text',
      key: 'email',
      inputType: 'email',
      placeholder: 'voi@email.com'
    },
    {
      bot: "Potreste indicarmi il vostro numero di telefono (con prefisso internazionale)?",
      type: 'text',
      key: 'celular',
      inputType: 'tel',
      placeholder: '+39 000 000 0000'
    },
    {
      bot: "Perfetto, ci siamo quasi 😊 Come si chiama il vostro/la vostra partner?",
      type: 'text',
      key: 'noivo',
      placeholder: 'Nome del/della partner'
    },
    {
      bot: "Quanti invitati saranno presenti al matrimonio?",
      type: 'options',
      key: 'convidados',
      options: ["Fino a 50 invitati", "Tra 50 e 80 invitati", "Tra 80 e 150 invitati", "Più di 150 invitati"]
    },
    {
      bot: "Quale budget avete in mente?",
      type: 'options',
      key: 'orcamento',
      options: ["Fino a €18.000", "Tra €18.000 e €36.000", "Tra €36.000 e €72.000", "Oltre €72.000"]
    },
    {
      bot: function(l){ return 'E dove volete sposarvi, ' + l.nome + '? Può essere qui in Brasile o in una destinazione internazionale, come Italia, Portogallo e così via...'; },
      type: 'options',
      key: 'destino',
      options: ["Brasile", "Italia", "Portogallo", "Francia", "Grecia", "Altra destinazione"]
    },
    {
      bot: "Un'altra domanda veloce: come avete conosciuto AQ Studio?",
      type: 'options',
      key: 'indicacao',
      options: ["Google", "Instagram", "Consiglio di un amico/a", "Altro"]
    },
    {
      bot: function(l){ return 'Per finire, ' + l.nome + ': qual è la data prevista (o desiderata) per il matrimonio?'; },
      type: 'text',
      key: 'data',
      placeholder: 'Es: 15/08/2027 oppure "non ancora deciso"'
    },
    {
      bot: function(l){ return 'Ottimo, ' + l.nome + '! Grazie per le vostre risposte 🥰 Iniziamo a pianificare insieme questo sogno? Per il prossimo passo, prenotate il vostro incontro qui:'; },
      type: 'final'
    }
  ];

  var panel, body, inputRow, textInput, sendBtn, launcher;

  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html !== undefined) e.innerHTML = html;
    return e;
  }

  function scrollBottom(){
    body.scrollTop = body.scrollHeight;
  }

  function pushBubble(text, sender){
    var m = el('div', 'msg ' + sender, text);
    body.appendChild(m);
    scrollBottom();
  }

  function showTyping(cb){
    var t = el('div', 'typing', '<span></span><span></span><span></span>');
    body.appendChild(t);
    scrollBottom();
    setTimeout(function(){
      t.remove();
      cb();
    }, 550 + Math.random() * 350);
  }

  function clearOptionsRow(){
    var existing = body.querySelectorAll('.chat-options');
    existing.forEach(function(o){ o.remove(); });
  }

  function waLink(message){
    return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(message);
  }

  function buildSummary(intent){
    var lines = [
      'Ciao! Ho trovato AQ Studio & Co. online e vorrei parlare del mio Destination Wedding.',
      '',
      'Nome: ' + (lead.nome || '-'),
      'Email: ' + (lead.email || '-'),
      'Telefono: ' + (lead.celular || '-'),
      'Nome del/della partner: ' + (lead.noivo || '-'),
      'Invitati: ' + (lead.convidados || '-'),
      'Budget: ' + (lead.orcamento || '-'),
      'Destinazione desiderata: ' + (lead.destino || '-'),
      'Come ha conosciuto AQ Studio: ' + (lead.indicacao || '-'),
      'Data prevista del matrimonio: ' + (lead.data || '-')
    ];
    if(intent === 'agendar'){
      lines.push('', 'Vorrei prenotare un incontro per parlarne con calma!');
    }
    return lines.join('\n');
  }

  function renderStep(){
    if(stepIndex >= steps.length) return;
    var step = steps[stepIndex];
    var botText = typeof step.bot === 'function' ? step.bot(lead) : step.bot;

    inputRow.classList.add('hidden');
    clearOptionsRow();

    showTyping(function(){
      pushBubble(botText, 'bot');

      if(step.type === 'options'){
        var wrap = el('div', 'chat-options');
        step.options.forEach(function(opt){
          var label = typeof opt === 'string' ? opt : opt.label;
          var btn = el('button', 'chat-opt', label);
          btn.type = 'button';
          btn.addEventListener('click', function(){
            answerOption(step, label);
          });
          wrap.appendChild(btn);
        });
        body.appendChild(wrap);
        scrollBottom();
      } else if(step.type === 'text'){
        inputRow.classList.remove('hidden');
        textInput.value = '';
        textInput.type = step.inputType || 'text';
        textInput.placeholder = step.placeholder || '';
        textInput.focus();
      } else if(step.type === 'final'){
        document.dispatchEvent(new CustomEvent('aq:lead_complete', { detail: lead }));
        var wrap = el('div', 'chat-options');
        var b1 = el('a', 'chat-opt final-link', '💬 Parla subito con noi');
        b1.href = waLink(buildSummary('humano'));
        b1.target = '_blank'; b1.rel = 'noopener';
        var b2 = el('a', 'chat-opt final-link', '📅 Prenota un incontro');
        b2.href = waLink(buildSummary('agendar'));
        b2.target = '_blank'; b2.rel = 'noopener';
        wrap.appendChild(b1);
        wrap.appendChild(b2);
        body.appendChild(wrap);
        scrollBottom();
      }
    });
  }

  function answerOption(step, label){
    clearOptionsRow();
    pushBubble(label, 'user');
    if(step.key) lead[step.key] = label;
    stepIndex++;
    setTimeout(renderStep, 250);
  }

  function submitText(){
    var step = steps[stepIndex];
    var val = textInput.value.trim();
    if(!val) { textInput.focus(); return; }
    pushBubble(val, 'user');
    if(step.key) lead[step.key] = val;
    inputRow.classList.add('hidden');
    stepIndex++;
    setTimeout(renderStep, 250);
  }

  function openPanel(){
    panel.classList.add('open');
    if(!started){
      started = true;
      renderStep();
    }
  }
  function closePanel(){ panel.classList.remove('open'); }

  function init(){
    launcher = document.getElementById('chatLauncher');
    panel = document.getElementById('chatPanel');
    body = document.getElementById('chatBody');
    inputRow = document.getElementById('chatInputRow');
    textInput = document.getElementById('chatTextInput');
    sendBtn = document.getElementById('chatSendBtn');
    var closeBtn = document.getElementById('chatCloseBtn');

    if(!panel) return;

    launcher.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    sendBtn.addEventListener('click', submitText);
    textInput.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); submitText(); }
    });

    document.querySelectorAll('[data-open-chat]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        openPanel();
      });
    });

    window.openAQChat = openPanel;
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
