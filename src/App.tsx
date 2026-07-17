import { FormEvent, useEffect, useMemo, useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

type Filter = 'all' | 'active' | 'completed';

const STORAGE_KEY = 'task-tracker.tasks';

const filters: Filter[] = ['all', 'active', 'completed'];

function loadTasks(): Task[] {
  const storedTasks = localStorage.getItem(STORAGE_KEY);

  if (!storedTasks) {
    return [];
  }

  try {
    const parsedTasks: unknown = JSON.parse(storedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks.filter(isTask);
  } catch {
    return [];
  }
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const task = value as Partial<Task>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean'
  );
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === 'active') {
      return tasks.filter((task) => !task.completed);
    }

    if (filter === 'completed') {
      return tasks.filter((task) => task.completed);
    }

    return tasks;
  }, [filter, tasks]);

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - activeCount;

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newTaskTitle.trim();

    if (!title) {
      return;
    }

    setTasks((currentTasks) => [
      {
        id: crypto.randomUUID(),
        title,
        completed: false,
      },
      ...currentTasks,
    ]);
    setNewTaskTitle('');
  }

  function toggleTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(taskId: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  return (
    <main className="app-shell">
      <section className="tracker" aria-labelledby="page-title">
        <header className="tracker__header">
          <div>
            <p className="eyebrow">Single-page tracker</p>
            <h1 id="page-title">Tasks</h1>
          </div>
          <div className="task-count" aria-label={`${activeCount} active tasks`}>
            {activeCount} active
          </div>
        </header>

        <form className="task-form" onSubmit={addTask}>
          <label className="sr-only" htmlFor="task-title">
            New task
          </label>
          <input
            id="task-title"
            type="text"
            value={newTaskTitle}
            onChange={(event) => setNewTaskTitle(event.target.value)}
            placeholder="Add a task..."
            autoComplete="off"
          />
          <button type="submit">Add</button>
        </form>

        <div className="filters" aria-label="Task filters">
          {filters.map((filterName) => (
            <button
              key={filterName}
              type="button"
              className={filter === filterName ? 'is-active' : ''}
              onClick={() => setFilter(filterName)}
            >
              {filterName}
            </button>
          ))}
        </div>

        <ul className="task-list" aria-label="Task list">
          {filteredTasks.map((task) => (
            <li key={task.id} className={task.completed ? 'task is-complete' : 'task'}>
              <label>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span>{task.title}</span>
              </label>
              <button type="button" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>
                Delete
              </button>
            </li>
          ))}
        </ul>

        {filteredTasks.length === 0 && (
          <p className="empty-state">
            {tasks.length === 0 ? 'No tasks yet.' : `No ${filter} tasks.`}
          </p>
        )}

        {tasks.length > 0 && (
          <footer className="tracker__footer">
            <span>{tasks.length} total</span>
            <span>{completedCount} completed</span>
          </footer>
        )}
      </section>
    </main>
  );
}

export default App;
