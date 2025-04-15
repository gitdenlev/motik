// Код для cart.js (для сторінки кошика MOTOTEK)

document.addEventListener("DOMContentLoaded", () => {
  // Отримуємо посилання на необхідні елементи DOM
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartSummary = document.getElementById("cart-summary");
  const totalQuantityElement = document.getElementById("total-quantity");
  const totalPriceElement = document.getElementById("total-price");
  const emptyCartMessage = document.getElementById("empty-cart-message");
  const clearCartButton = document.getElementById("clear-cart-btn");
  const checkoutButton = document.getElementById("checkout-btn");
  // Лічильник в хедері
  const cartCountElement = document.getElementById("cart-count");
  const cartContainer = document.getElementById("cart-container"); // Контейнер для .has-items

  const STORAGE_KEY = "shoppingCartMototek"; // Ключ для localStorage

  // --- Функції для роботи з localStorage ---
  function getCart() {
    const cartData = localStorage.getItem(STORAGE_KEY);
    try {
      if (cartData && cartData.trim() !== "") {
        const parsedData = JSON.parse(cartData);
        return Array.isArray(parsedData) ? parsedData : [];
      }
    } catch (e) {
      console.error(`Помилка розбору кошика ${STORAGE_KEY} з localStorage:`, e);
    }
    return [];
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      renderCart(); // Перемальовуємо кошик після будь-якої зміни
    } catch (e) {
      console.error(
        `Помилка збереження кошика ${STORAGE_KEY} у localStorage:`,
        e
      );
    }
  }

  // --- Функція оновлення лічильника в хедері ---
  function updateCartCounterHeader() {
    const cart = getCart();
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCountElement) {
      cartCountElement.textContent = totalQuantity;
    }
    // Додаємо/видаляємо клас для видимості лічильника
    if (cartContainer) {
      if (totalQuantity > 0) {
        cartContainer.classList.add("has-items");
      } else {
        cartContainer.classList.remove("has-items");
      }
    }
  }

  // --- Функція рендерингу (відображення) кошика ---
  function renderCart() {
    const cart = getCart();
    cartItemsContainer.innerHTML = ""; // Очищаємо перед рендерингом

    if (cart.length === 0) {
      cartSummary.style.display = "none";
      emptyCartMessage.style.display = "block"; // Показуємо повідомлення про порожній кошик
      if (checkoutButton) checkoutButton.disabled = true;
    } else {
      cartSummary.style.display = "block";
      emptyCartMessage.style.display = "none";
      if (checkoutButton) checkoutButton.disabled = false;

      let totalQuantity = 0;
      let totalPrice = 0;

      cart.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");
        // Генеруємо HTML для товару
        itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>Ціна: $${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-change-btn" data-id="${
                          item.id
                        }" data-change="-1" aria-label="Зменшити кількість">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-change-btn" data-id="${
                          item.id
                        }" data-change="1" aria-label="Збільшити кількість">+</button>
                    </div>
                    <div class="item-total-price">$${(
                      item.price * item.quantity
                    ).toFixed(2)}</div>
                    <button class="remove-item-btn" data-id="${
                      item.id
                    }" title="Видалити товар" aria-label="Видалити ${
          item.name
        }">×</button>
                `;
        cartItemsContainer.appendChild(itemElement);

        totalQuantity += item.quantity;
        totalPrice += item.price * item.quantity;
      });

      // Оновлюємо підсумок
      totalQuantityElement.textContent = totalQuantity;
      totalPriceElement.textContent = totalPrice.toFixed(2);

      // Додаємо обробники для кнопок (видалення/зміна кількості)
      addEventListenersToItemButtons();
    }
    // Оновлюємо лічильник в хедері
    updateCartCounterHeader();
  }

  // --- Додавання обробників до кнопок всередині товарів кошика ---
  function addEventListenersToItemButtons() {
    // Кнопки видалення
    document.querySelectorAll(".remove-item-btn").forEach((button) => {
      // Ефективний спосіб уникнути дублювання обробників
      button.replaceWith(button.cloneNode(true));
    });
    document.querySelectorAll(".remove-item-btn").forEach((button) => {
      button.addEventListener("click", handleRemoveItem);
    });

    // Кнопки зміни кількості
    document.querySelectorAll(".quantity-change-btn").forEach((button) => {
      button.replaceWith(button.cloneNode(true));
    });
    document.querySelectorAll(".quantity-change-btn").forEach((button) => {
      button.addEventListener("click", handleChangeQuantity);
    });
  }

  // --- Обробники подій для кнопок товарів ---
  function handleRemoveItem(event) {
    const itemId = event.target.dataset.id;
    let cart = getCart();
    cart = cart.filter((item) => item.id !== itemId); // Залишаємо всі, крім цього ID
    saveCart(cart); // Зберігаємо і перемальовуємо
  }

  function handleChangeQuantity(event) {
    const itemId = event.target.dataset.id;
    const change = parseInt(event.target.dataset.change, 10); // +1 або -1
    let cart = getCart();
    const itemIndex = cart.findIndex((item) => item.id === itemId);

    if (itemIndex > -1) {
      cart[itemIndex].quantity += change;
      if (cart[itemIndex].quantity <= 0) {
        // Якщо кількість стає 0 або менше, видаляємо товар
        cart.splice(itemIndex, 1);
      }
    }
    saveCart(cart); // Зберігаємо і перемальовуємо
  }

  // --- Обробники для основних кнопок кошика ---
  if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
      if (confirm("Ви впевнені, що хочете очистити весь кошик?")) {
        saveCart([]); // Зберігаємо порожній масив
      }
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      alert("Перехід до оформлення замовлення (ця функція не реалізована).");
      // Тут можна додати логіку відправки даних кошика на сервер
    });
  }

  // --- Перший рендеринг кошика при завантаженні сторінки ---
  renderCart();
}); // Кінець DOMContentLoaded
