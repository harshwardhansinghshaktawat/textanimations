class QuoteAnimation extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isAnimating = false;
    this.hasAnimated = false;
    this.observer = null;
  }

  static get observedAttributes() {
    return [
      'text', 'font-family', 'font-size', 'font-color', 
      'heading-tag', 'background-color', 'text-alignment'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      if (this.hasAnimated) {
        this.resetAnimation();
      }
    }
  }

  connectedCallback() {
    this.render();
    this.handleResize = () => this.render();
    window.addEventListener('resize', this.handleResize);
    setTimeout(() => this.setupIntersectionObserver(), 0);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    this.disconnectObserver();
    clearTimeout(this.animationTimeout);
  }

  disconnectObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  setupIntersectionObserver() {
    this.disconnectObserver();
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isAnimating && !this.hasAnimated) {
            this.isAnimating = true;
            this.animate();
          }
        });
      },
      { threshold: 0.2 }
    );
    const container = this.shadowRoot.querySelector('.centered');
    if (container) {
      this.observer.observe(container);
    }
  }

  resetAnimation() {
    this.isAnimating = false;
    this.hasAnimated = false;
    const textElement = this.shadowRoot.querySelector('.text-animation');
    if (textElement) {
      textElement.style.opacity = '1';
      textElement.innerHTML = this.getAttribute('text').replace(/\S/g, '<span class="letter">$&</span>');
    }
    this.setupIntersectionObserver();
  }

  animate() {
    const textElement = this.shadowRoot.querySelector('.text-animation');
    if (textElement && window.anime) {
      this.animationTimeout = setTimeout(() => {
        anime.timeline({ loop: false })
          .add({
            targets: this.shadowRoot.querySelectorAll('.text-animation .letter'),
            opacity: [0, 1],
            duration: 1000,
            color: ['pink', 'cyan', '#f5f5f5'],
            easing: 'easeInOutSine',
            delay: (elem, index) => index * 60
          })
          .add({
            targets: textElement,
            opacity: 0,
            direction: 'alternate',
            duration: 2000,
            delay: 4000,
            easing: 'easeOutExpo',
            complete: () => {
              this.hasAnimated = true;
              this.disconnectObserver();
            }
          });
      }, 100);
    }
  }

  render() {
    const text = this.getAttribute('text') || '« Le bonheur est un papillon... » Nathaniel Hawthorne';
    const fontFamily = this.getAttribute('font-family') || 'Telma';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 1.7;
    const fontColor = this.getAttribute('font-color') || '#f5f5f5';
    const headingTag = this.getAttribute('heading-tag') || 'div';
    const backgroundColor = this.getAttribute('background-color') || '#000';
    const textAlignment = this.getAttribute('text-alignment') || 'center';

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://api.fontshare.com/v2/css?f[]=telma@400&display=swap');
        :host {
          display: block;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          position: absolute;
          top: 0;
          left: 0;
          overflow: hidden;
        }
        .centered {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${backgroundColor};
        }
        .text-animation {
          white-space: pre;
          color: ${fontColor};
          font-size: ${fontSize}rem;
          font-family: '${fontFamily}', cursive;
          letter-spacing: 1px;
          text-align: ${textAlignment};
          user-select: none;
        }
        .text-animation .letter {
          display: inline-block;
          color: ${fontColor};
          text-shadow: -1px 3px 4px #1d1e22;
        }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
      <div class="centered">
        <${headingTag} class="text-animation">${text.replace(/\S/g, '<span class="letter">$&</span>')}</${headingTag}>
      </div>
    `;
  }
}

customElements.define('quote-animation', QuoteAnimation);
