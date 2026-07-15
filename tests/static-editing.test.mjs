import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../docs/", import.meta.url);

test("editable content file contains every public collection", async () => {
  const content = JSON.parse(await readFile(new URL("content.json", root), "utf8"));
  assert.equal(content.content["hero.title"], "Jiao's Living Archive");
  assert.ok(content.images.profile);
  assert.equal(content.workspaceItems.length, 4);
  assert.ok(content.workspaceItems.every((item) => Array.isArray(item.todos)));
  assert.equal(content.love.photos.length, 8);
  assert.equal(content.love.wishes.length, 3);
  assert.equal(content.quarterGoals.length, 2);
  assert.equal(content.travelPlans.length, 2);
});

test("public page reads editable content and links to admin", async () => {
  const [html, script] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("script.js", root), "utf8"),
  ]);
  assert.match(html, /href="\.\/admin\.html"/);
  assert.match(html, /data-content="hero\.title"/);
  assert.match(html, /id="workspaceItems"/);
  assert.match(html, /id="loveScrapbook"/);
  assert.match(script, /fetch\(`\.\/content\.json/);
  assert.match(script, /renderScrapbook/);
  assert.match(script, /openWorkspacePlan/);
  assert.match(html, /id="workspaceDialog"/);
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
  assert.match(script, /待办事项（每行一项）/);
  assert.doesNotMatch(script, /localStorage/);
});
