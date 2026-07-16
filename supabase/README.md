# 情侣共享计划设置

这套设置只需要完成一次。完成后，网站网址仍是：

`https://zsissy.github.io/jiao-web/`

## 1. 创建 Supabase 项目

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)，创建免费项目。
2. Region 选择 `Singapore`。
3. 等待项目创建完成。

## 2. 创建数据表与权限

1. 在 Supabase 左侧打开 `SQL Editor`。
2. 新建查询，将 `supabase/shared-plans.sql` 的全部内容粘贴进去。
3. 点击 `Run`。看到成功提示后，十一份计划和初始待办已写入。

如果你之前已经运行过旧版脚本并拥有七份计划，请改为运行
`supabase/add-future-plans.sql`。它只补充 Future Planning 的四份计划，不会清除已有内容或勾选状态。

## 3. 创建情侣编辑账号

1. 打开 `Authentication` > `Users`。
2. 点击 `Add user` > `Create new user`。
3. Email 填写 `couple-editor@example.com`。
4. 设置只由你和 June 保存的共同密码。
5. 勾选自动确认用户（Auto Confirm User），然后创建。

不要把这个密码写进代码、发给普通访客或粘贴到公开页面。

## 4. 连接网页

1. 打开 `Project Settings` > `API`。
2. 复制 `Project URL`。
3. 复制 `Publishable key`；如果项目显示的是旧名称，则复制 `anon public key`。
4. 打开 `docs/shared-config.js`，分别填入 `url` 和 `anonKey`：

```js
window.JIAO_SHARED_CONFIG = {
  url: "https://你的项目.supabase.co",
  anonKey: "你的 publishable 或 anon key",
  editorEmail: "couple-editor@example.com",
  syncIntervalMs: 5000,
};
```

Publishable/anon key 本来就是网页公开密钥，可以放在静态网站中。不要使用或粘贴 `service_role` secret key。

## 5. 发布

在 GitHub Desktop 中提交这些修改并 Push。GitHub Pages 更新后：

- 普通朋友打开主网址时只能查看。
- 你和 June 点击“情侣编辑”，选择名字并输入共同密码后可以编辑。
- 关闭当前浏览器标签页会退出编辑模式。
- 另一台设备通常会在约 5 秒内看到更新。
