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
    if (!e) window.event;
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
      this.DOM.inner = Array.from(this.MOD.el.children);
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
                ? -1 * winsize.heigh - 30
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
          if (!enter || allowTilt) return;
          enter = false;
          clearTimeout(this.mouseTime);
          this.resetTilt();
        });
      };
      this.DOM.el.addEventListener("mouseenter", this.mouseenterFn);
      this.DOM.el.addEventListener("mousemove", this.mousemoveFn);
      this.DOM.addEventListener("mouseleave", this.mouseleaveFn);
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
    }
  }
}
