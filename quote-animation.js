class QuoteAnimation extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isAnimating = false;
    this.hasAnimated = false;
    this.observer = null;
    this.animationTimeout = null;
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
    // Delay observer setup to ensure DOM is ready
    setTimeout(() => this.setupIntersectionObserver(), 100);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    this.disconnectObserver();
    if (this.animationTimeout) clearTimeout(this.animationTimeout);
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
      { threshold: 0.2, rootMargin: '0px' }
    );
    const container = this.shadowRoot.querySelector('.centered');
    if (container) {
      this.observer.observe(container);
    } else {
      // Retry if container isn't ready
      setTimeout(() => this.setupIntersectionObserver(), 100);
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
            opacity: [1, 0],
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
    } else {
      // Retry animation if Anime.js isn't loaded
      setTimeout(() => this.animate(), 100);
    }
  }

  render() {
    const text = this.getAttribute('text') || '« Le bonheur est un papillon qui, lorsqu’il est poursuivi, est toujours juste au-dessus de votre portée, mais qui, si vous vous asseyez tranquillement, peut se poser sur vous » Nathaniel Hawthorne';
    const fontFamily = this.getAttribute('font-family') || 'Telma';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 2.5; // Use vmin for responsiveness
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
          width: 90%; /* Responsive width */
          max-width: 1200px; /* Prevent overly wide text */
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${backgroundColor};
          box-sizing: border-box;
        }
        .text-animation {
          white-space: pre-wrap; /* Preserve line breaks, allow wrapping */
          color: ${fontColor};
          font-size: ${fontSize}vmin; /* Responsive font size */
          font-family: '${fontFamily}', cursive;
          letter-spacing: 1px;
          text-align: ${textAlignment};
          user-select: none;
          padding: 20px; /* Add padding for small screens */
        }
        .text-animation .letter {
          display: inline-block;
          color: ${fontColor};
          text-shadow: -1px 3px 4px #1d1e22;
        }
        @media (max-width: 768px) {
          .text-animation {
            font-size: ${fontSize * 0.7}vmin; /* Smaller font on mobile */
            padding: 10px;
          }
        }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js" defer></script>
      <div class="centered">
        <${headingTag} class="text-animation">${text.replace(/\S/g, '<span class="letter">$&</span>')}</${headingTag}>
      </div>
    `;
  }
}

customElements.define('quote-animation', QuoteAnimation);
