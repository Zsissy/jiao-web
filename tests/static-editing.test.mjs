import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../docs/", import.meta.url);

test("editable content file contains every public collection", async () => {
  const content = JSON.parse(await readFile(new URL("content.json", root), "utf8"));
  assert.ok(content.content["hero.title"].trim());
  assert.ok(content.images.profile);
  assert.equal(content.workspaceItems.length, 4);
  assert.ok(content.workspaceItems.every((item) => item.key && Array.isArray(item.todos)));
  assert.equal(content.love.photos.length, 8);
  assert.equal(content.love.wishes.length, 3);
  assert.ok(content.love.wishes.every((item) => item.key && Array.isArray(item.todos)));
  assert.equal(content.quarterGoals.length, 2);
  assert.equal(content.travelPlans.length, 2);
});

test("public page reads editable content and loads shared plans", async () => {
  const [html, script, shared] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("script.js", root), "utf8"),
    readFile(new URL("shared-plans.js", root), "utf8"),
  ]);
  assert.match(html, /href="\.\/admin\.html"/);
  assert.match(html, /data-content="hero\.title"/);
  assert.match(html, /id="workspaceItems"/);
  assert.match(html, /id="loveScrapbook"/);
  assert.match(script, /fetch\(`\.\/content\.json/);
  assert.match(script, /renderScrapbook/);
  assert.match(script, /jiao:content-ready/);
  assert.match(html, /id="workspaceDialog"/);
  assert.match(html, /id="sharedLoginDialog"/);
  assert.match(html, /shared-config\.js/);
  assert.match(html, /shared-plans\.js/);
  assert.match(shared, /shared_plans/);
  assert.match(shared, /shared_todos/);
  assert.match(shared, /grant_type=password/);
  assert.match(shared, /sessionStorage/);
  assert.match(shared, /syncIntervalMs/);
  assert.doesNotMatch(shared, /localStorage/);
});

test("admin saves content and images through the GitHub API", async () => {
  const [html, script] = await Promise.all([
    readFile(new URL("admin.html", root), "utf8"),
    readFile(new URL("admin.js", root), "utf8"),
  ]);
  assert.match(html, /GitHub 管理密钥/);
  assert.match(html, /id="saveButton"/);
  assert.match(script, /api\.github\.com\/repos\/\$\{REPOSITORY\}/);
  assert.match(script, /docs\/uploads/);
  assert.match(script, /Update website content from online admin/);
  assert.match(script, /情侣共享计划/);
  assert.doesNotMatch(script, /待办事项（每行一项）/);
  assert.doesNotMatch(script, /localStorage/);
});

test("Supabase setup enforces public read and signed-in writes", async () => {
  const [sql, config] = await Promise.all([
    readFile(new URL("../supabase/shared-plans.sql", import.meta.url), "utf8"),
    readFile(new URL("shared-config.js", root), "utf8"),
  ]);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /to anon, authenticated[\s\S]*using \(true\)/i);
  assert.match(sql, /for update[\s\S]*to authenticated/i);
  assert.match(sql, /bump_shared_version/);
  assert.equal((sql.match(/\('(?:workspace|love)-[^']+', '(?:workspace|love)'/g) || []).length, 7);
  assert.match(config, /couple-editor@example\.com/);
  assert.doesNotMatch(config, /service_role/i);
});
