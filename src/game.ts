const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId = 0;
  private lastTime = 0;
  private playerX = GAME_WIDTH / 2;
  private playerY = GAME_HEIGHT / 2;
  private pointerActive = false;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context unavailable");
    }
    this.ctx = ctx;

    this.bindInput();
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  start(): void {
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame((time) => this.loop(time));
  }

  stop(): void {
    cancelAnimationFrame(this.animationId);
  }

  private bindInput(): void {
    const moveTo = (clientX: number, clientY: number) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = GAME_WIDTH / rect.width;
      const scaleY = GAME_HEIGHT / rect.height;
      this.playerX = (clientX - rect.left) * scaleX;
      this.playerY = (clientY - rect.top) * scaleY;
    };

    this.canvas.addEventListener("pointerdown", (event) => {
      this.pointerActive = true;
      this.canvas.setPointerCapture(event.pointerId);
      moveTo(event.clientX, event.clientY);
    });

    this.canvas.addEventListener("pointermove", (event) => {
      if (!this.pointerActive) return;
      moveTo(event.clientX, event.clientY);
    });

    this.canvas.addEventListener("pointerup", () => {
      this.pointerActive = false;
    });

    this.canvas.addEventListener("pointercancel", () => {
      this.pointerActive = false;
    });
  }

  private resize(): void {
    const scale = Math.min(
      window.innerWidth / GAME_WIDTH,
      window.innerHeight / GAME_HEIGHT,
    );
    this.canvas.style.width = `${GAME_WIDTH * scale}px`;
    this.canvas.style.height = `${GAME_HEIGHT * scale}px`;
  }

  private loop(time: number): void {
    const delta = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    this.update(delta);
    this.render();

    this.animationId = requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  private update(_delta: number): void {
    this.playerX = Math.max(20, Math.min(GAME_WIDTH - 20, this.playerX));
    this.playerY = Math.max(20, Math.min(GAME_HEIGHT - 20, this.playerY));
  }

  private render(): void {
    const { ctx } = this;

    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      ctx.fillRect(0, y, GAME_WIDTH, 1);
    }
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      ctx.fillRect(x, 0, 1, GAME_HEIGHT);
    }

    ctx.fillStyle = "#6ee7b7";
    ctx.beginPath();
    ctx.arc(this.playerX, this.playerY, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Mobile Web", GAME_WIDTH / 2, 48);

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Drag to move", GAME_WIDTH / 2, GAME_HEIGHT - 32);
  }
}
