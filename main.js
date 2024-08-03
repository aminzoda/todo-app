document.addEventListener("DOMContentLoaded", function () {
  // Initial setup
  const theme = document.getElementById("theme");
  const newItemInput = document.getElementById("addItem");
  const todoList = document.querySelector(".content ul");
  const itemsLeft = document.querySelector(".items-left span");
  const addNewItemButton = document.querySelector(".add-new-item");
  const clearButton = document.querySelector(".clear");
  const filterRadios = document.querySelectorAll(".filter input");
  const searchInput = document.getElementById("search");

  const colors = {
    high: "red",
    medium: "#faa80c",
    low: "blue",
    none: "grey"
  };
  const priorities = ["high", "medium", "low", "none"];
  let tasks = [];
  let openDropdown = null;

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
    const task = tasks[index];
    if (!task) {
      return;
    }
    const newText = prompt("Edit task", task.text);
    if (newText !== null) {
      task.text = newText;
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
    const searchTerm = searchInput.value.toLowerCase();

    tasks.forEach((task, index) => {
      if (!task.text.toLowerCase().includes(searchTerm)) {
        return;
      }

      const elem = document.createElement("li");
      elem.classList.add("flex-row");

      elem.innerHTML = `
            <label class="list-item">
                <input type="checkbox" name="todoItem" ${task.isChecked ? "checked" : ""} data-index="${index}">
                <span class="checkmark" style="background-color: ${colors[task.priority]}"></span>
                <span class="text">${task.text}</span>
            </label>
            <div class="tooltip">
                <button class="edit" data-index="${index}">
                    <span class="tooltip-text">Edit task</span>
                    <img src="images/pen.png" alt="" class="img">
                </button>
            </div>
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
        event.stopPropagation();
        removeTask(event.target.dataset.index);
      });

      elem.querySelector(".edit").addEventListener("click", (event) => {
        const index = parseInt(event.target.closest("li").querySelector("input[type='checkbox']").dataset.index);
        editTask(index);
      });

      elem.querySelector(".selected-priority").addEventListener("click", (event) => {
        const options = elem.querySelector(".dropdown-options");

        // Close the previously open dropdown if it exists
        if (openDropdown && openDropdown !== options) {
          openDropdown.classList.add("hidden");
        }

        // Toggle the current dropdown
        options.classList.toggle("hidden");

        // Update the reference to the currently open dropdown
        openDropdown = options.classList.contains("hidden") ? null : options;

        event.stopPropagation();
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

    // Close custom dropdown when clicking outside
    document.addEventListener("click", (event) => {
      const isDropdown = event.target.closest(".custom-dropdown");
      if (!isDropdown && openDropdown) {
        openDropdown.classList.add("hidden");
        openDropdown = null;
      }
    });

    searchInput.addEventListener("input", render);
  }

  // Initialize the application
  init();
});
