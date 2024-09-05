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

class Store {
  constructor() {
    this.state = {
      tasks: [],
      filter: 'all',
      searchTerm: '',
      theme: localStorage.getItem('theme') || 'dark',
    };

    // Proxy handler for the whole state
    const handler = {
      set: (target, property, value) => {
        target[property] = value;
        this.notify();
        return true;
      }
    };

    // Create a Proxy for the state
    this.proxyState = new Proxy(this.state, handler);

    // Create a Proxy for the tasks array separately
    this.proxyTasks = new Proxy(this.state.tasks, {
      set: (target, property, value) => {
        target[property] = value;
        this.saveTasks();
        this.notify(); // Trigger re-render when tasks change
        return true;
      }
    });
  }

  getState() {
    return this.proxyState;
  }

  updateState(key, value) {
    this.proxyState[key] = value;
  }

  addTask(text, isChecked = false, priority = 'none') {
    this.proxyTasks.push({ text, isChecked, priority }); // Use proxyTasks to trigger reactivity
  }

  removeTask(index) {
    this.proxyTasks.splice(index, 1); // Use proxyTasks
  }

  editTask(index, newText) {
    if (newText) {
      this.proxyTasks[index].text = newText; // Use proxyTasks
    }
  }

  toggleTask(index) {
    this.proxyTasks[index].isChecked = !this.proxyTasks[index].isChecked; // Use proxyTasks
    this.saveTasks();
    this.notify();
  }

  clearCompletedTasks() {
    this.proxyState.tasks = this.proxyState.tasks.filter(task => !task.isChecked); // Proxy should catch this
    this.saveTasks();
  }

  loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => this.proxyTasks.push(task)); // Load tasks through proxy to maintain reactivity
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.proxyTasks)); // Save proxyTasks
  }

  notify() {
    if (this.listener) this.listener();
  }

  subscribe(listener) {
    this.listener = listener;
  }
}

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
    const colors = { high: "red", medium: "orange", low: "blue", none: "grey" };
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

            // Update the state properly using updateState
            this.store.updateState('tasks', this.store.getState().tasks.map((task, taskIndex) => {
              if (taskIndex === index) {
                task.priority = selectedValue;  // Update the priority
              }
              return task;
            }));

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
