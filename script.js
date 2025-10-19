/* ======= DATA ẢNH ======= */
const photos = [
  "https://i.postimg.cc/3xPZzwR1/1.jpg",
  "https://i.postimg.cc/g2fK10J4/2.jpg",
  "https://i.postimg.cc/pXWcByhF/3.jpg",
  "https://i.postimg.cc/rsJnk2bN/4.jpg",
  "https://i.postimg.cc/NG7PTR0W/5.jpg",
  "https://i.postimg.cc/B627mKBx/6.jpg",
  "https://i.postimg.cc/vZmjGDGB/7.jpg",
  "https://i.postimg.cc/Nj0VQLQY/8.jpg",
  "https://i.postimg.cc/P5qcdNdT/9.jpg",
  "https://i.postimg.cc/kg5Z7D73/10.jpg",
  "https://i.postimg.cc/52tGfjfM/11.jpg",
  "https://i.postimg.cc/X7LmM96W/12.jpg"
];

/* ====== BUILD BOOK ====== */
const book = document.getElementById("book");
const startBtn = document.getElementById("startBook");

let pages = [];
let current = 0;

/* 🎧 ÂM THANH LẬT TRANG */
const flipSound = new Audio("page-flip-47177.mp3"); // đường dẫn trong thư mục public/sounds
flipSound.volume = 0.5; // chỉnh âm lượng nhẹ nhàng

// --- Trang bìa ---
const cover = document.querySelector(".cover");
pages.push(cover);

// --- Sinh từng trang (1 ảnh / trang) ---
photos.forEach((src, i) => {
  const p = document.createElement("div");
  p.className = "page";
  p.innerHTML = `<img src="${src}" alt="Trang ${i + 1}" />`;
  book.appendChild(p);
  pages.push(p);
});

// --- Trang cuối ---
const end = document.createElement("div");
end.className = "page end";
end.innerHTML = `
  <div class="end-inner">
    <h2>Trang cuối đặc biệt 💖</h2>
    <p>Nhấn để mở thiệp sinh nhật lung linh cho mẹ nhé!</p>
    <button id="openCard" class="btn">Mở thiệp</button>
  </div>
`;
book.appendChild(end);
pages.push(end);

// Xếp z-index đúng
pages.forEach((p, i) => (p.style.zIndex = pages.length - i));

/* ====== HIỆU ỨNG LẬT SÁCH ====== */
function goTo(n) {
  if (n === current || n < 0 || n >= pages.length) return;
  const direction = n > current ? 1 : -1;

  if (direction === 1) pages[current].classList.add("flipped");
  else pages[n].classList.remove("flipped");

  // 🎵 Phát âm thanh lật trang
  flipSound.currentTime = 0;
  flipSound.play().catch(() => {});

  current = n;
}

book.addEventListener("click", (e) => {
  const rect = book.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const mid = rect.width / 2;
  if (x > mid) goTo(current + 1);
  else goTo(current - 1);
});

// ✅ Khi bấm “Mở sách” thì lật bìa đầu tiên
startBtn?.addEventListener("click", (e) => {
  e.stopPropagation(); // chặn click lan ra ngoài
  goTo(1);
});

/* ====== CHUYỂN SANG THIỆP ====== */
const celebrate = document.getElementById("celebrate");
const scene = document.querySelector(".scene");
celebrate.classList.add("hidden");
scene.style.display = "flex";

document.addEventListener("click", (e) => {
  const btn = e.target.closest("#openCard");
  if (!btn) return;
  scene.style.display = "none";
  celebrate.classList.remove("hidden");
});

/* ====== THIỆP / PHÁO HOA ====== */
const envelope = document.getElementById("envelope");
const letter = document.getElementById("letter");
const music = document.getElementById("music");
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

resizeCanvas();
addEventListener("resize", resizeCanvas);

let fireworks = [],
  particles = [],
  balloons = [];
let running = false,
  animating = false;

envelope.addEventListener("click", openEnvelope);

function openEnvelope() {
  envelope.classList.add("open");
  boom(0.9);
  setTimeout(() => {
    letter.classList.add("show");
    burstCenter();
    boom(1);
  }, 700);
  setTimeout(() => {
    envelope.classList.add("hide");
    startShow();
  }, 1600);
  setTimeout(() => {
    music.currentTime = 0;
    music.play().catch(() => {});
  }, 3200);
}

/* ---- Fireworks ---- */
function boom(vol = 1) {
  const a = new Audio(
    "https://cdn.pixabay.com/download/audio/2023/05/03/audio_7e4d587cd8.mp3?filename=fireworks-14624.mp3"
  );
  a.volume = vol;
  a.play().catch(() => {});
}

class Firework {
  constructor(delay = 0) {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 5;
    this.targetY = Math.random() * (canvas.height * 0.45) + canvas.height * 0.15;
    this.color = `hsl(${Math.random() * 360},100%,70%)`;
    this.speed = 2 + Math.random() * 1.4;
    this.exploded = false;
    this.delay = delay;
    this.t = 0;
  }
  update() {
    if (this.t++ < this.delay) return;
    if (!this.exploded) {
      this.y -= this.speed;
      if (this.y <= this.targetY) {
        this.exploded = true;
        boom(0.8);
        const n = 90 + Math.floor(Math.random() * 50);
        for (let i = 0; i < n; i++)
          particles.push(new Particle(this.x, this.y, this.color, true));
      }
    }
  }
  draw() {
    if (this.t < this.delay) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 18;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class Particle {
  constructor(x, y, c, glow = false) {
    this.x = x;
    this.y = y;
    this.c = c;
    this.glow = glow;
    this.r = 2 + Math.random() * 2.2;
    this.a = 1;
    const ang = Math.random() * Math.PI * 2,
      sp = 2.2 + Math.random() * 3.2;
    this.vx = Math.cos(ang) * sp;
    this.vy = Math.sin(ang) * sp;
    this.g = 0.035 + Math.random() * 0.03;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.g;
    this.a -= 0.014;
  }
  draw() {
    if (this.a <= 0) return;
    ctx.globalAlpha = Math.max(this.a, 0);
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    if (this.glow) {
      ctx.shadowBlur = 22;
      ctx.shadowColor = this.c;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

class Balloon {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 60;
    this.r = 10 + Math.random() * 14;
    this.speed = 0.6 + Math.random() * 1;
    this.c = `hsl(${Math.random() * 360},100%,70%)`;
  }
  update() {
    this.y -= this.speed;
    if (this.y < -60) {
      this.y = canvas.height + 60;
      this.x = Math.random() * canvas.width;
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.c;
    ctx.fill();
  }
}

function burstCenter() {
  const cx = canvas.width / 2,
    cy = canvas.height / 2;
  for (let k = 0; k < 6; k++)
    for (let i = 0; i < 120; i++)
      particles.push(
        new Particle(
          cx + (Math.random() - 0.5) * 100,
          cy + (Math.random() - 0.5) * 80,
          `hsl(${Math.random() * 360},100%,70%)`,
          true
        )
      );
  run();
}

function startShow() {
  running = true;
  for (let i = 0; i < 26; i++) fireworks.push(new Firework(i * 20));
  for (let i = 0; i < 30; i++) balloons.push(new Balloon());
  run();
}

function run() {
  if (!animating) {
    animating = true;
    requestAnimationFrame(loop);
  }
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fireworks.forEach((f) => f.update());
  fireworks.forEach((f) => f.draw());
  fireworks = fireworks.filter((f) => !f.exploded);
  particles.forEach((p) => p.update());
  particles.forEach((p) => p.draw());
  particles = particles.filter((p) => p.a > 0);
  balloons.forEach((b) => b.update());
  balloons.forEach((b) => b.draw());
  if (running || particles.length > 0) requestAnimationFrame(loop);
  else animating = false;
}

function resizeCanvas() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
