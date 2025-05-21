class SkewText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return [
      'text', 'font-family', 'font-size', 'char-distance', 'animation-direction',
      'seo-tag', 'text-alignment', 'background-color', 'font-color', 'behind-font-color'
    ];
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
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const text = this.getAttribute('text') || 'INSPIRE';
    const fontFamily = this.getAttribute('font-family') || 'Montserrat';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 3;
    const charDistance = parseFloat(this.getAttribute('char-distance')) || 3;
    const animationDirection = this.getAttribute('animation-direction') || 'left';
    const seoTag = this.getAttribute('seo-tag') || 'p';
    const textAlignment = this.getAttribute('text-alignment') || 'center';
    const backgroundColor = this.getAttribute('background-color') || '#2E2E2E';
    const fontColor = this.getAttribute('font-color') || '#F5F5F5';
    const behindFontColor = this.getAttribute('behind-font-color') || '#6B7280';

    // Animation settings
    const shadowScale = 1.1;
    const initialSkew = -40; // Degrees
    const hoverSkew = -10; // Degrees
    const shadowInitialSkew = (initialSkew / 2) * -1;
    const shadowHoverSkew = (hoverSkew / 2) * -1;
    const animationDuration = 0.3; // Seconds

    // Scale charDistance (1 to 10) to em (0.1 to 1)
    const scaledCharDistance = charDistance / 10;

    // Determine rotation axis based on direction
    const isHorizontal = ['left', 'right'].includes(animationDirection);
    const rotationAxis = isHorizontal ? 'Y' : 'X';
    const skewSign = animationDirection === 'left' || animationDirection === 'top' ? 1 : -1;

    // Split text into letters
    const letters = text
      .split('')
      .map(char => `<span data-text="${char}">${char}</span>`)
      .join('');

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap');

        :host {
          display: block;
          width: 100%;
          height: 100vh;
          margin: 0;
          padding: 0;
          background: ${backgroundColor};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        ${seoTag} {
          color: ${fontColor};
          font-family: ${fontFamily}, sans-serif;
          font-size: ${fontSize}em;
          font-weight: 700;
          text-align: ${textAlignment};
          margin: 0;
          padding: 20px;
        }

        ${seoTag} span {
          display: inline-block;
          position: relative;
          transform-style: preserve-3d;
          perspective: 500px;
          -webkit-font-smoothing: antialiased;
        }

        ${seoTag} span::before,
        ${seoTag} span::after {
          display: none;
          position: absolute;
          top: 0;
          left: -1px;
          transform-origin: ${animationDirection === 'right' ? 'right' : 'left'} top;
          transition: all ease-out ${animationDuration}s;
          content: attr(data-text);
        }

        ${seoTag} span::before {
          z-index: 1;
          color: rgba(0, 0, 0, 0.2);
          transform: scale(${shadowScale}, 1) skew(0deg, ${shadowInitialSkew}deg);
        }

        ${seoTag} span::after {
          z-index: 2;
          color: ${behindFontColor};
          text-shadow: -1px 0 1px ${behindFontColor}, 1px 0 1px rgba(0, 0, 0, 0.8);
          transform: rotate${rotationAxis}(${initialSkew * skewSign}deg);
        }

        ${seoTag} span:hover::before {
          transform: scale(${shadowScale}, 1) skew(0deg, ${shadowHoverSkew}deg);
        }

        ${seoTag} span:hover::after {
          transform: rotate${rotationAxis}(${hoverSkew * skewSign}deg);
        }

        ${seoTag} span + span {
          margin-left: ${scaledCharDistance}em;
        }

        @media (min-width: 20em) {
          ${seoTag} {
            font-size: ${fontSize * 0.5}em;
          }
          ${seoTag} span::before,
          ${seoTag} span::after {
            display: block;
          }
        }
        @media (min-width: 30em) {
          ${seoTag} {
            font-size: ${fontSize * 0.75}em;
          }
        }
        @media (min-width: 40em) {
          ${seoTag} {
            font-size: ${fontSize}em;
          }
        }
        @media (min-width: 60em) {
          ${seoTag} {
            font-size: ${fontSize * 1.5}em;
          }
        }
      </style>
      <${seoTag} aria-label="${text}">${letters}</${seoTag}>
    `;
  }
}

customElements.define('skew-text', SkewText);
