    tailwind.config = {
      theme: {
        extend: {
          colors: {
            ivory: '#FFFEF7',
            champagne: '#C9A96E',
            nude: '#E8DDD3',
            warmgold: '#B8860B',
            softcream: '#FBF7F0'
          },
          fontFamily: {
            cormorant: ['Cormorant Garamond', 'serif'],
            josefin: ['Josefin Sans', 'sans-serif'],
            vibes: ['Great Vibes', 'cursive']
          }
        }
      }
    }

    // ===== CONFIG & STATE =====
    const defaultConfig = {
      groom_name: 'Andi Pratama',
      bride_name: 'Sarah Amalia',
      wedding_date: '14 Mei 2026',
      quote_text: '"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu merasa tentram kepadanya."',
      akad_time: '08:00 WIB',
      resepsi_time: '11:00 - 14:00 WIB',
      venue_name: 'BOEMI PRASASTI',
      venue_address: 'KP. KEBON KOPI No.62 Ds, RT./RW/RW.002/001, Sukadami, Cikarang Sel., Kabupaten Bekasi, Jawa Barat 17530',
      bank_name: 'DANA',
      account_number: '089671456598',
      account_holder: 'Andi Pratama',
      background_color: '#FFFEF7',
      surface_color: '#FBF7F0',
      text_color: '#B8860B',
      primary_action_color: '#C9A96E',
      secondary_action_color: '#E8DDD3',
      font_family: 'Cormorant Garamond',
      font_size: 16
    };

    let allData = [];
    let musicPlaying = false;
    let audioCtx = null;

    // ===== ELEMENT SDK =====
    window.elementSdk.init({
      defaultConfig,
      onConfigChange: async (config) => {
        const c = { ...defaultConfig, ...config };
        const el = (id) => document.getElementById(id);
        
        // Update text
        const gShort = c.groom_name.split(',')[0].split(' ')[0];
        const bShort = c.bride_name.split(',')[0].split(' ')[0];
        if(el('coverGroom')) el('coverGroom').textContent = gShort;
        if(el('coverBride')) el('coverBride').textContent = bShort;
        if(el('coverDate')) el('coverDate').textContent = c.wedding_date;
        if(el('heroGroom')) el('heroGroom').textContent = c.groom_name;
        if(el('heroBride')) el('heroBride').textContent = c.bride_name;
        if(el('heroQuote')) el('heroQuote').textContent = c.quote_text;
        if(el('akadTime')) el('akadTime').textContent = c.akad_time;
        if(el('resepsiTime')) el('resepsiTime').textContent = c.resepsi_time;
        if(el('resepsiVenue')) el('resepsiVenue').textContent = c.venue_name;
        if(el('venueAddress')) el('venueAddress').textContent = c.venue_address;
        if(el('giftBank')) el('giftBank').textContent = c.bank_name;
        if(el('giftAccount')) el('giftAccount').textContent = c.account_number;
        if(el('giftHolder')) el('giftHolder').textContent = 'a.n. ' + c.account_holder;
        if(el('closingNames')) el('closingNames').textContent = gShort + ' & ' + bShort;

        // Colors
        document.body.style.backgroundColor = c.background_color;
        document.querySelectorAll('.font-cormorant, .font-vibes').forEach(e => {
          if(!e.classList.contains('text-white')) e.style.color = c.text_color;
        });
      },
      mapToCapabilities: (config) => {
        const c = { ...defaultConfig, ...config };
        return {
          recolorables: [
            { get: () => c.background_color, set: (v) => { c.background_color = v; window.elementSdk.setConfig({ background_color: v }); }},
            { get: () => c.surface_color, set: (v) => { c.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); }},
            { get: () => c.text_color, set: (v) => { c.text_color = v; window.elementSdk.setConfig({ text_color: v }); }},
            { get: () => c.primary_action_color, set: (v) => { c.primary_action_color = v; window.elementSdk.setConfig({ primary_action_color: v }); }},
            { get: () => c.secondary_action_color, set: (v) => { c.secondary_action_color = v; window.elementSdk.setConfig({ secondary_action_color: v }); }}
          ],
          borderables: [],
          fontEditable: {
            get: () => c.font_family,
            set: (v) => { c.font_family = v; window.elementSdk.setConfig({ font_family: v }); }
          },
          fontSizeable: {
            get: () => c.font_size,
            set: (v) => { c.font_size = v; window.elementSdk.setConfig({ font_size: v }); }
          }
        };
      },
      mapToEditPanelValues: (config) => {
        const c = { ...defaultConfig, ...config };
        return new Map([
          ['groom_name', c.groom_name],
          ['bride_name', c.bride_name],
          ['wedding_date', c.wedding_date],
          ['quote_text', c.quote_text],
          ['akad_time', c.akad_time],
          ['resepsi_time', c.resepsi_time],
          ['venue_name', c.venue_name],
          ['venue_address', c.venue_address],
          ['bank_name', c.bank_name],
          ['account_number', c.account_number],
          ['account_holder', c.account_holder]
        ]);
      }
    });

    // ===== DATA SDK =====
    const dataHandler = {
      onDataChanged(data) {
        allData = data;
        renderWishes();
      }
    };

    (async () => {
      const r = await window.dataSdk.init(dataHandler);
      if (!r.isOk) console.error('Data SDK init failed');
    })();

    function renderWishes() {
      const wishes = allData.filter(d => d.type === 'rsvp' && d.message);
      const container = document.getElementById('wishesList');
      if (!wishes.length) {
        container.innerHTML = '<p class="text-warmgold/40 text-sm italic">Belum ada ucapan.</p>';
        return;
      }
      const existingEls = new Map([...container.children].map(el => [el.dataset.id, el]));
      const fragment = document.createDocumentFragment();
      wishes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).forEach(w => {
        if (existingEls.has(w.__backendId)) {
          const el = existingEls.get(w.__backendId);
          fragment.appendChild(el);
          existingEls.delete(w.__backendId);
        } else {
          const div = document.createElement('div');
          div.dataset.id = w.__backendId;
          div.className = 'glass-card p-4 text-left';
          div.innerHTML = `<p class="font-cormorant text-lg text-warmgold">${escHtml(w.name)}</p><p class="text-warmgold/60 text-sm mt-1">${escHtml(w.message)}</p>`;
          fragment.appendChild(div);
        }
      });
      existingEls.forEach(el => el.remove());
      container.innerHTML = '';
      container.appendChild(fragment);
    }

    function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    // ===== RSVP FORM =====
    document.getElementById('rsvpForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (allData.length >= 999) {
        showToast('Batas data tercapai, tidak dapat mengirim.');
        return;
      }
      const btn = document.getElementById('rsvpSubmitBtn');
      btn.disabled = true;
      btn.textContent = 'Mengirim...';

      const result = await window.dataSdk.create({
        type: 'rsvp',
        name: document.getElementById('rsvpName').value.trim(),
        attendance: document.getElementById('rsvpAttend').value,
        guest_count: parseInt(document.getElementById('rsvpGuests').value) || 1,
        message: document.getElementById('rsvpMsg').value.trim(),
        created_at: new Date().toISOString()
      });

      btn.disabled = false;
      btn.textContent = 'Kirim RSVP';

      if (result.isOk) {
        document.getElementById('rsvpForm').style.display = 'none';
        document.getElementById('rsvpSuccess').classList.add('show');
      } else {
        showToast('Gagal mengirim, coba lagi.');
      }
    });

    // ===== OPENING =====
    function openInvitation() {
      document.getElementById('openingScreen').style.transition = 'opacity 0.8s ease';
      document.getElementById('openingScreen').style.opacity = '0';
      setTimeout(() => {
        document.getElementById('openingScreen').style.display = 'none';
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('floatingNav').classList.add('show');
        document.getElementById('musicBtn').classList.add('show');
        startCountdown();
        initScrollReveal();
        triggerConfetti();
        startMusic();
      }, 800);
    }

    // ===== COUNTDOWN =====
    function startCountdown() {
      const target = new Date('2026-05-14T08:00:00+07:00');
      function update() {
        const now = new Date();
        const diff = Math.max(0, target - now);
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('cdDays').textContent = String(d).padStart(2, '0');
        document.getElementById('cdHours').textContent = String(h).padStart(2, '0');
        document.getElementById('cdMins').textContent = String(m).padStart(2, '0');
        document.getElementById('cdSecs').textContent = String(s).padStart(2, '0');
      }
      update();
      setInterval(update, 1000);
    }

    // ===== SCROLL REVEAL =====
    function initScrollReveal() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
      }, { threshold: 0.1 });
      document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    }

    // ===== MUSIC (Web Audio API) =====
    function startMusic() {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        playMelody();
        musicPlaying = true;
      } catch(e) {}
    }

    function playMelody() {
      if (!audioCtx || audioCtx.state === 'closed') return;
      // Simple wedding-like melody
      const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 698.46, 659.25, 587.33];
      const duration = 0.8;
      let time = audioCtx.currentTime;
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, time + i * duration);
        gain.gain.linearRampToValueAtTime(0.08, time + i * duration + 0.1);
        gain.gain.linearRampToValueAtTime(0, time + (i + 1) * duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time + i * duration);
        osc.stop(time + (i + 1) * duration);
      });
      // Loop
      setTimeout(() => { if (musicPlaying) playMelody(); }, notes.length * duration * 1000 + 500);
    }

    function toggleMusic() {
      if (musicPlaying) {
        musicPlaying = false;
        if (audioCtx) audioCtx.close();
        audioCtx = null;
      } else {
        startMusic();
      }
    }

    // ===== LIGHTBOX =====
    function openLightbox(el) {
      const emoji = el.querySelector('div').textContent.trim();
      document.getElementById('lightboxContent').textContent = emoji;
      document.getElementById('lightbox').classList.add('active');
    }
    function closeLightbox() { document.getElementById('lightbox').classList.remove('active'); }

    // ===== COPY ACCOUNT =====
    function copyAccount() {
      const config = window.elementSdk.config || defaultConfig;
      const num = config.account_number || defaultConfig.account_number;
      navigator.clipboard.writeText(num).then(() => showToast('Nomor rekening disalin!'));
    }

    function showToast(msg) {
      const t = document.getElementById('copyToast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2500);
    }

    // ===== SAVE THE DATE =====
    function saveTheDate() {
      const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+Andi+%26+Sarah&dates=20260514T010000Z/20260514T070000Z&details=Undangan+Pernikahan&location=Jakarta';
      window.open(url, '_blank');
    }

    // ===== CONFETTI =====
    function triggerConfetti() {
      const colors = ['#C9A96E', '#E8DDD3', '#B8860B', '#FFFEF7', '#f5c6d0'];
      for (let i = 0; i < 40; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 2 + 's';
        piece.style.animationDuration = (2 + Math.random() * 2) + 's';
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 5000);
      }
    }

    // ===== SCROLL TO =====
    function scrollToSection(id) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }

    // ===== INIT =====
    lucide.createIcons();