class ButterflyText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isAnimating = false;
    this.hasAnimated = false;
    this.observer = null;
  }

  static get observedAttributes() {
    return ['text', 'font-size', 'font-color', 'background-color', 'text-alignment'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      console.log(`Attribute ${name} changed from ${oldValue} to ${newValue}`); // Debug
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
    // this.animate(); // Uncomment for testing without IntersectionObserver
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    this.disconnectObserver();
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
          console.log('IntersectionObserver triggered', entry.isIntersecting); // Debug
          if (entry.isIntersecting && !this.isAnimating && !this.hasAnimated) {
            this.isAnimating = true;
            this.animate();
          }
        });
      },
      { threshold: 0.5 } // Increased for testing
    );
    const container = this.shadowRoot.querySelector('.centered');
    if (container) {
      this.observer.observe(container);
    } else {
      console.error('Container (.centered) not found'); // Debug
    }
  }

  resetAnimation() {
    this.isAnimating = false;
    this.hasAnimated = false;
    const textElement = this.shadowRoot.querySelector('.text-animation');
    if (textElement) {
      textElement.style.opacity = '0';
      textElement.innerHTML = this.getAttribute('text').replace(/\S/g, '<span class="letter">$&</span>');
    }
    this.setupIntersectionObserver();
  }

  animate() {
    const textElement = this.shadowRoot.querySelector('.text-animation');
    if (textElement) {
      console.log('Starting animation'); // Debug
      anime.timeline({ loop: false }).add({
        targets: '.text-animation .letter',
        opacity: [0, 1],
        duration: 1000,
        color: ['#FF69B4', '#00FFFF', '#E6E6FA'],
        easing: 'easeInOutSine',
        delay: (elem, index) => index * 60,
      }).add({
        targets: '.text-animation',
        opacity: 0,
        duration: 2000,
        delay: 4000,
        easing: 'easeOutExpo',
        complete: () => {
          this.hasAnimated = true;
          this.disconnectObserver();
          console.log('Animation completed'); // Debug
        },
      });
    } else {
      console.error('Text element (.text-animation) not found'); // Debug
    }
  }

  render() {
    const text = this.getAttribute('text') || 'Happiness is a butterfly, which when pursued, is always just beyond your grasp, but which, if you will sit down quietly, may alight upon you.\n\nNathaniel Hawthorne';
    const fontSize = parseInt(this.getAttribute('font-size')) || 28;
    const fontColor = this.getAttribute('font-color') || '#E6E6FA';
    const backgroundColor = this.getAttribute('background-color') || '#0A0A23';
    const textAlignment = this.getAttribute('text-alignment') || 'center';

    console.log('Rendering with:', { text, fontSize, fontColor, backgroundColor, textAlignment }); // Debug

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
          justify-content: ${textAlignment};
          background: ${backgroundColor}; /* Solid color for testing */
          margin: 0;
          padding: 0 20px;
          box-sizing: border-box;
        }
        .text-animation {
          white-space: pre;
          color: ${fontColor};
          font-size: ${fontSize}px;
          font-family: 'Telma', cursive, sans-serif;
          letter-spacing: 1px;
          text-align: ${textAlignment};
          /* opacity: 0; */ /* Comment out for testing */
        }
        .text-animation .letter {
          font-family: 'Telma', cursive, sans-serif;
          display: inline-block;
          color: ${fontColor};
          text-shadow: -1px 3px 4px #0A0A23;
        }
      </style>
      <div class="centered">
        <div class="text-animation">${text.replace(/\S/g, '<span class="letter">$&</span>')}</div>
      </div>
    `;
  }
}

customElements.define('butterfly-text', ButterflyText);
