document.addEventListener("DOMContentLoaded", function () {
  const theme = document.getElementById("theme");
  const newItemInput = document.getElementById("addItem");
  const todoList = document.querySelector(".content ul");
  const itemsLeft = document.querySelector(".items-left span");

  theme.addEventListener("change", () => {
    if (theme.checked) {
      document.body.classList.add("theme-light");
      document.body.classList.remove("theme-dark");
    } else {
      document.body.classList.add("theme-dark");
      document.body.classList.remove("theme-light");
    }
  });

  if (theme.checked) {
    document.body.classList.add("theme-light");
  } else {
    document.body.classList.add("theme-dark");
  }

  document.querySelector(".add-new-item span").addEventListener("click", () => {
    if (newItemInput.value.length > 0) {
      createNewTodoItem(newItemInput.value);
      newItemInput.value = "";
    }
  });

  newItemInput.addEventListener("keypress", (e) => {
    if (e.charCode === 13 && newItemInput.value.length > 0) {
      createNewTodoItem(newItemInput.value);
      newItemInput.value = "";
    }
  });

  function createNewTodoItem(text) {
    const elem = document.createElement("li");
    elem.classList.add("flex-row");

    elem.innerHTML = `
        <label class="list-item">
          <input type="checkbox" name="todoItem">
          <span class="checkmark"></span>
          <span class="text">${text}</span>
        </label>
        <span class="remove"></span>
      `;

    if (
      document.querySelector('.filter input[type="radio"]:checked').id ===
      "completed"
    ) {
      elem.classList.add("hidden");
    }

    todoList.append(elem);
    updateItemsCount(1);
  }

  function updateItemsCount(number) {
    itemsLeft.innerText = +itemsLeft.innerText + number;
  }

  function removeTodoItem(elem) {
    elem.remove();
    updateItemsCount(-1);
  }

  todoList.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove")) {
      removeTodoItem(event.target.parentElement);
    }
  });

  document.querySelector(".clear").addEventListener("click", () => {
    document
      .querySelectorAll('ul li input[type="checkbox"]:checked')
      .forEach((item) => {
        removeTodoItem(item.closest("li"));
      });
  });

  document.querySelectorAll(".filter input").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      filterTodoItems(e.target.id);
    });
  });

  function filterTodoItems(id) {
    const allItems = todoList.querySelectorAll("li");

    switch (id) {
      case "all":
        allItems.forEach((item) => {
          item.classList.remove("hidden");
        });
        break;
      case "active":
        allItems.forEach((item) => {
          if (item.querySelector("input").checked) {
            item.classList.add("hidden");
          } else {
            item.classList.remove("hidden");
          }
        });
        break;
      case "completed":
        allItems.forEach((item) => {
          if (item.querySelector("input").checked) {
            item.classList.remove("hidden");
          } else {
            item.classList.add("hidden");
          }
        });
        break;
      default:
        break;
    }
  }
});
