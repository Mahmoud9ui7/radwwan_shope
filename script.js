/* script.js
   كل منطق التطبيق: التبويبات، السلة، التفاصيل، التخزين المحلي، Toast
*/

(() => {
  /*********************
   * بيانات المنتجات (ثابتة الآن — لاحقًا من API)
   *********************/
  const products = [
    { id: 1, name: "عسل جبل طبيعي 1كغ", price: 220, img: "https://plus.unsplash.com/premium_photo-1663957861996-8093b48a22e6?auto=format&fit=crop&q=60&w=800", desc: "عسل نقي من جبال طبيعية، طعم غني ولون ذهبي جميل." },
    { id: 2, name: "خل تفاح عضوي 500مل", price: 40, img: "https://images.unsplash.com/photo-1610276329975-fbaa313c9d0e?auto=format&fit=crop&q=60&w=800", desc: "خل تفاح عضوي ممتاز للسلطات والصحة اليومية." },
    { id: 3, name: "كيكة الفاكهة الصغيرة", price: 180, img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=60&w=800", desc: "كيك فاكهة طازج بمكونات طبيعية ونكهة لذيذة." },
    { id: 4, name: "عسل زهري 500غ", price: 130, img: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&q=60&w=800", desc: "عسل خفيف ذو رائحة زهرية لطيفة." },
    { id: 5, name: "خل العنب 750مل", price: 55, img: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=60&w=800", desc: "خل عنب بنكهة غنية ومناسبة للطبخ." }
  ];

  /*********************
   * حالة التطبيق — السلة + عناصر DOM
   *********************/
  let cart = loadCart();

  // DOM
  const productsGrid = document.getElementById("productsGrid");
  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");
  const cartCountSummary = document.getElementById("cartCountSummary");
  const emptyCart = document.getElementById("emptyCart");
  const cartBadgeHeader = document.getElementById("cartBadgeHeader");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  const productDetailsSection = document.getElementById("productDetails");
  const detailImg = document.getElementById("detailImg");
  const detailName = document.getElementById("detailName");
  const detailPrice = document.getElementById("detailPrice");
  const detailDesc = document.getElementById("detailDesc");
  const detailQty = document.getElementById("detailQty");
  const detailInc = document.getElementById("detailInc");
  const detailDec = document.getElementById("detailDec");
  const detailAdd = document.getElementById("detailAdd");
  const backToStore = document.getElementById("backToStore");

  // Profile elements
  const profileNameEl = document.getElementById("profileName");
  const profileEmailEl = document.getElementById("profileEmail");
  const inpName = document.getElementById("inpName");
  const inpEmail = document.getElementById("inpEmail");
  const saveProfileBtn = document.getElementById("saveProfile");
  const cancelProfileBtn = document.getElementById("cancelProfile");

  /*********************
   * localStorage helpers
   *********************/
  function saveCart() {
    try {
      localStorage.setItem("hvc_cart_v1", JSON.stringify(cart));
    } catch (e) {
      console.warn("localStorage غير متاح:", e);
    }
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem("hvc_cart_v1");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem("hvc_profile", JSON.stringify(profile));
    } catch (e) {}
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem("hvc_profile");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /*********************
   * Render products grid
   *********************/
  function renderProducts(filter = "") {
    productsGrid.innerHTML = "";
    const search = filter.trim().toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(search));

    filtered.forEach(p => {
      const card = document.createElement("article");
      card.className = "group rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition flex flex-col";
      card.innerHTML = `
        <img src="${p.img}" alt="${p.name}" class="h-44 sm:h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" data-id="${p.id}" />
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-semibold cursor-pointer" data-id="${p.id}">${p.name}</h3>
            <p class="text-sm text-gray-500 mt-2">${p.price} ر.س</p>
          </div>
          <div class="mt-4 flex items-center justify-between gap-3">
            <div class="text-sm text-gray-600">${p.price} ر.س</div>
            <button data-id="${p.id}" class="addBtn w-36 px-3 py-2 bg-amber-400 hover:bg-amber-500 text-white font-medium rounded-full shadow transition">➕ أضف إلى السلة</button>
          </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });

    // attach listeners
    document.querySelectorAll(".addBtn").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = +e.currentTarget.dataset.id;
        addToCart(id);
      });
    });

    // open details when clicking image or title
    productsGrid.querySelectorAll("[data-id]").forEach(el => {
      el.addEventListener("click", (e) => {
        const id = +e.currentTarget.dataset.id;
        // if clicked on add button, avoid double opening (handled above)
        if (e.currentTarget.classList.contains("addBtn")) return;
        openDetails(id);
      });
    });
  }

  /*********************
   * Cart functions
   *********************/
  function addToCart(productId, qty = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.qty += qty;
    else cart.push({ id: productId, qty });
    saveCart();
    renderCart();
    showToast(`${product.name} أُضيفت إلى السلة`);
  }

  function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    renderCart();
    showToast(`تمت إزالة المنتج من السلة`);
  }

  function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(productId);
      return;
    }
    saveCart();
    renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  function cartSummary() {
    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => {
      const p = products.find(x => x.id === i.id);
      return s + (p ? p.price * i.qty : 0);
    }, 0);

    cartCountSummary.textContent = totalItems;
    cartTotal.textContent = totalPrice.toLocaleString() + " ر.س";

    if (totalItems > 0) {
      cartBadgeHeader.classList.remove("hidden");
      cartBadgeHeader.textContent = totalItems;
    } else {
      cartBadgeHeader.classList.add("hidden");
      cartBadgeHeader.textContent = "";
    }
  }

  function renderCart() {
    cartList.innerHTML = "";
    if (cart.length === 0) {
      emptyCart.classList.remove("hidden");
    } else {
      emptyCart.classList.add("hidden");
    }

    cart.forEach(item => {
      const p = products.find(x => x.id === item.id);
      if (!p) return;

      const row = document.createElement("div");
      row.className = "flex items-center gap-3 p-3 border rounded-md";
      row.innerHTML = `
        <img src="${p.img}" class="w-16 h-16 object-cover rounded-md" alt="${p.name}" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <div class="font-medium truncate">${p.name}</div>
            <div class="text-sm text-gray-600">${(p.price * item.qty).toLocaleString()} ر.س</div>
          </div>
          <div class="text-sm text-gray-500">${p.price.toLocaleString()} ر.س للواحد</div>
        </div>
        <div class="flex items-center gap-2">
          <button data-id="${item.id}" class="decBtn px-2 py-1 rounded-md border">−</button>
          <div class="px-3 py-1 border rounded-md">${item.qty}</div>
          <button data-id="${item.id}" class="incBtn px-2 py-1 rounded-md border">+</button>
          <button data-id="${item.id}" class="removeBtn ml-2 text-sm text-rose-600">حذف</button>
        </div>
      `;
      cartList.appendChild(row);
    });

    // connect handlers
    document.querySelectorAll(".incBtn").forEach(b => {
      b.addEventListener("click", (e) => changeQty(+e.currentTarget.dataset.id, +1));
    });
    document.querySelectorAll(".decBtn").forEach(b => {
      b.addEventListener("click", (e) => changeQty(+e.currentTarget.dataset.id, -1));
    });
    document.querySelectorAll(".removeBtn").forEach(b => {
      b.addEventListener("click", (e) => removeFromCart(+e.currentTarget.dataset.id));
    });

    cartSummary();
  }

  /*********************
   * Product details (in-page)
   *********************/
  let currentDetailId = null;
  let currentDetailQty = 1;

  function openDetails(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    currentDetailId = id;
    currentDetailQty = 1;
    detailImg.src = p.img;
    detailName.textContent = p.name;
    detailPrice.textContent = p.price.toLocaleString() + " ر.س";
    detailDesc.textContent = p.desc || "وصف مختصر للمنتج.";
    detailQty.textContent = currentDetailQty;
    showSection("productDetails");
    // scroll into view nicely
    productDetailsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  detailInc.addEventListener("click", () => {
    currentDetailQty++;
    detailQty.textContent = currentDetailQty;
  });
  detailDec.addEventListener("click", () => {
    if (currentDetailQty > 1) currentDetailQty--;
    detailQty.textContent = currentDetailQty;
  });

  detailAdd.addEventListener("click", () => {
    if (!currentDetailId) return;
    addToCart(currentDetailId, currentDetailQty);
  });

  backToStore.addEventListener("click", () => {
    showSection("store");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /*********************
   * Toast
   *********************/
  let toastTimer = null;
  function showToast(msg, ms = 1800) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    toast.classList.remove("hidden");
    toast.classList.add("opacity-100");
    toastTimer = setTimeout(() => {
      toast.classList.add("hidden");
    }, ms);
  }

  /*********************
   * Tabs / View switching
   *********************/
  function showSection(id) {
    // hide all main sections: store, productDetails, cart, checkout, profile
    ["store","productDetails","cart","checkout","profile"].forEach(s => {
      const el = document.getElementById(s);
      if (!el) return;
      if (s === id) {
        el.classList.remove("hidden");
        el.classList.add("animate-fade-in");
      } else {
        el.classList.add("hidden");
      }
    });

    // update header tab active state
    document.querySelectorAll(".tab-btn").forEach(btn => {
      const tab = btn.dataset.tab;
      if (tab === id) {
        btn.classList.add("bg-white","shadow");
        btn.setAttribute("aria-pressed","true");
      } else {
        btn.classList.remove("bg-white","shadow");
        btn.setAttribute("aria-pressed","false");
      }
    });

    // if opening cart, scroll to top small
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /*********************
   * UI interactions
   *********************/
  document.addEventListener("click", (e) => {
    // tab buttons in header
    if (e.target.closest(".tab-btn")) {
      const btn = e.target.closest(".tab-btn");
      const tab = btn.dataset.tab;
      if (tab) showSection(tab);
    }
  });

  // search input
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => renderProducts(e.target.value));

  // clear cart button
  document.getElementById("clearCartBtn").addEventListener("click", () => {
    if (confirm("هل تريد تفريغ السلة؟")) clearCart();
  });

  // checkout button navigates to checkout tab
  document.getElementById("checkoutBtn").addEventListener("click", () => showSection("checkout"));

  // profile save/cancel
  saveProfileBtn.addEventListener("click", () => {
    const name = inpName.value.trim() || "اسم المستخدم";
    const email = inpEmail.value.trim() || "user@example.com";
    profileNameEl.textContent = name;
    profileEmailEl.textContent = email;
    saveProfile({ name, email });
    showToast("تم حفظ بيانات الحساب");
  });

  cancelProfileBtn.addEventListener("click", () => {
    const curName = profileNameEl.textContent;
    const curEmail = profileEmailEl.textContent;
    inpName.value = curName === "اسم المستخدم" ? "" : curName;
    inpEmail.value = curEmail === "user@example.com" ? "" : curEmail;
  });

  /*********************
   * Initialization
   *********************/
  function initProfile() {
    const p = loadProfile();
    if (p) {
      profileNameEl.textContent = p.name || "اسم المستخدم";
      profileEmailEl.textContent = p.email || "user@example.com";
      inpName.value = p.name || "";
      inpEmail.value = p.email || "";
    } else {
      profileNameEl.textContent = "اسم المستخدم";
      profileEmailEl.textContent = "user@example.com";
    }
  }

  function init() {
    // hide splash then show UI
    setTimeout(() => {
      const splash = document.getElementById("splash");
      if (splash) {
        splash.classList.add("opacity-0");
        setTimeout(() => {
          splash.classList.add("hidden");
          document.getElementById("header").classList.remove("hidden");
          document.getElementById("app").classList.remove("hidden");
          document.getElementById("footer").classList.remove("hidden");
          // render UI
          renderProducts();
          renderCart();
          initProfile();
          showSection("store");
        }, 380);
      }
    }, 1000);
  }

  // start
  init();

})();
