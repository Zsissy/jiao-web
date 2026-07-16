(() => {
  "use strict";

  const config = window.JIAO_SHARED_CONFIG || {};
  const sessionKeys = {
    access: "jiaoSharedAccessToken",
    refresh: "jiaoSharedRefreshToken",
    expires: "jiaoSharedExpiresAt",
    editor: "jiaoSharedEditor",
  };
  const state = {
    configured: Boolean(config.url && config.anonKey),
    fallback: new Map(),
    plans: new Map(),
    todos: new Map(),
    currentPlanKey: null,
    dirty: false,
    pendingRemote: null,
    syncing: false,
  };

  const $ = (selector) => document.querySelector(selector);
  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function session() {
    const accessToken = sessionStorage.getItem(sessionKeys.access);
    const editor = sessionStorage.getItem(sessionKeys.editor);
    return accessToken && editor ? { accessToken, editor } : null;
  }

  function clearSession(message = "已退出编辑模式") {
    Object.values(sessionKeys).forEach((key) => sessionStorage.removeItem(key));
    updateAuthUi();
    setSyncStatus(message);
    if (state.currentPlanKey) renderDialog(state.currentPlanKey);
  }

  function setSyncStatus(message, tone = "") {
    const node = $("#sharedSyncStatus");
    if (!node) return;
    node.textContent = message;
    node.dataset.tone = tone;
  }

  function showDialogMessage(message, tone = "info", actions = "") {
    const node = $("#sharedDialogMessage");
    if (!node) return;
    node.hidden = !message;
    node.dataset.tone = tone;
    node.innerHTML = message ? `<span>${escapeHtml(message)}</span>${actions}` : "";
  }

  function updateAuthUi() {
    const active = session();
    const login = $("#sharedLoginButton");
    const logout = $("#sharedLogoutButton");
    const badge = $("#sharedEditorBadge");
    if (!login || !logout || !badge) return;
    login.hidden = Boolean(active);
    logout.hidden = !active;
    badge.hidden = !active;
    badge.textContent = active ? `${active.editor} 正在编辑` : "";
  }

  function formatUpdated(value, editor) {
    if (!value) return "静态备用内容";
    const date = new Date(value);
    const time = Number.isNaN(date.getTime())
      ? "刚刚"
      : new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
    return `${editor || "共同"} 最后编辑 · ${time}`;
  }

  function buildFallback(data) {
    const plans = [];
    (data.workspaceItems || []).forEach((item, sortOrder) => {
      plans.push({
        plan_key: item.key,
        section: "workspace",
        eyebrow: `${item.category || ""} · ${item.date || ""}`,
        title: item.title || "计划",
        summary: item.body || "",
        detail: item.detail || item.body || "",
        image_url: "",
        sort_order: sortOrder,
        version: 1,
        last_editor: null,
        updated_at: null,
        todos: (item.todos || []).map((text, index) => ({
          todo_key: `fallback-${item.key}-${index}`,
          plan_key: item.key,
          text,
          completed: false,
          sort_order: index,
          version: 1,
          last_editor: null,
          updated_at: null,
        })),
      });
    });
    (data.love?.wishes || []).forEach((item, sortOrder) => {
      plans.push({
        plan_key: item.key,
        section: "love",
        eyebrow: item.status || "想完成",
        title: item.title || "共同愿望",
        summary: item.body || "",
        detail: item.detail || item.body || "",
        image_url: item.image || "",
        sort_order: sortOrder,
        version: 1,
        last_editor: null,
        updated_at: null,
        todos: (item.todos || []).map((text, index) => ({
          todo_key: `fallback-${item.key}-${index}`,
          plan_key: item.key,
          text,
          completed: false,
          sort_order: index,
          version: 1,
          last_editor: null,
          updated_at: null,
        })),
      });
    });
    state.fallback = new Map(plans.map((plan) => [plan.plan_key, plan]));
    useFallback();
  }

  function useFallback() {
    state.plans = new Map();
    state.todos = new Map();
    state.fallback.forEach((plan, key) => {
      const { todos, ...record } = plan;
      state.plans.set(key, { ...record });
      state.todos.set(key, todos.map((todo) => ({ ...todo })));
    });
    renderCards();
  }

  function apiHeaders(write = false) {
    const active = session();
    const headers = {
      apikey: config.anonKey,
      Authorization: `Bearer ${active?.accessToken || config.anonKey}`,
    };
    if (write) {
      headers["Content-Type"] = "application/json";
      headers.Prefer = "return=representation";
    }
    return headers;
  }

  async function request(path, options = {}) {
    const response = await fetch(`${String(config.url).replace(/\/$/, "")}${path}`, options);
    if (response.status === 401 || response.status === 403) {
      clearSession("编辑会话已过期，请重新登录");
      throw new Error("登录已过期");
    }
    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `请求失败（${response.status}）`);
    }
    if (response.status === 204) return [];
    const text = await response.text();
    return text ? JSON.parse(text) : [];
  }

  async function ensureFreshSession() {
    const expiresAt = Number(sessionStorage.getItem(sessionKeys.expires) || 0);
    const refreshToken = sessionStorage.getItem(sessionKeys.refresh);
    if (!session() || !refreshToken || Date.now() < expiresAt - 60000) return;
    const response = await fetch(`${String(config.url).replace(/\/$/, "")}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: config.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) {
      clearSession("编辑会话已过期，请重新登录");
      return;
    }
    saveAuthSession(await response.json(), sessionStorage.getItem(sessionKeys.editor));
  }

  function saveAuthSession(payload, editor) {
    sessionStorage.setItem(sessionKeys.access, payload.access_token);
    sessionStorage.setItem(sessionKeys.refresh, payload.refresh_token);
    sessionStorage.setItem(sessionKeys.expires, String(Date.now() + Number(payload.expires_in || 3600) * 1000));
    sessionStorage.setItem(sessionKeys.editor, editor);
    updateAuthUi();
  }

  async function loadCloud({ quiet = false } = {}) {
    if (!state.configured || state.syncing) return;
    state.syncing = true;
    try {
      await ensureFreshSession();
      const [plans, todos] = await Promise.all([
        request("/rest/v1/shared_plans?select=*&order=section.asc,sort_order.asc", { headers: apiHeaders() }),
        request("/rest/v1/shared_todos?select=*&order=plan_key.asc,sort_order.asc", { headers: apiHeaders() }),
      ]);
      const nextPlans = new Map(plans.map((plan) => {
        const fallback = state.fallback.get(plan.plan_key);
        return [plan.plan_key, { ...plan, image_url: plan.image_url || fallback?.image_url || "" }];
      }));
      const nextTodos = new Map();
      todos.forEach((todo) => {
        if (!nextTodos.has(todo.plan_key)) nextTodos.set(todo.plan_key, []);
        nextTodos.get(todo.plan_key).push(todo);
      });

      if (state.currentPlanKey && state.dirty) {
        const current = state.plans.get(state.currentPlanKey);
        const remote = nextPlans.get(state.currentPlanKey);
        if (current && remote && Number(remote.version) > Number(current.version)) {
          state.pendingRemote = { plan: remote, todos: nextTodos.get(state.currentPlanKey) || [] };
          showConflict("对方刚刚修改了这份计划。你的草稿还在，请选择如何处理。");
        }
      }

      state.plans = nextPlans;
      state.todos = nextTodos;
      renderCards();
      if (state.currentPlanKey && !state.dirty) renderDialog(state.currentPlanKey);
      if (!quiet) setSyncStatus(session() ? `${session().editor} 编辑模式 · 已同步` : "访客只读 · 已同步");
    } catch (error) {
      if (!quiet) setSyncStatus("云端暂时不可用，正在显示静态备用内容", "error");
      if (!state.plans.size) useFallback();
      console.warn("Shared plans unavailable", error);
    } finally {
      state.syncing = false;
    }
  }

  function renderCards() {
    state.plans.forEach((plan) => {
      const card = document.querySelector(`[data-plan-key="${CSS.escape(plan.plan_key)}"]`);
      if (!card) return;
      const meta = card.querySelector(":scope > span");
      const heading = card.querySelector("h2, h3");
      const summary = card.querySelector(":scope > p");
      if (meta) meta.textContent = plan.eyebrow || (plan.section === "love" ? "想完成" : "共同计划");
      if (heading) {
        const image = heading.querySelector("img");
        heading.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) node.remove();
        });
        heading.prepend(document.createTextNode(`${plan.title} `));
        if (!image && plan.image_url) heading.insertAdjacentHTML("beforeend", `<img src="${escapeHtml(plan.image_url)}" alt="wish sticker" />`);
      }
      if (summary) summary.textContent = plan.summary;
      card.dataset.sharedReady = "true";
    });
  }

  function sortedTodos(key) {
    return [...(state.todos.get(key) || [])].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  }

  function renderDialog(key) {
    const plan = state.plans.get(key) || state.fallback.get(key);
    if (!plan) return;
    const editable = Boolean(session() && state.configured);
    state.currentPlanKey = key;
    $("#workspaceDialogMeta").textContent = plan.eyebrow || (plan.section === "love" ? "共同愿望" : "共同计划");
    $("#workspaceDialogTitle").textContent = plan.title;
    $("#workspaceDialogSummary").textContent = plan.summary || "";
    $("#workspaceDialogDetail").textContent = plan.detail || plan.summary || "";
    $("#sharedPlanUpdated").textContent = formatUpdated(plan.updated_at, plan.last_editor);
    $("#sharedEditPlanButton").hidden = !editable;
    $("#sharedAddTodoForm").hidden = !editable;
    $("#sharedPlanView").hidden = false;
    $("#sharedPlanForm").hidden = true;
    showDialogMessage(state.configured ? "" : "共享云端尚未配置，当前展示静态备用内容。", "info");

    const todos = sortedTodos(key);
    $("#workspaceTodoProgress").textContent = `${todos.filter((todo) => todo.completed).length} / ${todos.length}`;
    $("#workspaceTodos").innerHTML = todos.length ? todos.map((todo, index) => `
      <div class="todo-item ${todo.completed ? "is-complete" : ""}" data-todo-key="${escapeHtml(todo.todo_key)}">
        <input type="checkbox" aria-label="标记${escapeHtml(todo.text)}" ${todo.completed ? "checked" : ""} ${editable ? "" : "disabled"} />
        <input class="todo-text-input" value="${escapeHtml(todo.text)}" maxlength="160" aria-label="待办内容" ${editable ? "" : "readonly"} />
        ${editable ? `<div class="todo-actions">
          <button type="button" data-action="save-todo" title="保存文字" aria-label="保存待办文字">✓</button>
          <button type="button" data-action="move-up" title="上移" aria-label="上移" ${index === 0 ? "disabled" : ""}>↑</button>
          <button type="button" data-action="move-down" title="下移" aria-label="下移" ${index === todos.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" data-action="delete-todo" title="删除" aria-label="删除待办">×</button>
        </div>` : ""}
      </div>`).join("") : `<p class="todo-empty">这份计划还没有添加待办事项。</p>`;
  }

  function openPlan(key) {
    state.dirty = false;
    state.pendingRemote = null;
    renderDialog(key);
    const dialog = $("#workspaceDialog");
    if (dialog && !dialog.open) dialog.showModal();
  }

  function startPlanEdit() {
    const plan = state.plans.get(state.currentPlanKey);
    if (!plan || !session()) return;
    $("#sharedPlanTitleInput").value = plan.title;
    $("#sharedPlanSummaryInput").value = plan.summary || "";
    $("#sharedPlanDetailInput").value = plan.detail || "";
    $("#sharedPlanView").hidden = true;
    $("#sharedPlanForm").hidden = false;
    state.dirty = false;
    $("#sharedPlanTitleInput").focus();
  }

  async function updatePlan(force = false) {
    const current = state.plans.get(state.currentPlanKey);
    if (!current || !session()) return;
    const draft = {
      title: $("#sharedPlanTitleInput").value.trim(),
      summary: $("#sharedPlanSummaryInput").value.trim(),
      detail: $("#sharedPlanDetailInput").value.trim(),
    };
    if (!draft.title) {
      showDialogMessage("标题不能为空。", "error");
      return;
    }
    state.dirty = true;
    setSyncStatus("正在保存…");
    try {
      await ensureFreshSession();
      let version = current.version;
      if (force) {
        const latest = await request(`/rest/v1/shared_plans?plan_key=eq.${encodeURIComponent(current.plan_key)}&select=version`, { headers: apiHeaders() });
        version = latest[0]?.version ?? version;
      }
      const rows = await request(`/rest/v1/shared_plans?plan_key=eq.${encodeURIComponent(current.plan_key)}&version=eq.${version}&select=*`, {
        method: "PATCH",
        headers: apiHeaders(true),
        body: JSON.stringify({ ...draft, last_editor: session().editor }),
      });
      if (!rows.length) {
        state.pendingRemote = true;
        showConflict("对方已先保存了新版本。你的草稿没有丢失。");
        return;
      }
      state.plans.set(current.plan_key, rows[0]);
      state.dirty = false;
      state.pendingRemote = null;
      renderCards();
      renderDialog(current.plan_key);
      setSyncStatus(`${session().editor} 编辑模式 · 已保存`);
    } catch (error) {
      showDialogMessage(`尚未同步：${error.message}`, "error");
      setSyncStatus("尚未同步，草稿仍保留", "error");
    }
  }

  function showConflict(message) {
    showDialogMessage(message, "warning", `
      <div class="shared-message-actions">
        <button type="button" data-conflict-action="reload">载入对方版本</button>
        <button type="button" data-conflict-action="overwrite">用我的内容重新保存</button>
      </div>`);
  }

  async function patchTodo(todo, changes) {
    const rows = await request(`/rest/v1/shared_todos?todo_key=eq.${encodeURIComponent(todo.todo_key)}&version=eq.${todo.version}&select=*`, {
      method: "PATCH",
      headers: apiHeaders(true),
      body: JSON.stringify({ ...changes, last_editor: session().editor }),
    });
    if (!rows.length) throw new Error("这项待办刚刚被对方修改，请刷新后再试");
    return rows[0];
  }

  async function handleTodoAction(todoKey, action, row) {
    const todos = sortedTodos(state.currentPlanKey);
    const todo = todos.find((item) => item.todo_key === todoKey);
    if (!todo || !session()) return;
    try {
      await ensureFreshSession();
      if (action === "toggle") {
        const updated = await patchTodo(todo, { completed: row.querySelector("input[type='checkbox']").checked });
        state.todos.set(state.currentPlanKey, todos.map((item) => item.todo_key === todoKey ? updated : item));
      } else if (action === "save-todo") {
        const text = row.querySelector(".todo-text-input").value.trim();
        if (!text) throw new Error("待办内容不能为空");
        const updated = await patchTodo(todo, { text });
        state.todos.set(state.currentPlanKey, todos.map((item) => item.todo_key === todoKey ? updated : item));
      } else if (action === "delete-todo") {
        if (!window.confirm(`确定删除“${todo.text}”吗？`)) return;
        const deleted = await request(`/rest/v1/shared_todos?todo_key=eq.${encodeURIComponent(todo.todo_key)}&version=eq.${todo.version}&select=*`, {
          method: "DELETE",
          headers: apiHeaders(true),
        });
        if (!deleted.length) throw new Error("这项待办已被对方修改，请刷新后再试");
        state.todos.set(state.currentPlanKey, todos.filter((item) => item.todo_key !== todoKey));
      } else if (action === "move-up" || action === "move-down") {
        const index = todos.findIndex((item) => item.todo_key === todoKey);
        const otherIndex = action === "move-up" ? index - 1 : index + 1;
        if (otherIndex < 0 || otherIndex >= todos.length) return;
        const other = todos[otherIndex];
        const [updated, otherUpdated] = await Promise.all([
          patchTodo(todo, { sort_order: other.sort_order }),
          patchTodo(other, { sort_order: todo.sort_order }),
        ]);
        state.todos.set(state.currentPlanKey, todos.map((item) => item.todo_key === todo.todo_key ? updated : item.todo_key === other.todo_key ? otherUpdated : item));
      }
      renderDialog(state.currentPlanKey);
      setSyncStatus(`${session().editor} 编辑模式 · 已保存`);
    } catch (error) {
      setSyncStatus("尚未同步，请重试", "error");
      renderDialog(state.currentPlanKey);
      showDialogMessage(`尚未同步：${error.message}`, "error");
    }
  }

  async function addTodo(event) {
    event.preventDefault();
    const input = $("#sharedNewTodoInput");
    const text = input.value.trim();
    if (!text || !session()) return;
    try {
      await ensureFreshSession();
      const todos = sortedTodos(state.currentPlanKey);
      const rows = await request("/rest/v1/shared_todos?select=*", {
        method: "POST",
        headers: apiHeaders(true),
        body: JSON.stringify({
          plan_key: state.currentPlanKey,
          text,
          completed: false,
          sort_order: todos.length ? Math.max(...todos.map((todo) => Number(todo.sort_order))) + 1 : 0,
          last_editor: session().editor,
        }),
      });
      input.value = "";
      state.todos.set(state.currentPlanKey, [...todos, rows[0]]);
      renderDialog(state.currentPlanKey);
      setSyncStatus(`${session().editor} 编辑模式 · 已保存`);
    } catch (error) {
      showDialogMessage(`尚未同步：${error.message}`, "error");
    }
  }

  async function login(event) {
    event.preventDefault();
    const errorNode = $("#sharedLoginError");
    const submit = $("#sharedLoginSubmit");
    if (!state.configured) {
      errorNode.hidden = false;
      errorNode.textContent = "请先按项目中的 Supabase 设置说明完成云端配置。";
      return;
    }
    const editor = new FormData(event.currentTarget).get("sharedEditor");
    submit.disabled = true;
    submit.textContent = "正在验证…";
    errorNode.hidden = true;
    try {
      const response = await fetch(`${String(config.url).replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: config.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email: config.editorEmail, password: $("#sharedPasswordInput").value }),
      });
      if (!response.ok) throw new Error("密码不正确，或共享账号尚未创建");
      saveAuthSession(await response.json(), editor);
      $("#sharedPasswordInput").value = "";
      $("#sharedLoginDialog").close();
      setSyncStatus(`${editor} 编辑模式 · 正在同步`);
      await loadCloud();
    } catch (error) {
      errorNode.hidden = false;
      errorNode.textContent = error.message;
    } finally {
      submit.disabled = false;
      submit.textContent = "进入编辑模式";
    }
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const card = event.target.closest("[data-plan-key]");
      if (card) openPlan(card.dataset.planKey);
      const actionButton = event.target.closest("[data-action]");
      if (actionButton) {
        const row = actionButton.closest("[data-todo-key]");
        handleTodoAction(row.dataset.todoKey, actionButton.dataset.action, row);
      }
      const conflictButton = event.target.closest("[data-conflict-action]");
      if (conflictButton?.dataset.conflictAction === "reload") {
        state.dirty = false;
        state.pendingRemote = null;
        loadCloud();
      } else if (conflictButton?.dataset.conflictAction === "overwrite") {
        updatePlan(true);
      }
    });
    document.addEventListener("keydown", (event) => {
      const card = event.target.closest?.("[data-plan-key]");
      if (card && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openPlan(card.dataset.planKey);
      }
    });
    $("#workspaceTodos")?.addEventListener("change", (event) => {
      if (event.target.matches("input[type='checkbox']")) {
        const row = event.target.closest("[data-todo-key]");
        handleTodoAction(row.dataset.todoKey, "toggle", row);
      }
    });
    $("#workspaceDialogClose")?.addEventListener("click", () => $("#workspaceDialog")?.close());
    $("#workspaceDialog")?.addEventListener("click", (event) => {
      if (event.target === $("#workspaceDialog")) $("#workspaceDialog").close();
    });
    $("#sharedLoginButton")?.addEventListener("click", () => $("#sharedLoginDialog")?.showModal());
    $("#sharedLoginClose")?.addEventListener("click", () => $("#sharedLoginDialog")?.close());
    $("#sharedLogoutButton")?.addEventListener("click", () => clearSession());
    $("#sharedLoginForm")?.addEventListener("submit", login);
    $("#sharedEditPlanButton")?.addEventListener("click", startPlanEdit);
    $("#sharedCancelPlanButton")?.addEventListener("click", () => {
      state.dirty = false;
      renderDialog(state.currentPlanKey);
    });
    $("#sharedPlanForm")?.addEventListener("input", () => { state.dirty = true; });
    $("#sharedPlanForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      updatePlan();
    });
    $("#sharedAddTodoForm")?.addEventListener("submit", addTodo);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) loadCloud({ quiet: true });
    });
  }

  window.addEventListener("jiao:content-ready", async (event) => {
    buildFallback(event.detail || {});
    updateAuthUi();
    if (state.configured) {
      setSyncStatus("正在读取情侣共享计划…");
      await loadCloud();
    } else {
      setSyncStatus("共享功能待配置 · 当前只读", "warning");
    }
  });

  bindEvents();
  updateAuthUi();
  window.setInterval(() => loadCloud({ quiet: true }), Math.max(3000, Number(config.syncIntervalMs) || 5000));
})();
