class QuoteAnimation extends HTMLElement {
  static get observedAttributes() {
    return ['quote-text', 'author', 'text-color', 'animation-speed'];
  }
  
  constructor() {
    super();
    
    // Default properties with new romantic theme
    this.props = {
      quoteText: `« L’amour est une étoile dans la nuit, guidant nos âmes vers l’éternité. »`,
      author: 'Victor Hugo',
      textColor: '#FFE4E1', // Misty rose for romantic feel
      animationSpeed: 100 // Delay between letters in ms
    };
    
    // Create a shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Create an intersection observer to detect when element enters viewport
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
      root: null, // Use the viewport
      threshold: 0.2 // Fire when 20% of the element is visible
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
        this.props.animationSpeed = parseInt(newValue, 10) || 100;
        break;
    }
    
    this.updateContent();
    
    // Restart animation if it was already started
    if (this.animationStarted) {
      this.animationStarted = false; // Reset to allow re-animation
      this.observer.observe(this); // Re-observe for viewport entry
      this.startAnimation();
    }
  }
  
  updateContent() {
    const shadowRoot = this.shadowRoot;
    const textElem = shadowRoot.querySelector('.text-animation');
    const styleElem = shadowRoot.querySelector('style');
    
    if (textElem) {
      textElem.textContent = `${this.props.quoteText}\n${this.props.author}`;
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
          this.observer.disconnect(); // Disconnect to ensure animation runs only once
        } else {
          // Wait for anime.js to load
          const checkAnime = setInterval(() => {
            if (typeof anime !== 'undefined') {
              clearInterval(checkAnime);
              this.startAnimation();
              this.observer.disconnect();
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
      translateY: [60, 0], // Slightly increased slide-up for drama
      duration: 1500, // Longer duration for smoother effect
      color: ['#FFB6C1', '#FFF0F5', this.props.textColor], // Light pink to lavender blush transition
      easing: 'easeOutQuad',
      delay: (elem, index) => index * this.props.animationSpeed
    });
  }
  
  render() {
    const shadowRoot = this.shadowRoot;
    
    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Parisienne&display=swap');
      
      :host {
        display: flex;
        width: 100%;
        height: 100%; /* Inherit parent height */
        margin: 0;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        overflow: hidden;
        background: linear-gradient(135deg, #FFF0F5 0%, #FFB6C1 100%); /* Lavender blush to light pink */
      }
      
      .centered {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        min-height: 100%;
        padding: calc(12px + 2vw);
        box-sizing: border-box;
        text-align: center;
      }
      
      .text-animation {
        white-space: pre-wrap;
        color: ${this.props.textColor};
        font-family: 'Parisienne', cursive; /* Elegant cursive font */
        letter-spacing: 3px; /* Wider for sophistication */
        font-size: calc(1.6rem + 1.6vw);
        max-width: 85%; /* Prevent overflow */
        line-height: 1.5; /* Enhanced readability */
        text-shadow: 0 3px 5px rgba(0, 0, 0, 0.25); /* Deeper shadow for elegance */
      }
      
      .text-animation .letter {
        font-family: 'Parisienne', cursive;
        display: inline-block;
        color: ${this.props.textColor};
      }
      
      @media (max-width: 768px) {
        .text-animation {
          font-size: calc(1.3rem + 1.3vw);
          padding: calc(10px + 1.5vw);
        }
      }
      
      @media (max-width: 480px) {
        .text-animation {
          font-size: calc(1.1rem + 1vw);
          padding: calc(8px + 1vw);
        }
      }
    `;
    
    // Create HTML structure
    const container = document.createElement('div');
    container.className = 'centered';
    
    const textAnimation = document.createElement('div');
    textAnimation.className = 'text-animation';
    textAnimation.textContent = `${this.props.quoteText}\n${this.props.author}`;
    
    container.appendChild(textAnimation);
    
    // Add elements to shadow DOM
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(container);
  }
}

// Register the custom element
customElements.define('quote-animation', QuoteAnimation);
