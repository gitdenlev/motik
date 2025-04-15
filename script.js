document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// Код для script.js (для сторінки з товарами MOTOTEK)

document.addEventListener("DOMContentLoaded", () => {
  // Знаходимо елементи: кнопки, лічильник, контейнер кошика
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn"); // Використовуємо новий клас
  const cartCountElement = document.getElementById("cart-count");
  const cartContainer = document.getElementById("cart-container");

  // --- Функції для роботи з localStorage ---
  function getCart() {
    const cartData = localStorage.getItem("shoppingCartMototek"); // Використовуємо інший ключ, щоб не змішувати з попереднім прикладом
    try {
      if (cartData && cartData.trim() !== "") {
        const parsedData = JSON.parse(cartData);
        return Array.isArray(parsedData) ? parsedData : [];
      }
    } catch (e) {
      console.error("Помилка розбору кошика MOTOTEK з localStorage:", e);
    }
    return [];
  }

  function saveCart(cart) {
    try {
      localStorage.setItem("shoppingCartMototek", JSON.stringify(cart));
      updateCartCounter();
    } catch (e) {
      console.error("Помилка збереження кошика MOTOTEK у localStorage:", e);
      alert("Не вдалося зберегти кошик.");
    }
  }

  function addItemToCart(item) {
    let cart = getCart();
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
      console.log(
        `Кількість товару "${item.name}" збільшено до ${cart[existingItemIndex].quantity}.`
      );
    } else {
      item.quantity = 1;
      cart.push(item);
      console.log(`Товар "${item.name}" додано до кошика.`);
    }
    saveCart(cart);
  }

  // --- Функція оновлення лічильника в хедері ---
  function updateCartCounter() {
    const cart = getCart();
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cartCountElement) {
      cartCountElement.textContent = totalQuantity;
    }
    if (cartContainer) {
      if (totalQuantity > 0) {
        cartContainer.classList.add("has-items");
      } else {
        cartContainer.classList.remove("has-items");
      }
    }
  }

  // --- Додавання обробників подій до кнопок "Додати в кошик" ---
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      // event.preventDefault(); // Розкоментуйте, якщо замість <button> використовуєте <a>

      const buttonElement = event.target;
      const productCard = buttonElement.closest(".card"); // Знаходимо батьківську картку '.card'

      if (!productCard) {
        console.error(
          "Не вдалося знайти картку товару (.card) для кнопки:",
          buttonElement
        );
        return;
      }

      // Отримуємо дані товару з картки
      const productId = buttonElement.dataset.id;
      const productNameElement = productCard.querySelector("h3"); // Назва в H3
      const productPriceElement = productCard.querySelector("p.price"); // Ціна в <p class="price">
      const productImageElement = productCard.querySelector("img"); // Зображення

      if (
        !productId ||
        !productNameElement ||
        !productPriceElement ||
        !productImageElement
      ) {
        console.error(
          "Не вдалося знайти всі дані (ID, назву, ціну або зображення) для товару:",
          productCard
        );
        return;
      }

      const productName = productNameElement.textContent.trim();
      const priceString = productPriceElement.textContent
        .replace(/[^0-9.,]/g, "")
        .replace(",", ".");
      const productPrice = parseFloat(priceString);
      const productImageSrc = productImageElement.src; // Отримуємо абсолютний шлях або відносний, якщо він був змінений

      if (isNaN(productPrice)) {
        console.error(
          "Не вдалося перетворити ціну на число:",
          productPriceElement.textContent
        );
        return;
      }

      const itemToAdd = {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImageSrc,
      };

      addItemToCart(itemToAdd);

      // Візуальний відгук
      buttonElement.textContent = "Додано!";
      buttonElement.disabled = true;
      setTimeout(() => {
        buttonElement.textContent = "Додати в кошик";
        buttonElement.disabled = false;
      }, 1500);
    });
  });

  // --- Ініціалізація лічильника при завантаженні сторінки ---
  updateCartCounter();
});
