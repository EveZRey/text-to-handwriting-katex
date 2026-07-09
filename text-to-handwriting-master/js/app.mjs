import {
  addFontFromFile,
  formatText,
  addPaperFromFile
} from './utils/helpers.mjs';
import {
  generateImages,
  downloadAsPDF,
  deleteAll
} from './generate-images.mjs';
import { setInkColor, toggleDrawCanvas } from './utils/draw.mjs';

/*(KaTeX + Markdown Injection) */
const renderMathInPaper = () => {
  const paper = document.querySelector('.page-a .paper-content');
  if (!paper) return;

  let html = paper.innerHTML;
  let elementosEncontrados = false;

  // 1. Procesar Ecuaciones en Bloque ($$) -> Grandes y centradas
  const blockRegex = /\$\$(.*?)\$\$/gs;
  html = html.replace(blockRegex, (match, ecuacion) => {
    elementosEncontrados = true;
    try {
      let eqLimpia = ecuacion
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ');
      return katex.renderToString(eqLimpia.trim(), {
        throwOnError: false,
        displayMode: true
      });
    } catch (e) {
      return match;
    }
  });

  // 2. Procesar Ecuaciones en Línea ($) -> Pequeñas y sobre el mismo renglón
  // El regex asegura que no procese dólares sueltos por accidente (ej. "Cuesta $5")
  const inlineRegex = /\$((?:[^$]|\\\$)+?)\$/g;
  html = html.replace(inlineRegex, (match, ecuacion) => {
    elementosEncontrados = true;
    try {
      let eqLimpia = ecuacion
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ');
      return katex.renderToString(eqLimpia.trim(), {
        throwOnError: false,
        displayMode: false
      });
    } catch (e) {
      return match;
    }
  });

  // 3. Procesar Negritas de Markdown (**)
  const boldRegex = /\*\*(.*?)\*\*/g;
  html = html.replace(boldRegex, (match, texto) => {
    elementosEncontrados = true;
    return `<b>${texto}</b>`;
  });

  
  if (elementosEncontrados) {
    paper.innerHTML = html;
  }
};


const pageEl = document.querySelector('.page-a');
const setTextareaStyle = (attrib, v) => (pageEl.style[attrib] = v);

const EVENT_MAP = {
  '#render-math-button': {
    on: 'click',
    action: (e) => {
      e.preventDefault();
      renderMathInPaper();
    }
  },
  '#generate-image-form': {
    on: 'submit',
    action: (e) => {
      e.preventDefault();
      generateImages();
    }
  },
  '#handwriting-font': {
    on: 'change',
    action: (e) =>
      document.body.style.setProperty('--handwriting-font', e.target.value)
  },
  '#font-size': {
    on: 'change',
    action: (e) => {
      if (e.target.value > 30) {
        alert('Font-size is too big try upto 30');
      } else {
        setTextareaStyle('fontSize', e.target.value + 'pt');
        e.preventDefault();
      }
    }
  },
  '#letter-spacing': {
    on: 'change',
    action: (e) => {
      if (e.target.value > 40) {
        alert('Letter Spacing is too big try a number upto 40');
      } else {
        setTextareaStyle('letterSpacing', e.target.value + 'px');
        e.preventDefault();
      }
    }
  },
  '#word-spacing': {
    on: 'change',
    action: (e) => {
      if (e.target.value > 100) {
        alert('Word Spacing is too big try a number upto hundred');
      } else {
        setTextareaStyle('wordSpacing', e.target.value + 'px');
        e.preventDefault();
      }
    }
  },
  '#top-padding': {
    on: 'change',
    action: (e) => {
      document.querySelector('.page-a .paper-content').style.paddingTop =
        e.target.value + 'px';
    }
  },
  '#font-file': {
    on: 'change',
    action: (e) => addFontFromFile(e.target.files[0])
  },
  '#ink-color': {
    on: 'change',
    action: (e) => {
      document.body.style.setProperty('--ink-color', e.target.value);
      setInkColor(e.target.value);
    }
  },
  '#paper-margin-toggle': {
    on: 'change',
    action: () => {
      if (pageEl.classList.contains('margined')) {
        pageEl.classList.remove('margined');
      } else {
        pageEl.classList.add('margined');
      }
    }
  },
  '#paper-line-toggle': {
    on: 'change',
    action: () => {
      if (pageEl.classList.contains('lines')) {
        pageEl.classList.remove('lines');
      } else {
        pageEl.classList.add('lines');
      }
    }
  },
  '#draw-diagram-button': {
    on: 'click',
    action: () => {
      toggleDrawCanvas();
    }
  },
  '.draw-container .close-button': {
    on: 'click',
    action: () => {
      toggleDrawCanvas();
    }
  },
  '#download-as-pdf-button': {
    on: 'click',
    action: () => {
      downloadAsPDF();
    }
  },
  '#delete-all-button': {
    on: 'click',
    action: () => {
      deleteAll();
    }
  },
  '.page-a .paper-content': {
    on: 'paste',
    action: formatText
  },
  '#paper-file': {
    on: 'change',
    action: (e) => addPaperFromFile(e.target.files[0])
  }
};

for (const eventSelector in EVENT_MAP) {
  const el = document.querySelector(eventSelector);

  if (el) {
    el.addEventListener(
      EVENT_MAP[eventSelector].on,
      EVENT_MAP[eventSelector].action
    );
  }
}

document.querySelectorAll('.switch-toggle input').forEach((toggleInput) => {
  toggleInput.addEventListener('change', (e) => {
    if (toggleInput.checked) {
      document.querySelector(
        `label[for="${toggleInput.id}"] .status`
      ).textContent = 'on';
      toggleInput.setAttribute('aria-checked', true);
    } else {
      toggleInput.setAttribute('aria-checked', false);
      document.querySelector(
        `label[for="${toggleInput.id}"] .status`
      ).textContent = 'off';
    }
  });
});

fetch(
  'https://api.github.com/repos/saurabhdaware/text-to-handwriting/contributors'
)
  .then((res) => res.json())
  .then((res) => {
    const contributorsContainer = document.querySelector(
      '#project-contributors'
    );
    if (contributorsContainer) {
      contributorsContainer.innerHTML = res
        .map(
          (contributor) => /* html */ `
          <div class="contributor-profile shadow">
            <a href="${contributor.html_url}">
              <img 
                alt="GitHub avatar of contributor ${contributor.login}" 
                class="contributor-avatar" 
                loading="lazy" 
                src="${contributor.avatar_url}" 
              />
              <div class="contributor-username">${contributor.login}</div>
            </a>
          </div>
        `
        )
        .join('');
    }
  });
