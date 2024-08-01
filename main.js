document.addEventListener("DOMContentLoaded", function () {
  // Initial setup
  const theme = document.getElementById("theme");
  const newItemInput = document.getElementById("addItem");
  const todoList = document.querySelector(".content ul");
  const itemsLeft = document.querySelector(".items-left span");
  const addNewItemButton = document.querySelector(".add-new-item");
  const clearButton = document.querySelector(".clear");
  const filterRadios = document.querySelectorAll(".filter input");

  const colors = {
    high: "red",
    medium: "#faa80c",
    low: "blue",
    none: "grey"
  };
  const priorities = ["high", "medium", "low", "none"];
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
  function addTask(text, isChecked, priority = "none") {
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

  // Function to get SVG icon
  function getPriorityIcon(priority) {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
      <path d="M220-100v-760h40v80h550.77l-72.31 180 72.31 180H260v320h-40Z" fill="${colors[priority]}"/>
    </svg>`;
  }

  function render() {
    todoList.innerHTML = "";
    tasks.forEach((task, index) => {
      const elem = document.createElement("li");
      elem.classList.add("flex-row");

      elem.innerHTML = `
      <label class="list-item">
        <input type="checkbox" name="todoItem" ${task.isChecked ? "checked" : ""} data-index="${index}">
        <span class="checkmark" style="background-color: ${colors[task.priority]}""></span>
        <span class="text">${task.text}</span>
      </label>
      <button class="edit" data-index="${index}">
         <span class="add">Edit</span>
      </button>
      <span class="remove" data-index="${index}"></span>
      <div class="custom-dropdown">
        <div class="selected-priority">${getPriorityIcon(task.priority)} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</div>
        <div class="dropdown-options hidden">
          ${priorities.map(priority => `
            <div class="dropdown-option" data-value="${priority}">
              ${getPriorityIcon(priority)} ${priority.charAt(0).toUpperCase() + priority.slice(1)}
            </div>
          `).join('')}
        </div>
      </div>
    `;

      todoList.appendChild(elem);

      elem.querySelector(".remove").addEventListener("click", (event) => {
        removeTask(event.target.dataset.index);
      });

      elem.querySelector(".edit").addEventListener("click", (event) => {
        editTask(+event.target.dataset.index);
      });

      elem.querySelector(".selected-priority").addEventListener("click", () => {
        const options = elem.querySelector(".dropdown-options");
        options.classList.toggle("hidden");
      });

      elem.querySelectorAll(".dropdown-option").forEach(option => {
        option.addEventListener("click", (event) => {
          const selectedValue = event.currentTarget.dataset.value;
          tasks[index].priority = selectedValue;

          const selectedPriorityDiv = elem.querySelector(".selected-priority");
          selectedPriorityDiv.innerHTML = `${getPriorityIcon(selectedValue)} ${selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1)}`;
          elem.querySelector(".checkmark").style.backgroundColor = `${colors[selectedValue]}`;
          saveTasks();
          render();
        });
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
