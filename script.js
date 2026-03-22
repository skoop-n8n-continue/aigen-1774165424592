/**
 * Product Data
 * Hardcoded as per instructions. All products are 50% off.
 */
const products = [
  {
    brand: "Savvy",
    name: "Savvy Blue Magic Guap Gummy 25mg 1-Pack",
    image_url: "https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Fundefined-1773196700024.png",
    price: "7",
    discounted_price: "3.50",
    strain: "Indica",
    category: "Gummies"
  },
  {
    brand: "Lost Farm",
    name: "Lost Farm Juicy Peach x GSC Sherbet Live Resin Gummies 10mg x 10-Pack",
    image_url: "https://skoop-general.s3.us-east-1.amazonaws.com/n8n_image_gen%2Fundefined-1773196879298.png",
    price: "30",
    discounted_price: "15.00",
    strain: "Hybrid",
    category: "Gummies"
  },
  {
    brand: "URBNJ",
    name: "Orange Malt Flower 7g",
    image_url: "https://leaflogixmedia.blob.core.windows.net/product-image/ce1aabe2-d086-4462-91ad-8f70ef4c5913.jpg",
    price: "65",
    discounted_price: "32.50",
    strain: "Hybrid",
    category: "Whole Flower"
  }
];

/**
 * Dust Motes Particle System
 */
function initDustCanvas() {
  const canvas = document.getElementById('dust-canvas');
  const ctx = canvas.getContext('2d');

  // Resize canvas to window size
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  const particles = [];
  const particleCount = 60;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: Math.random() * -0.3 - 0.1, // Moving upwards slowly
      opacity: Math.random() * 0.4 + 0.1 // Semi-transparent
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      // Move particles
      p.x += p.vx;
      p.y += p.vy;

      // Add tiny bit of jitter for realism
      p.x += (Math.random() - 0.5) * 0.5;

      // Wrap around screen
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

/**
 * Utility: Wait for N milliseconds
 */
const delay = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * Create a DOM element from HTML string
 */
function createCardElement(product) {
  // Random stamp rotation between -20deg and -5deg for a natural human-stamped look
  const stampRot = (Math.random() - 0.5) * 15 - 12;

  const html = `
    <div class="card">
      <div class="card-border"></div>
      <div class="stamp" style="--stamp-rot: ${stampRot}deg">50% OFF</div>
      <div class="card-content">
        <div class="brand">${product.brand}</div>
        <div class="image-container">
          <img class="product-image" src="${product.image_url}" alt="${product.name}">
        </div>
        <h2 class="title">${product.name}</h2>
        <div class="strain">${product.category} &bull; ${product.strain}</div>

        <div class="price-section">
          <p class="original-price">$${product.price}</p>
          <div class="new-price-container">
            <span class="new-price">$${product.discounted_price}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

/**
 * Core Animation Sequencer (GSAP)
 */
async function runAnimationLoop() {
  const container = document.getElementById('card-container');
  let currentIndex = 0;

  // Infinite loop for digital signage
  while (true) {
    // Get 3 products to display at once
    const currentProducts = [];
    for(let i=0; i<3; i++) {
        currentProducts.push(products[(currentIndex + i) % products.length]);
    }

    container.innerHTML = ''; // Clear previous cards
    const cardEls = [];

    // Create and stage the 3 cards
    currentProducts.forEach((product) => {
      const cardEl = createCardElement(product);
      container.appendChild(cardEl);
      cardEls.push(cardEl);

      // Target variations for organic feel
      const rot = (Math.random() - 0.5) * 10;
      const yOffset = (Math.random() - 0.5) * 4;
      const xOffset = (Math.random() - 0.5) * 2;

      cardEl.dataset.targetRot = rot;
      cardEl.dataset.targetY = yOffset;
      cardEl.dataset.targetX = xOffset;
    });

    // Brief yield for DOM flush
    await delay(50);

    // Orchestrate with a unified GSAP Timeline
    await new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });

      // 1. Initial State Definitions
      cardEls.forEach((cardEl) => {
        tl.set(cardEl, {
          y: "150vh",
          x: `${cardEl.dataset.targetX}vw`,
          rotationZ: parseFloat(cardEl.dataset.targetRot) + 40,
          rotationX: 70,
          rotationY: 20,
          scale: 1.3,
          opacity: 0,
          boxShadow: "0 100px 100px rgba(0,0,0,0.15)"
        }, 0);

        const stampEl = cardEl.querySelector('.stamp');
        tl.set(stampEl, {
          scale: 5,
          opacity: 0
        }, 0);
      });

      // 2. Deal phase
      cardEls.forEach((cardEl, i) => {
        const targetX = `${parseFloat(cardEl.dataset.targetX)}vw`;
        const targetY = `${parseFloat(cardEl.dataset.targetY)}vh`;
        const targetRot = parseFloat(cardEl.dataset.targetRot);
        const dealTime = i * 0.15;

        tl.to(cardEl, {
          duration: 1,
          y: targetY,
          rotationZ: targetRot,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          opacity: 1,
          boxShadow: "0 15px 35px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.4) inset, -1px -1px 2px rgba(255,255,255,0.5) inset",
          ease: "power2.out"
        }, dealTime);
      });

      // Pause briefly so user can digest original pricing/products
      const timeAfterDeal = 1 + (cardEls.length - 1) * 0.15 + 2.5;

      // 3. Stamp & Reveal phase
      cardEls.forEach((cardEl, i) => {
        const stampEl = cardEl.querySelector('.stamp');
        const origPriceEl = cardEl.querySelector('.original-price');
        const newPriceContainer = cardEl.querySelector('.new-price-container');

        const targetXStr = `${parseFloat(cardEl.dataset.targetX)}vw`;
        const targetYStr = `${parseFloat(cardEl.dataset.targetY)}vh`;
        const targetRot = parseFloat(cardEl.dataset.targetRot);

        const stampStartTime = timeAfterDeal + i * 0.15;
        const impactTime = stampStartTime + 0.25;

        // Stamp hits
        tl.to(stampEl, {
          duration: 0.3,
          scale: 1,
          opacity: 0.95,
          ease: "back.inOut(1.5)"
        }, stampStartTime);

        // Card flinches exactly upon impact
        tl.to(cardEl, {
          duration: 0.05,
          x: `calc(${targetXStr} - 2px)`,
          y: `calc(${targetYStr} - 3px)`,
          rotationZ: targetRot - 1,
          ease: "none"
        }, impactTime)
        .to(cardEl, {
          duration: 0.05,
          x: `calc(${targetXStr} + 2px)`,
          y: `calc(${targetYStr} + 3px)`,
          rotationZ: targetRot + 1,
          ease: "none"
        }, impactTime + 0.05)
        .to(cardEl, {
          duration: 0.05,
          x: targetXStr,
          y: targetYStr,
          rotationZ: targetRot,
          ease: "none"
        }, impactTime + 0.1);

        // Prices dynamically strike/reveal upon impact
        tl.call(() => {
          origPriceEl.classList.add('struck');
          newPriceContainer.classList.add('show');
        }, null, impactTime);
      });

      // 4. Hold & Fly Out Phase
      const timeAfterStamps = timeAfterDeal + (cardEls.length - 1) * 0.15 + 0.3 + 4.5;

      cardEls.forEach((cardEl, i) => {
        const targetRot = parseFloat(cardEl.dataset.targetRot);
        const flyOutTime = timeAfterStamps + i * 0.12;

        tl.to(cardEl, {
          duration: 0.8,
          y: "-120vh",
          rotationZ: targetRot - 20,
          rotationX: 40,
          scale: 0.8,
          opacity: 0,
          ease: "power2.in"
        }, flyOutTime);
      });

      // Extra pad before resolving the Promise to move to next chunk
      tl.to({}, { duration: 1.2 });
    });

    // Advance to next products
    currentIndex = (currentIndex + 3) % products.length;
  }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  initDustCanvas();
  runAnimationLoop();
});