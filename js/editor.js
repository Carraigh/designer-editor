// === Настройки по умолчанию ===
const defaultHTML = `<!-- Привет! 👋 Напиши здесь HTML — результат появится сразу -->\n<h1>Привет, дизайнер!</h1>\n<p>Измени этот текст — результат обновится сразу.</p>`;

const defaultCSS = `/* Привет! 👋 Меняй цвета, отступы, шрифты — экспериментируй! */\nbody {\n  background-color: #f9f9f9;\n  color: #333;\n  padding: 20px;\n  font-family: sans-serif;\n  line-height: 1.5;\n}\n\nh1 {\n  color: #FF6B6B;\n  font-size: 1.8em;\n}\n\np {\n  color: #555;\n}`;

const defaultJS = `// Привет! 👋 Здесь можно писать JavaScript\n// Попробуй: document.querySelector('h1').style.color = 'green';`;

const templates = {
  button: `<button class="btn">Кнопка</button>`,
  card: `<div class="card"><h2>Карточка</h2><p>Текст внутри карточки</p></div>`,
  form: `<form><label>Имя:<br><input type="text" /></label><br><br><button type="submit">Отправить</button></form>`,
  nav: `<nav><a href="#">Главная</a> | <a href="#">О нас</a> | <a href="#">Контакты</a></nav>`
};

// === Элементы DOM ===
const htmlTextarea = document.getElementById('html-editor');
const cssTextarea = document.getElementById('css-editor');
const jsTextarea = document.getElementById('js-editor');
const outputFrame = document.getElementById('output-frame');
const menuToggle = document.getElementById('menu-toggle');
const dropdownMenu = document.getElementById('dropdown-menu');
const fileHtmlInput = document.getElementById('file-html');
const fileCssInput = document.getElementById('file-css');
const jsEditorContainer = document.querySelector('.js-editor-container');
const toggleJsBtn = document.getElementById('toggle-js-btn');

// === Инициализация редакторов ===
let htmlEditor, cssEditor, jsEditor;

document.addEventListener('DOMContentLoaded', () => {
  htmlEditor = CodeMirror.fromTextArea(htmlTextarea, {
    mode: 'text/html',
    theme: 'dracula',
    lineNumbers: true,
    tabindex: 1
  });

  cssEditor = CodeMirror.fromTextArea(cssTextarea, {
    mode: 'text/css',
    theme: 'dracula',
    lineNumbers: true,
    tabindex: 2
  });

  jsEditor = CodeMirror.fromTextArea(jsTextarea, {
    mode: 'javascript',
    theme: 'dracula',
    lineNumbers: true,
    tabindex: 3
  });

  // Загрузка сохранённого / дефолтного
  const savedHtml = localStorage.getItem('html');
  const savedCss = localStorage.getItem('css');
  const savedJs = localStorage.getItem('js');
  const jsEnabled = localStorage.getItem('jsEnabled') === 'true';

  htmlEditor.setValue(savedHtml || defaultHTML);
  cssEditor.setValue(savedCss || defaultCSS);
  jsEditor.setValue(savedJs || defaultJS);

  if (jsEnabled) {
    jsEditorContainer.classList.remove('hidden');
    toggleJsBtn.textContent = '– JS';
  }

  applyCode();

  // === События кнопок ===
  document.getElementById('apply-btn').addEventListener('click', applyCode);
  document.getElementById('save-html-btn').addEventListener('click', () => saveTextToFile(htmlEditor.getValue(), 'index.html', 'text/html'));
  document.getElementById('save-css-btn').addEventListener('click', () => saveTextToFile(cssEditor.getValue(), 'style.css', 'text/css'));
  document.getElementById('reset-btn').addEventListener('click', resetToDefault);
  document.getElementById('open-html-btn').addEventListener('click', () => fileHtmlInput.click());
  document.getElementById('open-css-btn').addEventListener('click', () => fileCssInput.click());
  toggleJsBtn.addEventListener('click', toggleJS);
  document.getElementById('theme-btn').addEventListener('click', toggleTheme);

  // Шаблоны
  document.querySelectorAll('[data-template]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.dataset.template;
      insertTemplate(type);
    });
  });

  // Меню
  menuToggle.addEventListener('click', toggleMenu);

  // Закрытие меню по клику ВНЕ
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-wrapper')) {
      dropdownMenu.style.display = 'none';
    }
  });

  // Ctrl+Enter → применить
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      applyCode();
    }
  });

  // Загрузка файлов
  fileHtmlInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        htmlEditor.setValue(reader.result);
        applyCode();
      };
      reader.readAsText(file);
    }
  });

  fileCssInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        cssEditor.setValue(reader.result);
        applyCode();
      };
      reader.readAsText(file);
    }
  });
});

// === Функции ===
function insertTemplate(type) {
  const code = templates[type];
  htmlEditor.replaceSelection('\n' + code + '\n');
  applyCode();
}

function toggleMenu() {
  dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex';
}

function isWellFormed(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return !doc.querySelector('parsererror');
}

function applyCode() {
  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();
  const js = jsEditor.getValue();

  try {
    if (!isWellFormed(html)) {
      throw new Error("HTML содержит ошибки разметки");
    }

    outputFrame.classList.add('apply-fade');
    setTimeout(() => {
      const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}<\/script>
        </body>
        </html>
      `;
      outputFrame.srcdoc = fullHTML;
      outputFrame.classList.remove('apply-fade');
    }, 150);

    htmlEditor.getWrapperElement().style.borderColor = '#ccc';
    cssEditor.getWrapperElement().style.borderColor = '#ccc';
    jsEditor.getWrapperElement().style.borderColor = '#ccc';

    localStorage.setItem('html', html);
    localStorage.setItem('css', css);
    localStorage.setItem('js', js);
    if (jsEditorContainer.classList.contains('hidden')) {
      localStorage.setItem('jsEnabled', 'false');
    } else {
      localStorage.setItem('jsEnabled', 'true');
    }

  } catch (e) {
    alert("Ошибка в коде!\n" + e.message);
    htmlEditor.getWrapperElement().style.borderColor = 'red';
    cssEditor.getWrapperElement().style.borderColor = 'red';
    jsEditor.getWrapperElement().style.borderColor = 'red';
  }
}

function toggleJS() {
  jsEditorContainer.classList.toggle('hidden');
  if (jsEditorContainer.classList.contains('hidden')) {
    toggleJsBtn.textContent = '+ JS';
    localStorage.setItem('jsEnabled', 'false');
  } else {
    toggleJsBtn.textContent = '– JS';
    localStorage.setItem('jsEnabled', 'true');
  }

  // Перестроить layout — 2, 3 или 4 блока
  const editors = document.querySelectorAll('.editor-container:not(.hidden)');
  const totalBlocks = editors.length + 1; // + iframe
  const width = 100 / totalBlocks;

  editors.forEach(el => {
    el.style.width = `${width}%`;
  });
  outputFrame.style.width = `${width}%`;
}

async function saveTextToFile(content, suggestedName, mimeType = 'text/plain') {
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ accept: { [mimeType]: ['.txt', '.html', '.css', '.js'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      alert(`Файл "${suggestedName}" сохранён.`);
      return;
    } catch (err) {
      console.warn("showSaveFilePicker недоступен:", err);
    }
  }

  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
  a.download = suggestedName;
  a.click();
  URL.revokeObjectURL(a.href);
}

function resetToDefault() {
  if (confirm("Сбросить всё? Ты потеряешь текущие изменения.")) {
    htmlEditor.setValue(defaultHTML);
    cssEditor.setValue(defaultCSS);
    jsEditor.setValue(defaultJS);
    localStorage.removeItem('html');
    localStorage.removeItem('css');
    localStorage.removeItem('js');
    applyCode();
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  const theme = isDark ? 'dracula' : 'base16-light';
  htmlEditor.setOption('theme', theme);
  cssEditor.setOption('theme', theme);
  jsEditor.setOption('theme', theme);
}
