// quote-animation.js - Custom element for animated romantic quote

class QuoteAnimation extends HTMLElement {
  static get observedAttributes() {
    return ['quote-text', 'author', 'text-color', 'animation-speed'];
  }
  
  constructor() {
    super();
    
    // Default properties with romantic theme
    this.props = {
      quoteText: `« Je t’aime non seulement pour ce que tu es, 
mais pour ce que je suis quand je suis avec toi. »`,
      author: 'Elizabeth Barrett Browning',
      textColor: '#FFF5F5', // Soft romantic pink
      animationSpeed: 80 // Delay between letters in ms
    };
    
    // Create a shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Create an intersection observer to detect when element enters viewport
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
      root: null, // Use the viewport
      threshold: 0.1 // Fire when 10% of the element is visible
    });
    
    // Flag to track if animation has been started
    this.animationStarted = false;
  }
  
  connectedCallback() {
    this.render();
    this.observer.observe(this);
    
    // Load anime.js if not already loaded
    if (typeof anime === 'undefined') {
      this.loadAnimeJS();
    }
  }
  
  disconnectedCallback() {
    this.observer.unobserve(this);
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'quote-text':
        this.props.quoteText = newValue;
        break;
      case 'author':
        this.props.author = newValue;
        break;
      case 'text-color':
        this.props.textColor = newValue;
        break;
      case 'animation-speed':
        this.props.animationSpeed = parseInt(newValue, 10) || 80;
        break;
    }
    
    this.updateContent();
    
    // Restart animation if it was already started
    if (this.animationStarted) {
      this.startAnimation();
    }
  }
  
  updateContent() {
    const shadowRoot = this.shadowRoot;
    const textElem = shadowRoot.querySelector('.text-animation');
    const styleElem = shadowRoot.querySelector('style');
    
    if (textElem) {
      textElem.textContent = `${this.props.quoteText}
${this.props.author}`;
    }
    
    if (styleElem) {
      // Update the text color in the styles
      const updatedStyle = styleElem.textContent.replace(
        /color:\s*#[a-fA-F0-9]{3,6};/g, 
        `color: ${this.props.textColor};`
      );
      styleElem.textContent = updatedStyle;
    }
  }
  
  loadAnimeJS() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
    script.onload = () => {
      if (this.animationStarted) {
        this.startAnimation();
      }
    };
    document.head.appendChild(script);
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.animationStarted) {
        // Check if anime.js is loaded before starting animation
        if (typeof anime !== 'undefined') {
          this.startAnimation();
          this.observer.disconnect(); // Disconnect observer to ensure animation runs only once
        } else {
          // If anime.js isn't loaded yet, wait for it
          const checkAnime = setInterval(() => {
            if (typeof anime !== 'undefined') {
              clearInterval(checkAnime);
              this.startAnimation();
              this.observer.disconnect(); // Disconnect after animation starts
            }
          }, 100);
        }
        this.animationStarted = true;
      }
    });
  }
  
  startAnimation() {
    const shadowRoot = this.shadowRoot;
    const element = shadowRoot.querySelector(".text-animation");
    
    if (!element) return;
    
    element.innerHTML = element.textContent.replace(/\S/g, '<span class="letter">$&</span>');
    this.runAnimation();
  }
  
  runAnimation() {
    const shadowRoot = this.shadowRoot;
    
    anime.timeline({
      loop: false // Animation runs only once
    }).add({
      targets: Array.from(shadowRoot.querySelectorAll('.letter')),
      opacity: [0, 1],
      translateY: [50, 0], // Slide up effect for romantic feel
      duration: 1200,
      color: ['#FECACA', '#FCE7F3', this.props.textColor], // Romantic color transition: blush pink to soft rose
      easing: 'easeOutCubic',
      delay: (elem, index) => index * this.props.animationSpeed
    });
  }
  
  render() {
    const shadowRoot = this.shadowRoot;
    
    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
      
      :host {
        display: flex;
        width: 100%;
        height: 100vh; /* Full viewport height as fallback */
        min-height: 100%; /* Inherit parent height if available */
        margin: 0;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        overflow: hidden;
        background: linear-gradient(135deg, #FFF1F2 0%, #FECACA 100%); /* Romantic gradient background */
      }
      
      .centered {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        min-height: 100%;
        padding: calc(10px + 2vw);
        box-sizing: border-box;
        text-align: center;
      }
      
      .text-animation {
        white-space: pre-wrap;
        color: ${this.props.textColor};
        font-family: 'Great Vibes', cursive; /* Beautiful cursive font */
        letter-spacing: 2px; /* Slightly wider for elegance */
        font-size: calc(1.5rem + 1.5vw);
        max-width: 90%; /* Prevent overflow */
        line-height: 1.4; /* Improved readability */
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
      }
      
      .text-animation .letter {
        font-family: 'Great Vibes', cursive;
        display: inline-block;
        color: ${this.props.textColor};
      }
      
      @media (max-width: 768px) {
        .text-animation {
          font-size: calc(1.2rem + 1.2vw);
          padding: calc(8px + 1.5vw);
        }
      }
      
      @media (max-width: 480px) {
        .text-animation {
          font-size: calc(1rem + 1vw);
          padding: calc(6px + 1vw);
        }
      }
    `;
    
    // Create HTML structure
    const container = document.createElement('div');
    container.className = 'centered';
    
    const textAnimation = document.createElement('div');
    textAnimation.className = 'text-animation';
    textAnimation.textContent = `${this.props.quoteText}
${this.props.author}`;
    
    container.appendChild(textAnimation);
    
    // Add elements to shadow DOM
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(container);
  }
}

// Register the custom element
customElements.define('quote-animation', QuoteAnimation);
