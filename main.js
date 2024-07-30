document.addEventListener("DOMContentLoaded", function () {
  const theme = document.getElementById("theme");
  const newItemInput = document.getElementById("addItem");
  const todoList = document.querySelector(".content ul");
  const itemsLeft = document.querySelector(".items-left span");
  const addNewItemButton = document.querySelector(".add-new-item");
  const clearButton = document.querySelector(".clear");
  const filterRadios = document.querySelectorAll(".filter input");

  let tasks = [];
  // Change theme based
  theme.addEventListener("change", () => {
    if (theme.checked) {
      document.body.classList.add("theme-light");
      document.body.classList.remove("theme-dark");
    } else {
      document.body.classList.add("theme-dark");
      document.body.classList.remove("theme-light");
    }
  });

  // Apply initial theme
  if (theme.checked) {
    document.body.classList.add("theme-light");
  } else {
    document.body.classList.add("theme-dark");
  }

  // Add new task
  addNewItemButton.addEventListener("click", () => {
    if (newItemInput.value.length > 0) {
      addTask(newItemInput.value, false);
      newItemInput.value = "";
    }
  });

  // Add new task on Enter key press
  newItemInput.addEventListener("keypress", (event) => {
    if (event.charCode === 13 && newItemInput.value.length > 0) {
      addTask(newItemInput.value, false);
      newItemInput.value = "";
    }
  });

  function addTask(text, isChecked) {
    const task = { text, isChecked };
    tasks.push(task);
    createNewTodoItem();
    saveTasks();
  }

  function createNewTodoItem() {
    todoList.innerHTML = "";
    tasks.forEach((task, index) => {
      const elem = document.createElement("li");
      elem.classList.add("flex-row");

      elem.innerHTML = `
          <label class="list-item">
            <input type="checkbox" name="todoItem" ${
              task.isChecked ? "checked" : ""
            } data-index="${index}">
            <span class="checkmark"></span>
            <span class="text">${task.text}</span>
            </label>
            <button class="edit" data-index="${index}">Edit</button>
          <span class="remove" data-index="${index}"></span>
        `;

      if (
        document.querySelector('.filter input[type="radio"]:checked').id ===
          "completed" &&
        !task.isChecked
      ) {
        elem.classList.add("hidden");
      } else if (
        document.querySelector('.filter input[type="radio"]:checked').id ===
          "active" &&
        task.isChecked
      ) {
        elem.classList.add("hidden");
      }

      todoList.append(elem);

      elem.querySelector(".remove").addEventListener("click", (event) => {
        const index = event.target.dataset.index;
        removeTask(index);
      });
      elem.querySelector(".edit").addEventListener("click", (event) => {
        const index = event.target.dataset.index;
        editTask(index);
      });
    });
    itemsLeft.innerText = tasks.filter((task) => !task.isChecked).length;
  }

  // Remove a to-do item
  function removeTask(index) {
    tasks.splice(index, 1);
    createNewTodoItem();
    saveTasks();
  }

  // Save tasks when any change occurs in the task list
  todoList.addEventListener("change", saveTasks);

  // Clear completed tasks
  clearButton.addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.isChecked);
    createNewTodoItem();
    saveTasks();
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

  // Edit a to-do item
  function editTask(index) {
    const newText = prompt("Edit task", tasks[index].text);
    if (newText !== null) {
      tasks[index].text = newText;
      createNewTodoItem();
      saveTasks();
    }
  }

  // Save tasks to localStorage
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Load tasks from localStorage
  function loadTasks() {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    createNewTodoItem();
  }

  // Load stored tasks from localStorage
  loadTasks();

  // Changes in checkbox todo list
  todoList.addEventListener("change", (event) => {
    const index = event.target.dataset.index;
    tasks[index].isChecked = event.target.checked;
    createNewTodoItem();
    saveTasks();
  });

  // Filter tasks
  filterRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      filterTodoItems(e.target.id);
    });
  });
});
