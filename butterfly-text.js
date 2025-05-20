/**
 * Gradient Text Animation Custom Element for Wix
 * 
 * This custom element creates an animated text effect with gradual letter appearance
 * and color transitions.
 */

class GradientTextAnimation extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Default quote and author - can be customized in Wix Editor through properties
    const defaultQuote = "Happiness is not a destination, it is a way of life. The joy we seek is found not in the journey's end, but in the steps we take along the way.";
    const defaultAuthor = "Marcus Aurelius";
    
    // Get properties or use defaults
    const quote = this.getAttribute('quote') || defaultQuote;
    const author = this.getAttribute('author') || defaultAuthor;
    
    // Creating the combined text (quote + author)
    const fullText = `${quote}\n${author}`;
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&display=swap');
        
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        
        .container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          user-select: none;
        }
        
        .centered {
          position: relative;
          max-width: 80%;
        }
        
        .text-animation {
          white-space: pre;
          color: #f8f8ff;
          font-size: 1.7rem;
          font-family: 'Cormorant Garamond', serif;
          letter-spacing: 1px;
          text-align: center;
        }
        
        .text-animation .letter {
          font-family: 'Cormorant Garamond', serif;
          display: inline-block;
          color: #f8f8ff;
          text-shadow: -1px 3px 4px #1e3a5f;
        }
      </style>
      
      <div class="container">
        <div class="centered">
          <div class="text-animation">${fullText}</div>
        </div>
      </div>
    `;
    
    // Processing each letter for animation
    const element = this.shadowRoot.querySelector(".text-animation");
    element.innerHTML = element.textContent.replace(/\S/g, '<span class="letter">$&</span>');
    
    // Load anime.js library if not already loaded
    this._loadAnimeJS().then(() => {
      this._animateText();
    });
  }
  
  _loadAnimeJS() {
    return new Promise((resolve) => {
      if (window.anime) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }
  
  _animateText() {
    const timeline = window.anime.timeline({
      loop: true
    });
    
    // First animation: Letters appear with color change
    timeline.add({
      targets: this.shadowRoot.querySelectorAll('.text-animation .letter'),
      opacity: [0, 1],
      duration: 1000,
      color: ['#6a0dad', '#4682b4', '#f8f8ff'], // Purple, Steel Blue, White
      easing: 'easeInOutSine',
      delay: (elem, index) => index * 60
    });
    
    // Second animation: Text fades out
    timeline.add({
      targets: this.shadowRoot.querySelector('.text-animation'),
      opacity: 0,
      direction: 'alternate',
      duration: 2000,
      delay: 4000,
      easing: "easeOutExpo"
    });
  }
  
  // Define properties for the Wix Editor
  static get observedAttributes() {
    return ['quote', 'author'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.shadowRoot && (name === 'quote' || name === 'author')) {
      // Re-render when properties change
      this.connectedCallback();
    }
  }
}

// Register the custom element
customElements.define('gradient-text-animation', GradientTextAnimation);
