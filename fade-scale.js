class FadeScale extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return [
      'image-url', 'text', 'font-family', 'font-size', 'seo-tag',
      'background-color', 'animation-duration', 'animation-easing', 'font-color'
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
    const imageUrl = this.getAttribute('image-url') || 'https://static.wixstatic.com/media/8874a0_1bc1ba0e24c44fd8bfd899c1b4234d3b~mv2.webp';
    const text = this.getAttribute('text') || 'SHINE ON';
    const fontFamily = this.getAttribute('font-family') || 'Poppins';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 8;
    const seoTag = this.getAttribute('seo-tag') || 'h1';
    const backgroundColor = this.getAttribute('background-color') || '#1C2526';
    const animationDuration = parseFloat(this.getAttribute('animation-duration')) || 3;
    const animationEasing = this.getAttribute('animation-easing') || 'ease-out';
    const fontColor = this.getAttribute('font-color') || '#E6E6FA';

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');

        :host {
          display: block;
          position: relative;
          width: 100%;
          height: 100vh;
          margin: 0;
          padding: 0;
          background: ${backgroundColor};
          overflow: hidden;
        }

        .image {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: -1;
          transform: scale(1.8);
          animation: scaleImage ${animationDuration}s ${animationEasing} forwards;
        }

        .text {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          font-family: ${fontFamily}, Arial, sans-serif;
          font-size: calc(10px + ${fontSize}vw);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: 0.05em;
          white-space: nowrap;
          text-transform: uppercase;
          color: ${fontColor};
          background-color: ${backgroundColor};
          mix-blend-mode: multiply;
          opacity: 0;
          animation: fadeInText ${animationDuration}s 2s ${animationEasing} forwards;
          margin: 0;
        }

        @keyframes scaleImage {
          100% {
            transform: scale(1);
          }
        }

        @keyframes fadeInText {
          100% {
            opacity: 1;
          }
        }
      </style>
      <img src="${imageUrl}" alt="" class="image">
      <${seoTag} class="text">${text}</${seoTag}>
    `;
  }
}

customElements.define('fade-scale', FadeScale);
