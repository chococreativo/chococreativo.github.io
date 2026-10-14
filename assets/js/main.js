/* Portafolio de Edgar Altamar M.
   El contenido se edita desde el panel (Pages CMS) y vive en content/sitio.json y content/proyectos.json. */
(function () {
  "use strict";

  // Formulario: FormSubmit reenvía los mensajes al correo sin necesidad de servidor.
  // La primera vez que alguien escriba, FormSubmit manda un correo para activar el formulario.
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  // Las rutas de imágenes del panel empiezan con "/"; se quitan para que funcionen en cualquier carpeta.
  function src(path) { return (path || "").replace(/^\//, ""); }

  function getJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " " + r.status);
      return r.json();
    });
  }

  Promise.all([getJSON("content/sitio.json"), getJSON("content/proyectos.json")])
    .then(function (res) { render(res[0], (res[1] && res[1].proyectos) || []); })
    .catch(function (err) { console.error("No se pudo cargar el contenido:", err); });

  function render(site, projects) {
    // Textos simples
    $all("[data-bind]").forEach(function (n) {
      var v = site[n.getAttribute("data-bind")];
      if (typeof v === "string") n.textContent = v;
    });
    $all('[data-href="behance"]').forEach(function (a) {
      if (site.behance) a.href = site.behance; else a.hidden = true;
    });
    if (site.foto) $("#heroPhoto").src = src(site.foto);
    if (site.nombre) {
      document.title = site.nombre + (site.marca ? " · " + site.marca : "");
      splitName(site.nombre);
    }

    // Formación
    var edu = $("#edu");
    (site.formacion || []).forEach(function (f) {
      var li = el("li");
      li.appendChild(el("strong", null, f.titulo));
      if (f.lugar) li.appendChild(el("span", null, f.lugar));
      edu.appendChild(li);
    });

    // Servicios
    var services = $("#services"), select = $("#f-tipo");
    (site.servicios || []).forEach(function (s, i) {
      var card = el("article", "service");
      card.insertAdjacentHTML("afterbegin",
        '<svg class="frame" aria-hidden="true"><rect class="base" x="0" y="0" width="100%" height="100%" rx="12" pathLength="1"/>' +
        '<rect class="trace" x="0" y="0" width="100%" height="100%" rx="12" pathLength="1"/></svg>');
      var body = el("div");
      body.appendChild(el("h3", null, s.titulo));
      body.appendChild(el("p", null, s.descripcion));
      card.appendChild(body);
      services.appendChild(card);
      var opt = el("option", null, s.titulo); opt.value = s.titulo; select.appendChild(opt);
    });
    var other = el("option", null, "Otro"); other.value = "Otro"; select.appendChild(other);

    // Herramientas (cinta en movimiento; se duplica para que el ciclo no tenga cortes)
    var tools = $("#tools"), list = site.herramientas || [];
    for (var k = 0; k < 2; k++) {
      list.forEach(function (t) {
        var s = el("span", null, t);
        if (k === 1) s.setAttribute("aria-hidden", "true");
        tools.appendChild(s);
      });
    }

    renderWorks(projects);
    setupContact(site);
    setupReveal();
  }

  // Nombre: cada letra sube desde abajo al cargar
  function splitName(name) {
    var h = $("#heroName");
    var words = name.trim().split(/\s+/);
    var lines = words.length > 1 ? [words[0], words.slice(1).join(" ")] : [name];
    h.textContent = "";
    h.setAttribute("aria-label", name);
    var idx = 0;
    lines.forEach(function (line) {
      var ln = el("span", "ln");
      ln.setAttribute("aria-hidden", "true");
      Array.prototype.forEach.call(line, function (c) {
        var ch = el("span", c === " " ? "ch sp" : "ch", c === " " ? " " : c);
        ch.style.animationDelay = (reduceMotion ? 0 : 0.15 + idx * 0.035) + "s";
        idx++;
        ln.appendChild(ch);
      });
      h.appendChild(ln);
    });
  }

  // Trabajos con filtros por categoría
  function renderWorks(projects) {
    var grid = $("#works"), filters = $("#filters");
    var cats = ["Todos"];
    projects.forEach(function (p) { if (p.categoria && cats.indexOf(p.categoria) < 0) cats.push(p.categoria); });

    cats.forEach(function (c, i) {
      var b = el("button", "chip", c);
      b.type = "button";
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.addEventListener("click", function () {
        $all(".chip", filters).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        $all(".work", grid).forEach(function (w) { w.hidden = !(c === "Todos" || w.dataset.cat === c); });
      });
      filters.appendChild(b);
    });
    if (cats.length < 3) filters.hidden = true;

    projects.forEach(function (p) {
      var b = el("button", "work");
      b.type = "button";
      b.dataset.cat = p.categoria || "";
      var imgBox = el("div", "work-img");
      var img = el("img"); img.src = src(p.imagen); img.alt = p.titulo || ""; img.loading = "lazy";
      imgBox.appendChild(img);
      b.appendChild(imgBox);
      var meta = el("div", "work-meta");
      meta.appendChild(el("span", "work-title", p.titulo));
      if (p.categoria) meta.appendChild(el("span", "work-cat", p.categoria));
      b.appendChild(meta);
      b.appendChild(el("span", "work-arrow", "↗"));
      b.addEventListener("click", function () { openWork(p); });
      grid.appendChild(b);
    });
  }

  var dlg = $("#workDialog");
  function openWork(p) {
    $("#wdImg").src = src(p.imagen);
    $("#wdImg").alt = p.titulo || "";
    $("#wdCat").textContent = p.categoria || "";
    $("#wdTitle").textContent = p.titulo || "";
    $("#wdDesc").textContent = p.descripcion || "";
    var link = $("#wdLink");
    if (p.enlace) { link.href = p.enlace; link.hidden = false; } else { link.hidden = true; }
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  $("#wdClose").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  // Contacto: copiar correo y enviar formulario
  function setupContact(site) {
    var toast = $("#copyToast");
    $("#copyMail").addEventListener("click", function () {
      var mail = $("#mailText");
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(mail);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        toast.textContent = "Correo seleccionado, cópialo con Ctrl+C";
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mail.textContent).then(function () { toast.textContent = "Correo copiado ✓"; }, fallback);
      } else { fallback(); }
      setTimeout(function () { toast.textContent = ""; }, 3000);
    });

    var form = $("#contactForm"), status = $("#formStatus"), btn = $("#sendBtn");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      if (!form.checkValidity()) {
        status.textContent = "Completa tu nombre, un correo válido y el mensaje.";
        status.classList.add("err");
        return;
      }
      var data = {
        nombre: form.nombre.value,
        email: form.email.value,
        servicio: form.tipo.value,
        mensaje: form.mensaje.value,
        _subject: "Nuevo mensaje desde tu portafolio",
        _template: "table"
      };
      btn.disabled = true;
      status.textContent = "Enviando…";
      fetch(FORM_ENDPOINT + encodeURIComponent(site.correo), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () {
          status.textContent = "¡Gracias! Tu mensaje fue enviado. Te responderé pronto.";
          status.classList.add("ok");
          form.reset();
        })
        .catch(function () {
          status.textContent = "No se pudo enviar. Escríbeme directo a " + site.correo;
          status.classList.add("err");
        })
        .then(function () { btn.disabled = false; });
    });
  }

  // Secciones que aparecen al hacer scroll (solo las que aún no se ven)
  function setupReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    $all(".reveal, .work, .service").forEach(function (n) {
      if (n.getBoundingClientRect().top > window.innerHeight) { n.classList.add("reveal", "pre"); io.observe(n); }
    });
  }

  // Elementos flotantes que siguen el mouse + coordenadas tipo Illustrator
  function pad(n) { return String(Math.max(0, Math.round(n))).padStart(4, "0"); }
  $all(".coords").forEach(function (c) {
    c.textContent = "X 0000 · Y 0000";
    var sec = c.parentElement;
    sec.addEventListener("pointermove", function (e) {
      var r = sec.getBoundingClientRect();
      c.textContent = "X " + pad(e.clientX - r.left) + " · Y " + pad(e.clientY - r.top);
    });
  });
  // Portada: el círculo y la foto se mueven juntos siguiendo el mouse, con un leve zoom
  var hero = $(".hero"), photo = $("#heroVisual");
  if (hero && photo && !reduceMotion) {
    var tx = 0.3, ty = 0.55, cx = 0.3, cy = 0.55, raf = 0;
    function tick() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      photo.style.transform = "translate(" + ((cx - 0.5) * -12).toFixed(1) + "px," + ((cy - 0.5) * -8).toFixed(1) + "px) scale(" + (1 + Math.max(0, 0.5 - Math.hypot(cx - 0.3, cy - 0.5)) * 0.08).toFixed(3) + ")";
      raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(tick) : 0;
    }
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    hero.addEventListener("pointerleave", function () {
      tx = 0.3; ty = 0.55;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  // Portada: pequeñas × y círculos que aparecen y desaparecen en lugares al azar
  var sparks = $("#sparks");
  if (sparks) {
    var kinds = ["x", "x", "x red", "o", "o red", "o"];
    function place(sp) {
      sp.style.left = (4 + Math.random() * 92).toFixed(1) + "%";
      sp.style.top = (12 + Math.random() * 80).toFixed(1) + "%";
    }
    for (var n = 0; n < 16; n++) {
      var sp = el("span", "spark " + kinds[n % kinds.length], kinds[n % kinds.length].indexOf("x") === 0 ? "×" : "");
      place(sp);
      sp.style.animationDuration = (2.8 + Math.random() * 2.4).toFixed(2) + "s";
      sp.style.animationDelay = (Math.random() * 4).toFixed(2) + "s";
      if (reduceMotion) { sp.style.animation = "none"; sp.style.opacity = ".5"; sp.style.transform = "none"; }
      else sp.addEventListener("animationiteration", function () { place(this); });
      sparks.appendChild(sp);
    }
  }

  // Glitch en el nombre: cada pocos segundos y al pasar el mouse
  var heroName = $("#heroName");
  function glitch() {
    if (!heroName || heroName.classList.contains("glitch")) return;
    heroName.classList.add("glitch");
    setTimeout(function () { heroName.classList.remove("glitch"); }, 600);
  }
  if (heroName && !reduceMotion) {
    setTimeout(function loop() { glitch(); setTimeout(loop, 3500 + Math.random() * 3500); }, 2200);
    heroName.addEventListener("pointerenter", glitch);
  }

  // Menú en celular
  var toggle = $("#navToggle"), links = $("#navLinks");
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  $all("a", links).forEach(function (a) {
    a.addEventListener("click", function () { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); });
  });

  // Marca la sección activa en el menú
  if ("IntersectionObserver" in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          $all("a", links).forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
          $(".nav-cta").classList.toggle("active", e.target.id === "contacto");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $all("main section[id]").forEach(function (s) { navIO.observe(s); });
  }

  $("#year").textContent = new Date().getFullYear();

  // Modo app: permite instalar el sitio y abrirlo sin conexión
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
