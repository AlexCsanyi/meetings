{
  imagesLoaded(
    document.querySelectorAll([".fullview_item", ".grid_item-bg"]),
    { background: true },
    () => {
      document.body.classList.remove("loading");
    }
  );

  const getRandomFloat = (min, max) =>
    (Math.random() * (max - min) + min).toFixed(2);

  const getMousePosition = e => {
    let posx = 0;
    let posy = 0;
    if (!e) e = window.event;
    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.posY;
    } else if (e.clientX || e.clientY) {
      posx =
        e.clientX +
        document.body.scrollLeft +
        document.documentElement.scrollLeft;
      posy =
        e.clientY +
        document.body.scrollTop +
        document.documentElement.scrollTop;
    }
    return { x: posx, y: posy };
  };

  class GridItem {
    constructor(el) {
      this.DOM = { el: el };
      this.DOM.inner = Array.from(this.DOM.el.children);
    }
    toggle(action) {
      this.DOM.inner.forEach(inner => {
        const speed = getRandomFloat(1, 1, 5);
        TweenMax.to(inner, speed, {
          delay: 0.2,
          ease: "Quint.easeInOut",
          y:
            action === "hide"
              ? this.constructor.name === "Thumb"
                ? -1 * winsize.height - 30
                : -1 * winsize.height - 30 + inner.OffsetHeight / 2
              : 0
        });

        if (this.constructor.name !== "Thumb") {
          TweenMax.to(inner, speed / 2, {
            delay: 0.2,
            ease: "Quien.easeIn",
            scaleY: 2.5
          });
          TweenMax.to(inner, speed / 2, {
            delay: 0.2 + speed / 2,
            ease: "Quint.easeOut",
            scaleY: 1
          });
        }
      });

      if (this.constructor.name === "GridItem") {
        TweenMax.to(
          this.DOM.el.querySelector(".grid_toggle-more"),
          action === "hide" ? 0.2 : 0.4,
          {
            delay: action === "hide" ? 0.2 : 1,
            ease: action === "hide" ? "Quad.easeIn" : "Quad.easeOut",
            startAt: action === "hide" ? {} : { opacity: 0, y: "-150%" },
            y: action === "hide" ? "-150%" : "0%",
            opacity: action === "hide" ? 0 : 1
          }
        );
        TweenMax.to(
          this.DOM.el.querySelector(".grid_toggle-back"),
          action === "hide" ? 0.4 : 0.2,
          {
            delay: action === "hide" ? 1 : 0.2,
            ease: action === "hide" ? "Quad.easeOut" : "Quad.easeIn",
            startAt: action === "hide" ? { opacity: 0, y: "50%" } : {},
            y: action === "hide" ? "0%" : "50%",
            opacity: action === "hide" ? 1 : 0
          }
        );
      }
    }
  }

  class Thumb extends GridItem {
    constructor(el) {
      super(el);
      this.DOM.tilt = {};
      this.DOM.tilt.title = this.DOM.el.querySelector(".grid_item-title");
      this.DOM.tilt.number = this.DOM.el.querySelector(".grid_item-number");
      this.DOM.tilt.number = this.DOM.el.querySelector(
        ".grid_item-img > .grid_item-bg"
      );

      this.tiltconfig = {
        title: { translation: { x: [-8, 8], y: [4, -4] } },
        number: { translation: { x: [-5, 5], y: [-12, 0] } },
        img: { translation: { x: [-8, 8], y: [6, -6] } }
      };
      this.initEvents();
    }

    initEvents() {
      let enter = false;
      this.mouseenterFn = () => {
        if (enter) {
          enter: false;
        }
        clearTimeout(this.mousetime);
        this.mouseTime = setTimeout(() => {
          (enter = true), 80;
        });
      };
      this.mousemoveFn = ev => {
        requestAnimationFrame(() => {
          if (!enter) return;
          this.tilt(ev);
        });
      };
      this.mouseleaveFn = () => {
        requestAnimationFrame(() => {
          if (!enter || !allowTilt) return;
          enter = false;
          clearTimeout(this.mouseTime);
          this.resetTilt();
        });
      };
      this.DOM.el.addEventListener("mouseenter", this.mouseenterFn);
      this.DOM.el.addEventListener("mousemove", this.mousemoveFn);
      this.DOM.el.addEventListener("mouseleave", this.mouseleaveFn);
    }
    tilt(ev) {
      if (!allowTilt) return;
      const mousepos = getMousePosition(ev);

      const docScrolls = {
        left: document.body.scrollLeft + document.documentElement.scrollLeft,
        top: document.body.scrollTop + document.documentElement.scrollTop
      };
      const bounds = this.DOM.el.getBoundingClientRect();

      const relmousepos = {
        x: mousepos.x - bounds.left - docScrolls.left,
        y: mousepos.y - bounds.top - docScrolls.top
      };

      for (let key in this.DOM.tilt) {
        let t = this.tiltconfig[key].translation;
        TweenMax.to(this.DOM.tilt[key], 1, {
          x: ((t.x[1] - t.x[0]) / bounds.width) * relmousepos.x + t.x[0],
          y: ((t.y[1] - t.y[0]) / bounds.height) * relmousepos.y + t.y[0]
        });
      }
    }

    resetTilt() {
      for (let key in this.DOM.tilt) {
        TweenMax.to(this.DOM.tilt[key], 2, {
          x: 0,
          y: 0
        });
      }
    }
  }

  class Grid {
    constructor() {
      this.DOM = { grid: document.querySelector(".grid--thumbs") };
      this.DOM.thumbs = Array.from(
        this.DOM.grid.querySelectorAll(".grid_item:not(.grid_item--more)")
      );
      this.thumbs = [];
      this.DOM.thumbs.forEach(thumb => this.thumbs.push(new Thumb(thumb)));

      this.DOM.moreCtrl = this.DOM.grid.querySelector(".grid_item--more");
      const more = new GridItem(this.DOM.moreCtrl);

      this.movable = [...this.thumbs, more];

      this.DOM.revealer = document.querySelector(".revealer");

      this.DOM.fullview = document.querySelector(".fullview");
      this.DOM.fullviewItems = this.DOM.fullview.querySelector(
        ".fullview_item"
      );

      this.current = -1;

      this.initEvents();
    }

    initEvents() {
      this.DOM.thumbs.forEach((thumb, pos) => {
        thumb.addEventListener("click", () => {
          this.current = pos;
          this.showProject();
        });
      });

      this.DOM.moreCtrl.addEventListener("click", () => {
        if (!this.isGridHidden) return;
        this.hideProject();
      });

      window.addEventListener("resize", () => {
        winsize = { width: window.innerWidth, height: window.innerHeight };
        if (this.isGridHidden) {
          this.movable.forEach(item => {
            Array.from(item.DOM.el.children).forEach(child => {
              TweenMax.set(child, {
                y:
                  item.constructor.name === "Thumb"
                    ? -1 * winsize.height - 30
                    : -1 * winsize.height - 30 + child.OffsetHeight / 2
              });
            });
          });
        }
      });
    }

    showProject() {
      this.toggleProject("show");
    }

    hideProject() {
      this.toggleProject("hide");
    }

    toggleProject(action) {
      if (this.isAnimating) return;
      this.isAnimating = true;
      this.isGridHidden = action === "show";
      allowTilt = !this.isGridHidden;
      this.showRevealer().then(() => {
        this.DOM.fullviewItems[this.current].style.opacity = this.isGridHidden
          ? 1
          : 0;
        this.DOM.fullview.style.opacity = this.isGridHidden ? 1 : 0;
        this.DOM.fullview.style.pointerEvents = this.isGridHidden
          ? "auto"
          : "none";
        this.hideRevealer(this.isGridHidden ? "up" : "down");
        this.isAnimating = false;
      });

      this.movable.forEach(item => {
        item.toggle(this.isGridHidden ? "hide" : "show");
        item.DOM.el.style.pointerEvents = this.isGridHidden ? "none" : "auto";
      });
    }

    showRevealer() {
      return this.toggleRevealer("show");
    }

    hideRevealer(dir) {
      return this.toggleRevealer("hide", dir);
    }

    toggleRevealer(action, dir) {
      return new Promise((resolve, reject) => {
        if (action === "show") {
          this.DOM.revealer.style.backgroundColor = this.movable[
            this.current
          ].DOM.el.dataset.revealerColor;
        }

        TweenMax.to(this.DOM.revealer, action === "show" ? 1 : 1, {
          ease: action === "show" ? "Quint.easeInOut" : "Quint.easeOut",
          y: action === "show" ? "-100%" : dir === "up" ? "-200%" : "0%",
          onComplete: resolve
        });
      });
    }
  }

  let winsize = { width: window.innerWidth, height: window.innerHeight };
  let allowTilt = true;
  new Grid();
}
