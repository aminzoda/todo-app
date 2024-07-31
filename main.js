document.addEventListener("DOMContentLoaded", function () {
  // Initial setup
  const theme = document.getElementById("theme");
  const newItemInput = document.getElementById("addItem");
  const todoList = document.querySelector(".content ul");
  const itemsLeft = document.querySelector(".items-left span");
  const addNewItemButton = document.querySelector(".add-new-item");
  const clearButton = document.querySelector(".clear");
  const filterRadios = document.querySelectorAll(".filter input");

  const priorities = ["low", "medium", "high"];
  let tasks = [];

  // Initialize application state
  function init() {
    applyInitialTheme();
    loadTasks();
    bindEvents();
  }

  // Theme functions
  function applyInitialTheme() {
    if (theme.checked) {
      document.body.classList.add("theme-light");
      document.body.classList.remove("theme-dark");
    } else {
      document.body.classList.add("theme-dark");
      document.body.classList.remove("theme-light");
    }
  }

  function toggleTheme() {
    if (theme.checked) {
      document.body.classList.add("theme-light");
      document.body.classList.remove("theme-dark");
    } else {
      document.body.classList.add("theme-dark");
      document.body.classList.remove("theme-light");
    }
  }

  // Task functions
  function addTask(text, isChecked, priority = "low") {
    const task = { text, isChecked, priority };
    tasks.push(task);
    render();
    saveTasks();
  }

  function removeTask(index) {
    tasks.splice(index, 1);
    render();
    saveTasks();
  }

  function editTask(index) {
    const newText = prompt("Edit task", tasks[index].text);
    if (newText !== null) {
      tasks[index].text = newText;
      render();
      saveTasks();
    }
  }

  function clearCompletedTasks() {
    tasks = tasks.filter((task) => !task.isChecked);
    render();
    saveTasks();
  }

  function loadTasks() {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    render();
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Generate option
  function generatePriorityOptions(selectedPriority) {
    return priorities
        .map(
            (priority) =>
                `<option value="${priority}" ${
                    priority === selectedPriority ? "selected" : ""
                }>${priority.charAt(0).toUpperCase() + priority.slice(1)}</option>`
        )
        .join("");
  }

  function render() {
    todoList.innerHTML = "";
    tasks.forEach((task, index) => {
      const elem = document.createElement("li");
      elem.classList.add("flex-row");
      const priorityClass = `priority-${task.priority}`;

      elem.innerHTML = `
      <label class="list-item ${priorityClass}">
        <input type="checkbox" name="todoItem" ${task.isChecked ? "checked" : ""} data-index="${index}">
        <span class="checkmark"></span>
        <span class="text">${task.text}</span>
      </label>
      <button class="edit" data-index="${index}">Edit</button>
      <span class="remove" data-index="${index}"></span>
      <select class="priority ${priorityClass}">
        ${generatePriorityOptions(task.priority)}
      </select>
    `;

      todoList.appendChild(elem);

      elem.querySelector(".remove").addEventListener("click", (event) => {
        removeTask(event.target.dataset.index);
      });

      elem.querySelector(".edit").addEventListener("click", (event) => {
        editTask(event.target.dataset.index);
      });

      elem.querySelector(".priority").addEventListener("change", (event) => {
        tasks[index].priority = event.target.value;
        saveTasks();
        render();
      });

      elem.querySelector("input[type='checkbox']").addEventListener("change", (event) => {
        tasks[index].isChecked = event.target.checked;
        saveTasks();
        render();
      });

      filterTasks(elem, task);
    });
    itemsLeft.innerText = tasks.filter((task) => !task.isChecked).length;
  }


  function filterTasks(elem, task) {
    const filterId = document.querySelector('.filter input[type="radio"]:checked').id;

    if (filterId === "completed" && !task.isChecked) {
      elem.classList.add("hidden");
    } else if (filterId === "active" && task.isChecked) {
      elem.classList.add("hidden");
    }
  }

  function filterTodoItems(id) {
    const allItems = todoList.querySelectorAll("li");

    switch (id) {
      case "all":
        allItems.forEach((item) => item.classList.remove("hidden"));
        break;
      case "active":
        allItems.forEach((item) => {
          item.querySelector("input").checked
              ? item.classList.add("hidden")
              : item.classList.remove("hidden");
        });
        break;
      case "completed":
        allItems.forEach((item) => {
          item.querySelector("input").checked
              ? item.classList.remove("hidden")
              : item.classList.add("hidden");
        });
        break;
      default:
        break;
    }
  }

  // Event binding functions
  function bindEvents() {
    theme.addEventListener("change", toggleTheme);

    addNewItemButton.addEventListener("click", () => {
      if (newItemInput.value.length > 0) {
        addTask(newItemInput.value, false);
        newItemInput.value = "";
      }
    });

    newItemInput.addEventListener("keypress", (event) => {
      if (event.key === 'Enter' && newItemInput.value.length > 0) {
        addTask(newItemInput.value, false);
        newItemInput.value = "";
      }
    });

    clearButton.addEventListener("click", clearCompletedTasks);

    filterRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        filterTodoItems(e.target.id);
      });
    });
  }

  // Initialize the application
  init();
});
