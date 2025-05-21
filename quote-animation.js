// quote-animation.js - Custom element for animated quote

class QuoteAnimation extends HTMLElement {
  static get observedAttributes() {
    return ['quote-text', 'author', 'text-color', 'animation-speed'];
  }
  
  constructor() {
    super();
    
    // Default properties
    this.props = {
      quoteText: `« Le bonheur est un papillon qui, lorsqu'il est poursuivi,
est toujours juste au-dessus de votre portée, mais qui, 
si vous vous asseyez tranquillement, peut se poser sur vous »`,
      author: 'Nathaniel Hawthorne',
      textColor: '#f5f5f5',
      animationSpeed: 60 // Delay between letters in ms
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
    
    // Handle window resize for responsiveness
    this.resizeHandler = this.handleResize.bind(this);
  }
  
  connectedCallback() {
    this.render();
    this.observer.observe(this);
    window.addEventListener('resize', this.resizeHandler);
    
    // Load anime.js if not already loaded
    if (typeof anime === 'undefined') {
      this.loadAnimeJS();
    }
  }
  
  disconnectedCallback() {
    this.observer.unobserve(this);
    window.removeEventListener('resize', this.resizeHandler);
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
        this.props.animationSpeed = parseInt(newValue, 10) || 60;
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
  
  handleResize() {
    // Additional resize handling if needed
    // The CSS is already responsive with calc() and media queries
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
        } else {
          // If anime.js isn't loaded yet, wait for it
          const checkAnime = setInterval(() => {
            if (typeof anime !== 'undefined') {
              clearInterval(checkAnime);
              this.startAnimation();
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
      loop: true
    }).add({
      targets: Array.from(shadowRoot.querySelectorAll('.letter')),
      opacity: [0, 1],
      duration: 1000,
      color: ['pink', 'cyan', this.props.textColor],
      easing: 'easeInOutSine',
      delay: (elem, index) => index * this.props.animationSpeed
    }).add({
      targets: shadowRoot.querySelector('.text-animation'),
      opacity: 0,
      direction: 'alternate',
      duration: 2000,
      delay: 4000,
      easing: "easeOutExpo"
    });
  }
  
  render() {
    const shadowRoot = this.shadowRoot;
    
    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://api.fontshare.com/v2/css?f[]=telma@400&display=swap');
      
      :host {
        display: block;
        width: 100%;
      }
      
      .centered {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
      }
      
      .text-animation {
        white-space: pre-wrap;
        color: ${this.props.textColor};
        font-family: 'Telma', cursive;
        letter-spacing: 1px;
        text-align: center;
        font-size: calc(1rem + 1vw);
        max-width: 100%;
      }
      
      .text-animation .letter {
        font-family: 'Telma', cursive;
        display: inline-block;
        color: ${this.props.textColor};
        text-shadow: -1px 3px 4px #1d1e22;
      }
      
      @media (max-width: 768px) {
        .text-animation {
          font-size: calc(0.8rem + 1vw);
        }
      }
      
      @media (max-width: 480px) {
        .text-animation {
          font-size: calc(0.6rem + 1vw);
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
