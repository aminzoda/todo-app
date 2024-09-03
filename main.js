// Initialize the application when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    theme: document.getElementById("theme"),
    newItemInput: document.getElementById("addItem"),
    todoList: document.querySelector(".content ul"),
    itemsLeft: document.querySelector(".items-left span"),
    addNewItemButton: document.querySelector(".add-new-item"),
    clearButton: document.querySelector(".clear"),
    filterRadios: document.querySelectorAll(".filter input"),
    searchInput: document.getElementById("search"),
  };

  const store = new Store();
  const component = new Component(store, elements);

  component.bindEvents();
  store.loadTasks();
});

// Store class to manage tasks and state
class Store {
  constructor() {
    this.state = {
      tasks: [],
      filter: 'all',
      searchTerm: '',
      theme: localStorage.getItem('theme') || 'dark',
    };
  }

  getState() {
    return this.state;
  }

  updateState(key, value) {
    this.state[key] = value;
    this.notify();
  }

  addTask(text, isChecked = false, priority = 'none') {
    this.state.tasks.push({ text, isChecked, priority });
    this.saveTasks();
    this.notify();
  }

  removeTask(index) {
    this.state.tasks.splice(index, 1);
    this.saveTasks();
    this.notify();
  }

  editTask(index, newText) {
    if (newText) {
      this.state.tasks[index].text = newText;
      this.saveTasks();
      this.notify();
    }
  }

  toggleTask(index) {
    this.state.tasks[index].isChecked = !this.state.tasks[index].isChecked;
    this.saveTasks();
    this.notify();
  }

  clearCompletedTasks() {
    this.state.tasks = this.state.tasks.filter(task => !task.isChecked);
    this.saveTasks();
    this.notify();
  }

  loadTasks() {
    this.state.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.notify();
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.state.tasks));
  }

  notify() {
    if (this.listener) this.listener();
  }

  subscribe(listener) {
    this.listener = listener;
  }
}

// Component class to handle UI rendering and event binding
class Component {
  constructor(store, elements) {
    this.store = store;
    this.elements = elements;

    this.store.subscribe(() => this.render());
  }

  bindEvents() {
    const { theme, addNewItemButton, newItemInput, clearButton, filterRadios, searchInput } = this.elements;

    theme.addEventListener('change', () => {
      const themeValue = theme.checked ? 'light' : 'dark';
      this.store.updateState('theme', themeValue);
    });

    addNewItemButton.addEventListener('click', () => {
      if (newItemInput.value.trim()) {
        this.store.addTask(newItemInput.value.trim());
        newItemInput.value = '';
      }
    });

    newItemInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' && newItemInput.value.trim()) {
        this.store.addTask(newItemInput.value.trim());
        newItemInput.value = '';
      }
    });

    clearButton.addEventListener('click', () => this.store.clearCompletedTasks());

    filterRadios.forEach(radio => {
      radio.addEventListener('change', (e) => this.store.updateState('filter', e.target.id));
    });

    searchInput.addEventListener('input', (e) => {
      this.store.updateState('searchTerm', e.target.value.toLowerCase());
    });
  }

  render() {
    const { todoList, itemsLeft } = this.elements;
    const { tasks, filter, searchTerm, theme } = this.store.getState();
    const colors = { high: "red", medium: "#faa80c", low: "blue", none: "grey" };
    const priorities = ["high", "medium", "low", "none"];

    document.body.className = theme === 'light' ? 'theme-light' : 'theme-dark';
    todoList.innerHTML = '';
    let itemsLeftCount = 0;

    tasks.forEach((task, index) => {
      if (task.text.toLowerCase().includes(searchTerm)) {
        const taskElem = document.createElement('li');
        taskElem.classList.add('flex-row');

        taskElem.innerHTML = `
          <label class="list-item">
            <input type="checkbox" ${task.isChecked ? "checked" : ""} data-index="${index}">
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
            <div class="selected-priority">${this.getPriorityIcon(task.priority, colors)} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</div>
            <div class="dropdown-options hidden">
              ${priorities.map(priority => `
                <div class="dropdown-option" data-value="${priority}">
                  ${this.getPriorityIcon(priority, colors)} ${priority.charAt(0).toUpperCase() + priority.slice(1)}
                </div>`).join('')}
            </div>
          </div>
        `;

        todoList.appendChild(taskElem);

        taskElem.querySelector('.remove').addEventListener('click', () => this.store.removeTask(index));
        taskElem.querySelector('.edit').addEventListener('click', () => {
          const newText = prompt('Edit task', task.text);
          if (newText !== null) {
            this.store.editTask(index, newText);
          }
        });
        taskElem.querySelector('input[type="checkbox"]').addEventListener('change', () => {
          this.store.toggleTask(index);
        });

        if ((filter === 'completed' && !task.isChecked) || (filter === 'active' && task.isChecked)) {
          taskElem.classList.add('hidden');
        }

        if (!task.isChecked) itemsLeftCount++;

        const selectedPriorityDiv = taskElem.querySelector(".selected-priority");
        selectedPriorityDiv.addEventListener("click", (event) => {
          const options = taskElem.querySelector(".dropdown-options");
          options.classList.toggle("hidden");
          event.stopPropagation();
        });

        taskElem.querySelectorAll(".dropdown-option").forEach(option => {
          option.addEventListener("click", (event) => {
            const selectedValue = event.currentTarget.dataset.value;
            this.store.state.tasks[index].priority = selectedValue;
            selectedPriorityDiv.innerHTML = `${this.getPriorityIcon(selectedValue, colors)} ${selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1)}`;
            taskElem.querySelector(".checkmark").style.backgroundColor = `${colors[selectedValue]}`;
            this.store.saveTasks();
            this.store.notify();
          });
        });
      }
    });

    itemsLeft.innerText = itemsLeftCount;
  }

  getPriorityIcon(priority, colors) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
          <path d="M220-100v-760h40v80h550.77l-72.31 180 72.31 180H260v320h-40Z" fill="${colors[priority]}"/>
      </svg>`;
  }
}
