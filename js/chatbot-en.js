/* ==========================================================================
   AQ Studio & Co. — Lead qualification chatbot (English version)
   100% client-side: at the end, the collected data is sent to the team's
   WhatsApp (no backend/storage on this site yet).
   ========================================================================== */
(function(){

  var WA_PHONE = '5541996221890';

  var lead = {};
  var stepIndex = 0;
  var started = false;

  var steps = [
    {
      bot: "Hi there! Want to plan a Destination Wedding stress-free? 💍",
      type: 'options',
      options: [{ label: "Yes, I need help 🙏", value: "yes" }]
    },
    {
      bot: "I'm here to help! 😊 To get started, I just need a few quick answers. What's your name?",
      type: 'text',
      key: 'nome',
      placeholder: 'Enter your name'
    },
    {
      bot: function(l){ return 'Nice to meet you, ' + l.nome + '! 👋 Which email would you like to receive more information at?'; },
      type: 'text',
      key: 'email',
      inputType: 'email',
      placeholder: 'you@email.com'
    },
    {
      bot: "Could you share your phone number (with country code)?",
      type: 'text',
      key: 'celular',
      inputType: 'tel',
      placeholder: '+1 555 000 0000'
    },
    {
      bot: "Wonderful, we're almost there 😊 What's your partner's name?",
      type: 'text',
      key: 'noivo',
      placeholder: "Partner's name"
    },
    {
      bot: "How many guests will be at the wedding?",
      type: 'options',
      key: 'convidados',
      options: ["Up to 50 guests", "Between 50 and 80 guests", "Between 80 and 150 guests", "More than 150 guests"]
    },
    {
      bot: "What's your estimated budget?",
      type: 'options',
      key: 'orcamento',
      options: ["Up to $20,000", "Between $20,000 and $40,000", "Between $40,000 and $80,000", "Above $80,000"]
    },
    {
      bot: function(l){ return 'And where do you want to get married, ' + l.nome + '? It can be here in Brazil or at an international destination, like Italy, Portugal and so on...'; },
      type: 'options',
      key: 'destino',
      options: ["Brazil", "Italy", "Portugal", "France", "Greece", "Another destination"]
    },
    {
      bot: "One more quick one: how did you hear about AQ Studio?",
      type: 'options',
      key: 'indicacao',
      options: ["Google", "Instagram", "Friend referral", "Other"]
    },
    {
      bot: function(l){ return "Last question, " + l.nome + ": what's the planned (or desired) date for the wedding?"; },
      type: 'text',
      key: 'data',
      placeholder: 'E.g. 08/15/2027 or "not decided yet"'
    },
    {
      bot: function(l){ return 'Excellent, ' + l.nome + '! Thank you for your answers 🥰 Shall we start planning this dream together? To take the next step, schedule your meeting here:'; },
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
      "Hello! I found AQ Studio & Co. online and I'd like to talk about my Destination Wedding.",
      '',
      'Name: ' + (lead.nome || '-'),
      'Email: ' + (lead.email || '-'),
      'Phone: ' + (lead.celular || '-'),
      "Partner's name: " + (lead.noivo || '-'),
      'Guests: ' + (lead.convidados || '-'),
      'Budget: ' + (lead.orcamento || '-'),
      'Desired destination: ' + (lead.destino || '-'),
      'How they heard about AQ Studio: ' + (lead.indicacao || '-'),
      'Planned wedding date: ' + (lead.data || '-')
    ];
    if(intent === 'agendar'){
      lines.push('', "I'd like to schedule a meeting to talk it through!");
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
        var b1 = el('a', 'chat-opt final-link', '💬 Talk to a human now');
        b1.href = waLink(buildSummary('humano'));
        b1.target = '_blank'; b1.rel = 'noopener';
        var b2 = el('a', 'chat-opt final-link', '📅 Schedule a meeting');
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
