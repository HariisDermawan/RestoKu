
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const iconMenu = document.getElementById("icon-menu");
  const iconClose = document.getElementById("icon-close");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      iconMenu.classList.toggle("hidden");
      iconClose.classList.toggle("hidden");
    });
  }
  const cartTableBody = document.querySelector("table tbody");
  const customerInput = document.querySelector('input[placeholder="Nama Customer"]');
  const totalBayarInput = document.querySelector(".total-bayar");
  const diskonInput = document.querySelector(".diskon");
  const grandTotalInput = document.querySelector(".grand-total");
  const statusSelect = document.querySelector("select");
  const simpanBtn = document.querySelector("button.mt-6");
  const buyButtons = document.querySelectorAll("button.w-full.bg-yellow-400");
  const categoryButtons = document.querySelectorAll(".category-btn");
  const menuCards = document.querySelectorAll(".menu-card");
  const orderInput = document.querySelector('input[placeholder="Auto"]');

  let lastOrderNumber = parseInt(localStorage.getItem("lastOrderNumber")) || 0;
  orderInput.value = `ORD-${String(lastOrderNumber + 1).padStart(4, "0")}`;
  function showCategory(category) {
    menuCards.forEach(card => card.classList.add("hidden"));
    let shown = 0;
    menuCards.forEach(card => {
      const cardCategory = card.getAttribute("data-category");
      if ((category === "all" || cardCategory === category) && shown < 6) {
        card.classList.remove("hidden");
        shown++;
      }
    });
  }
  showCategory("all");

  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-category");
      categoryButtons.forEach(b => b.classList.remove("bg-yellow-500"));
      btn.classList.add("bg-yellow-500");
      showCategory(category);
    });
  });
  cartTableBody.innerHTML = "";
  document.querySelectorAll(".quantity-plus, .quantity-minus").forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
  });

  document.querySelectorAll(".quantity-plus").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const qtySpan = btn.parentElement.querySelector(".quantity-value");
      let current = parseInt(qtySpan.textContent) || 0;
      qtySpan.textContent = current + 1;
    });
  });

  document.querySelectorAll(".quantity-minus").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const qtySpan = btn.parentElement.querySelector(".quantity-value");
      let current = parseInt(qtySpan.textContent) || 0;
      if (current > 0) qtySpan.textContent = current - 1;
    });
  });

  buyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".p-4");
      const name = card.querySelector("h3").textContent;
      const priceText = card.querySelector("span.font-semibold.text-lg").textContent;
      const qty = parseInt(card.querySelector(".quantity-value").textContent) || 0;
      const customerName = customerInput.value.trim();

      if (!customerName) return alert("Isi nama customer terlebih dahulu!");
      if (qty <= 0) return alert("Jumlah pesanan harus lebih dari 0!");

      const cleanPrice = parseInt(priceText.replace(/\D/g, ""));
      const totalPrice = cleanPrice * qty;

      const existingRow = Array.from(cartTableBody.querySelectorAll("tr")).find(
        row =>
          row.children[2]?.textContent === name &&
          row.children[1]?.textContent === customerName
      );

      if (existingRow) {
        const qtyCell = existingRow.children[3];
        const newQty = parseInt(qtyCell.textContent) + qty;
        qtyCell.textContent = newQty;
        const priceCell = existingRow.children[4];
        priceCell.textContent = `Rp. ${(cleanPrice * newQty).toLocaleString("id-ID")}`;
      } else {
        const index = cartTableBody.children.length + 1;
        const newRow = document.createElement("tr");
        newRow.classList.add("text-center", "border-t");
        newRow.innerHTML = `
          <td>${index}</td>
          <td>${customerName}</td>
          <td>${name}</td>
          <td>${qty}</td>
          <td>Rp. ${totalPrice.toLocaleString("id-ID")}</td>
          <td class="text-red-500 font-bold cursor-pointer">×</td>
        `;
        cartTableBody.appendChild(newRow);

        newRow.querySelector("td:last-child").addEventListener("click", () => {
          newRow.remove();
          updateCartNumbers();
          updateTotal();
        });
      }

      updateCartNumbers();
      updateTotal();
      card.querySelector(".quantity-value").textContent = 0;
    });
  });

  function updateCartNumbers() {
    cartTableBody.querySelectorAll("tr").forEach((row, i) => {
      row.children[0].textContent = i + 1;
    });
  }

  function updateTotal() {
    let total = 0;
    cartTableBody.querySelectorAll("tr").forEach(row => {
      total += parseInt(row.children[4].textContent.replace(/\D/g, ""));
    });
    totalBayarInput.value = total;
    const diskon = parseFloat(diskonInput.value) || 0;
    const grandTotal = total - (total * diskon) / 100;
    grandTotalInput.value = `Rp. ${grandTotal.toLocaleString("id-ID")}`;
  }

  diskonInput.addEventListener("input", updateTotal);

  simpanBtn.addEventListener("click", () => {
    if (cartTableBody.children.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    lastOrderNumber++;
    localStorage.setItem("lastOrderNumber", lastOrderNumber);
    const noOrder = `ORD-${String(lastOrderNumber).padStart(4, "0")}`;
    orderInput.value = noOrder;

    const metode = statusSelect.value;
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-black/60 flex items-center justify-center z-50";

    const bon = document.createElement("div");
    bon.className = "bg-white w-full max-w-sm rounded-lg shadow-lg p-6 relative animate-fadeIn";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.className = "absolute top-2 right-3 text-gray-500 text-2xl hover:text-black";
    closeBtn.onclick = () => modal.remove();

    const customerName = customerInput.value.trim() || "-";
    const totalBayar = parseInt(totalBayarInput.value);
    const diskon = parseFloat(diskonInput.value) || 0;
    const grandTotal = totalBayar - (totalBayar * diskon) / 100;
    const waktu = new Date().toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });

    let itemsHTML = "";
    cartTableBody.querySelectorAll("tr").forEach(row => {
      itemsHTML += `
        <tr class="border-b">
          <td class="p-1">${row.children[2].textContent}</td>
          <td class="p-1 text-center">${row.children[3].textContent}</td>
          <td class="p-1 text-right">${row.children[4].textContent}</td>
        </tr>`;
    });

    bon.innerHTML = `
      <h3 class="text-lg font-bold text-center mb-2">🧾 Struk Pembelian</h3>
      <p>No Order: <strong>${noOrder}</strong></p>
      <p>Waktu: <strong>${waktu}</strong></p>
      <p>Customer: <strong>${customerName}</strong></p>
      <hr class="my-2 border-gray-300">
      <table class="w-full text-sm mb-2">
        <thead>
          <tr class="border-b font-semibold">
            <th class="text-left p-1">Menu</th>
            <th class="text-center p-1">Qty</th>
            <th class="text-right p-1">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>
      <hr class="my-2 border-gray-300">
      <p>Total Bayar: <strong>Rp. ${totalBayar.toLocaleString("id-ID")}</strong></p>
      <p>Diskon: <strong>${diskon}%</strong></p>
      <p>Grand Total: <strong>Rp. ${grandTotal.toLocaleString("id-ID")}</strong></p>
      <p>Metode Pembayaran: <strong>${metode}</strong></p>
      <div class="text-center mt-4" id="payment-section"></div>
    `;

    if (metode.toLowerCase().includes("qris")) {
      const qrDiv = bon.querySelector("#payment-section");
      qrDiv.innerHTML = `
        <p class="font-semibold text-gray-700 mb-1">Silakan scan QR berikut:</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=Pembayaran%20QRIS%20NoOrder%20${noOrder}%20Rp${grandTotal}" 
             alt="QRIS Code" class="mx-auto border p-2 rounded-lg mb-2">
        <p class="text-sm text-gray-500">Nominal: Rp ${grandTotal.toLocaleString("id-ID")}</p>
      `;
    }

    const printBtn = document.createElement("button");
    printBtn.textContent = "Cetak Bon";
    printBtn.className =
      "bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg mt-3";
    printBtn.onclick = () => window.print();

    bon.querySelector("#payment-section").appendChild(printBtn);
    bon.appendChild(closeBtn);
    modal.appendChild(bon);
    document.body.appendChild(modal);
  });
});

