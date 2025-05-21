class QuoteAnimation extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isAnimating = false;
  }

  static get observedAttributes() {
    return ['quote', 'author', 'seo-tag', 'text-color', 'background-color', 'font-family', 'font-size'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.handleResize = () => this.render();
    window.addEventListener('resize', this.handleResize);
    this.setupIntersectionObserver();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.isAnimating) {
          console.log('Element entered viewport, starting animation');
          this.isAnimating = true;
          this.startAnimation();
          observer.unobserve(this);
        }
      });
    }, { threshold: 0.1 });
    this.observer.observe(this);
  }

  startAnimation() {
    const letters = this.shadowRoot.querySelectorAll('.letter');
    letters.forEach((letter, index) => {
      letter.animate(
        [
          { opacity: 0, color: '#FF69B4' }, // Pink
          { opacity: 0.5, color: '#00FFFF' }, // Cyan
          { opacity: 1, color: this.getAttribute('text-color') || '#E6E6FA' } // Final color
        ],
        {
          duration: 1000,
          easing: 'ease-in-out',
          delay: index * 60,
          fill: 'forwards'
        }
      );
    });
  }

  render() {
    const quote = this.getAttribute('quote') || 'Happiness is not something ready-made. It comes from your own actions.';
    const author = this.getAttribute('author') || '– Dalai Lama';
    const seoTag = this.getAttribute('seo-tag') || 'p';
    const textColor = this.getAttribute('text-color') || '#E6E6FA';
    const backgroundColor = this.getAttribute('background-color') || '#1C2526';
    const fontFamily = this.getAttribute('font-family') || 'Lora';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 1.7;

    this.isAnimating = false;

    // Split quote into letters, preserving whitespace and newlines
    const quoteLetters = quote
      .split('')
      .map(char => (/\S/.test(char) ? `<span class="letter">${char}</span>` : char === '\n' ? '<br>' : char))
      .join('');

    // Split author into letters
    const authorLetters = author
      .split('')
      .map(char => (/\S/.test(char) ? `<span class="letter">${char}</span>` : char))
      .join('');

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Lora&display=swap');

        :host {
          display: block;
          width: 100%;
          height: 100vh;
          margin: 0;
          padding: 0;
          position: relative;
          background: ${backgroundColor};
          overflow: hidden;
        }

        .centered {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          max-width: 800px;
          padding: 20px;
          box-sizing: border-box;
        }

        .text-animation {
          white-space: pre-line;
          word-break: keep-all;
          color: ${textColor};
          font-size: ${fontSize}rem;
          font-family: ${fontFamily}, cursive;
          letter-spacing: 1px;
          text-align: center;
          line-height: 1.5;
        }

        .author {
          color: ${textColor};
          font-size: ${fontSize * 0.9}rem; /* Slightly smaller for author */
          font-family: ${fontFamily}, cursive;
          text-align: center;
          margin-top: 1rem;
        }

        .letter {
          display: inline-block;
          opacity: 0;
          font-family: ${fontFamily}, cursive;
          color: ${textColor};
          text-shadow: -1px 3px 4px rgba(0, 0, 0, 0.5);
        }
      </style>
      <div class="centered">
        <${seoTag} class="text-animation">${quoteLetters}</${seoTag}>
        <div class="author">${authorLetters}</div>
      </div>
    `;
  }
}

customElements.define('quote-animation', QuoteAnimation);
