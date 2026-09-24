document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  const board = document.getElementById('board');
  const addNoteBtn = document.getElementById('add-note-btn');
  const addImageNoteBtn = document.getElementById('add-image-note-btn');
  const boardImageInput = document.getElementById('board-image-input');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const resetViewBtn = document.getElementById('reset-view-btn');
  const langBtn = document.getElementById('lang-btn');
  const langText = document.getElementById('lang-text');
  const bgSelect = document.getElementById('bg-select');
  const textToolbar = document.getElementById('text-toolbar');
  const fontSelect = document.getElementById('font-family-select');

  // عناصر الرسم
  const drawModeBtn = document.getElementById('draw-mode-btn');
  const drawingToolbar = document.getElementById('drawing-toolbar');
  const canvas = document.getElementById('drawing-canvas');
  const ctx = canvas.getContext('2d');
  const brushColorInput = document.getElementById('brush-color');
  const brushSizeSelect = document.getElementById('brush-size');
  const eraserBtn = document.getElementById('eraser-btn');
  const clearDrawingBtn = document.getElementById('clear-drawing-btn');
  const closeDrawingBtn = document.getElementById('close-drawing-btn');

  let currentLang = 'ar';
  let activeNote = null;
  let noteOffsetX = 0;
  let noteOffsetY = 0;
  let highestZIndex = 10;

  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panX = -4500;
  let panY = -4500;

  // حالات الرسم
  let isDrawingMode = false;
  let isDrawing = false;
  let isEraser = false;
  let lastX = 0;
  let lastY = 0;

  function updateBoardTransform() {
    board.style.transform = `translate(${panX}px, ${panY}px)`;
  }
  updateBoardTransform();

  resetViewBtn.addEventListener('click', () => {
    panX = -4500;
    panY = -4500;
    updateBoardTransform();
  });

  // --- تفعيل / إغلاق وضع الرسم ---
  function toggleDrawingMode(enable) {
    isDrawingMode = enable !== undefined ? enable : !isDrawingMode;
    if (isDrawingMode) {
      container.classList.add('drawing-mode');
      drawModeBtn.classList.add('active');
      drawingToolbar.classList.remove('hidden');
    } else {
      container.classList.remove('drawing-mode');
      drawModeBtn.classList.remove('active');
      drawingToolbar.classList.add('hidden');
    }
  }

  drawModeBtn.addEventListener('click', () => toggleDrawingMode());
  closeDrawingBtn.addEventListener('click', () => toggleDrawingMode(false));

  eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    eraserBtn.classList.toggle('active', isEraser);
  });

  clearDrawingBtn.addEventListener('click', () => {
    if (confirm('هل تريد مسح جميع الخطوط والرسومات؟')) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });

  // --- أحداث الرسم بالماوس واللمس على الكانفاس ---
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  canvas.addEventListener('mousedown', (e) => {
    if (!isDrawingMode) return;
    isDrawing = true;
    const coords = getCanvasCoords(e);
    lastX = coords.x;
    lastY = coords.y;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawingMode || !isDrawing) return;
    const coords = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = parseInt(brushSizeSelect.value) * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColorInput.value;
      ctx.lineWidth = brushSizeSelect.value;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    ctx.stroke();
    lastX = coords.x;
    lastY = coords.y;
  });

  document.addEventListener('mouseup', () => isDrawing = false);

  // --- تحميل وتطبيق الخطوط المنسدلة من Google Fonts ---
  function applySelectedFont(fontName) {
    if (!fontName) return;
    const formattedFontName = fontName.trim();
    const googleFontUrlName = formattedFontName.replace(/\s+/g, '+');
    const fontLinkId = `gfont-${formattedFontName.toLowerCase().replace(/\s+/g, '-')}`;

    if (!document.getElementById(fontLinkId)) {
      const link = document.createElement('link');
      link.id = fontLinkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${googleFontUrlName}:wght@400;600;700&display=swap`;
      document.head.appendChild(link);
    }

    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontFamily = `'${formattedFontName}', sans-serif`;
    
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      selection.removeAllRanges();
    } catch (e) {
      document.execCommand('fontName', false, formattedFontName);
    }
  }

  fontSelect.addEventListener('change', (e) => applySelectedFont(e.target.value));

  // --- نصوص الترجمة ---
  const translations = {
    ar: {
      appTitle: 'لوحة الأفكار الزجاجية',
      bgLabel: 'الخلفية:',
      bgDarkPurple: 'بنفسجي داكن',
      bgDeepBlue: 'أزرق عميق',
      bgMidnight: 'ليل أسود',
      bgSunset: 'غروب دافئ',
      bgEmerald: 'زمردي',
      resetView: 'إعادة ضبط اللوحة',
      drawMode: 'وضع الرسم',
      addNote: 'إضافة ملاحظة',
      addImage: 'إضافة صورة',
      clearAll: 'مسح الكل',
      drawingTools: 'أدوات الرسم',
      fontSizeNormal: 'عادي',
      fontSizeSmall: 'صغير',
      fontSizeLarge: 'كبير',
      fontSizeTitle: 'عنوان',
      placeholder: 'اكتب أفكارك هنا...',
      confirmClear: 'هل أنت تأكد من رغبتك في مسح جميع الملاحظات والرسومات؟',
      welcomeNote: 'مرحباً بك! 👋<br>الآن يمكنك <b>الرسم</b>، و<b>إضافة الصور</b> داخل الملاحظات أو كـ عناصر مستقلة على اللوحة.',
    },
    en: {
      appTitle: 'Glassmorphism Board',
      bgLabel: 'Background:',
      bgDarkPurple: 'Dark Purple',
      bgDeepBlue: 'Deep Blue',
      bgMidnight: 'Midnight Black',
      bgSunset: 'Warm Sunset',
      bgEmerald: 'Emerald',
      resetView: 'Reset View',
      drawMode: 'Drawing Mode',
      addNote: 'Add Note',
      addImage: 'Add Image',
      clearAll: 'Clear All',
      drawingTools: 'Drawing Tools',
      fontSizeNormal: 'Normal',
      fontSizeSmall: 'Small',
      fontSizeLarge: 'Large',
      fontSizeTitle: 'Title',
      placeholder: 'Type your ideas here...',
      confirmClear: 'Are you sure you want to clear all notes and drawings?',
      welcomeNote: 'Welcome! 👋<br>You can now <b>Draw</b> and <b>Attach Images</b> directly inside notes or on the canvas.',
    }
  };

  function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    langText.textContent = lang === 'ar' ? 'English' : 'عربي';

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) el.textContent = translations[lang][key];
    });

    document.querySelectorAll('.note-body').forEach(noteBody => {
      noteBody.setAttribute('placeholder', translations[lang].placeholder);
    });
  }

  langBtn.addEventListener('click', () => setLanguage(currentLang === 'ar' ? 'en' : 'ar'));
  bgSelect.addEventListener('change', (e) => document.body.className = e.target.value);

  // --- إظهار شريط الأدوات النصية العائم ---
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (!selection.isCollapsed && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const containerElement = range.commonAncestorContainer.parentElement;

      if (containerElement && containerElement.closest('.note-body')) {
        const rect = range.getBoundingClientRect();
        textToolbar.style.top = `${Math.max(10, rect.top - 55)}px`;
        textToolbar.style.left = `${rect.left + (rect.width / 2) - 200}px`;
        textToolbar.classList.remove('hidden');
        return;
      }
    }
    textToolbar.classList.add('hidden');
  });

  document.querySelectorAll('.format-btn[data-command]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.execCommand(btn.getAttribute('data-command'), false, null);
    });
  });

  document.getElementById('font-size-select').addEventListener('change', (e) => {
    document.execCommand('fontSize', false, e.target.value);
  });

  document.getElementById('text-color-picker').addEventListener('input', (e) => {
    document.execCommand('foreColor', false, e.target.value);
  });

  // --- إنشاء الملاحظات النصية ---
  function createNote(x = 4800, y = 4800, text = '', theme = '') {
    const note = document.createElement('div');
    note.classList.add('sticky-note');
    if (theme) note.classList.add(theme);

    note.style.left = `${x}px`;
    note.style.top = `${y}px`;
    note.style.zIndex = ++highestZIndex;

    note.innerHTML = `
      <div class="note-header">
        <div class="color-picker">
          <span class="color-dot default" data-theme=""></span>
          <span class="color-dot blue" data-theme="theme-blue"></span>
          <span class="color-dot green" data-theme="theme-green"></span>
          <span class="color-dot yellow" data-theme="theme-yellow"></span>
          <span class="color-dot purple" data-theme="theme-purple"></span>
        </div>
        <div class="header-actions">
          <button class="icon-btn add-inline-img-btn" title="إضافة صورة داخل النوت"><i class="fa-solid fa-camera"></i></button>
          <input type="file" class="inline-img-input" accept="image/*" style="display:none;">
          <button class="delete-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
      <div class="note-body" contenteditable="true" placeholder="${translations[currentLang].placeholder}">${text}</div>
    `;

    setupNoteEvents(note);
    board.appendChild(note);
  }

  // --- إنشاء نوت تحتوي على صورة عائمة على الباك جراوند ---
  function createImageNote(x = 4800, y = 4800, imgSrc = '') {
    const note = document.createElement('div');
    note.classList.add('image-note');

    note.style.left = `${x}px`;
    note.style.top = `${y}px`;
    note.style.zIndex = ++highestZIndex;

    note.innerHTML = `
      <div class="note-header">
        <div class="color-picker">
          <span class="color-dot default" data-theme=""></span>
          <span class="color-dot blue" data-theme="theme-blue"></span>
          <span class="color-dot green" data-theme="theme-green"></span>
          <span class="color-dot yellow" data-theme="theme-yellow"></span>
          <span class="color-dot purple" data-theme="theme-purple"></span>
        </div>
        <button class="delete-btn"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="image-note-body">
        <img src="${imgSrc}" alt="Note Image">
      </div>
    `;

    setupNoteEvents(note);
    board.appendChild(note);
  }

  // --- أحداث الملاحظات والصور (سحب، رفع صور، تغيير لون) ---
  function setupNoteEvents(note) {
    const header = note.querySelector('.note-header');
    const deleteBtn = note.querySelector('.delete-btn');
    const colorDots = note.querySelectorAll('.color-dot');
    const inlineImgBtn = note.querySelector('.add-inline-img-btn');
    const inlineImgInput = note.querySelector('.inline-img-input');

    note.addEventListener('mousedown', () => {
      note.style.zIndex = ++highestZIndex;
    });

    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('color-dot') || e.target.closest('.delete-btn') || e.target.closest('.icon-btn')) return;
      activeNote = note;
      const rect = note.getBoundingClientRect();
      noteOffsetX = e.clientX - rect.left;
      noteOffsetY = e.clientY - rect.top;
      note.classList.add('dragging');
      e.stopPropagation();
    });

    // رفع صورة لداخل النوت النصية
    if (inlineImgBtn && inlineImgInput) {
      inlineImgBtn.addEventListener('click', () => inlineImgInput.click());
      inlineImgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.classList.add('note-inline-img');
            const noteBody = note.querySelector('.note-body');
            noteBody.appendChild(img);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    colorDots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        note.classList.remove('theme-blue', 'theme-green', 'theme-yellow', 'theme-purple');
        const selectedTheme = dot.getAttribute('data-theme');
        if (selectedTheme) note.classList.add(selectedTheme);
      });
    });

    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      note.remove();
    });
  }

  // إضافة صورة مستقيلة على الباك جراوند
  addImageNoteBtn.addEventListener('click', () => boardImageInput.click());
  boardImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const currentViewX = -panX + (window.innerWidth / 2) - 160;
        const currentViewY = -panY + (window.innerHeight / 2) - 100;
        createImageNote(currentViewX, currentViewY, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // تحريك البورد بالماوس
  container.addEventListener('mousedown', (e) => {
    if (isDrawingMode) return;
    if (e.target === container || e.target === board || e.target === canvas) {
      isPanning = true;
      panStartX = e.clientX - panX;
      panStartY = e.clientY - panY;
      container.classList.add('panning');
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isPanning) {
      panX = e.clientX - panStartX;
      panY = e.clientY - panStartY;
      updateBoardTransform();
      return;
    }

    if (activeNote) {
      const boardRect = board.getBoundingClientRect();
      const left = e.clientX - boardRect.left - noteOffsetX;
      const top = e.clientY - boardRect.top - noteOffsetY;

      activeNote.style.left = `${left}px`;
      activeNote.style.top = `${top}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isPanning) {
      isPanning = false;
      container.classList.remove('panning');
    }
    if (activeNote) {
      activeNote.classList.remove('dragging');
      activeNote = null;
    }
  });

  addNoteBtn.addEventListener('click', () => {
    const offset = Math.floor(Math.random() * 40);
    const currentViewX = -panX + (window.innerWidth / 2) - 150 + offset;
    const currentViewY = -panY + (window.innerHeight / 2) - 110 + offset;
    createNote(currentViewX, currentViewY);
  });

  clearAllBtn.addEventListener('click', () => {
    if (confirm(translations[currentLang].confirmClear)) {
      board.querySelectorAll('.sticky-note, .image-note').forEach(el => el.remove());
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });

  createNote(4700, 4720, translations.ar.welcomeNote, 'theme-purple');
});