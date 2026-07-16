-- Jiao Archive: Workspace + Love Story + Future Planning shared plans
-- Run this entire file once in Supabase Dashboard > SQL Editor.

create table if not exists public.shared_plans (
  plan_key text primary key,
  section text not null check (section in ('workspace', 'love', 'future')),
  eyebrow text not null default '',
  title text not null,
  summary text not null default '',
  detail text not null default '',
  image_url text not null default '',
  sort_order integer not null default 0,
  version bigint not null default 1,
  last_editor text check (last_editor is null or last_editor in ('Jiao', 'June')),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_todos (
  todo_key text primary key default gen_random_uuid()::text,
  plan_key text not null references public.shared_plans(plan_key) on delete cascade,
  text text not null check (length(trim(text)) > 0),
  completed boolean not null default false,
  sort_order integer not null default 0,
  version bigint not null default 1,
  last_editor text check (last_editor is null or last_editor in ('Jiao', 'June')),
  updated_at timestamptz not null default now()
);

create index if not exists shared_plans_section_order_idx
  on public.shared_plans(section, sort_order);
create index if not exists shared_todos_plan_order_idx
  on public.shared_todos(plan_key, sort_order);

create or replace function public.bump_shared_version()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.version := old.version + 1;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists bump_shared_plans_version on public.shared_plans;
create trigger bump_shared_plans_version
before update on public.shared_plans
for each row execute function public.bump_shared_version();

drop trigger if exists bump_shared_todos_version on public.shared_todos;
create trigger bump_shared_todos_version
before update on public.shared_todos
for each row execute function public.bump_shared_version();

alter table public.shared_plans enable row level security;
alter table public.shared_todos enable row level security;

drop policy if exists "shared plans are publicly readable" on public.shared_plans;
create policy "shared plans are publicly readable"
on public.shared_plans for select
to anon, authenticated
using (true);

drop policy if exists "signed in editor can add plans" on public.shared_plans;
create policy "signed in editor can add plans"
on public.shared_plans for insert
to authenticated
with check (true);

drop policy if exists "signed in editor can update plans" on public.shared_plans;
create policy "signed in editor can update plans"
on public.shared_plans for update
to authenticated
using (true)
with check (true);

drop policy if exists "signed in editor can delete plans" on public.shared_plans;
create policy "signed in editor can delete plans"
on public.shared_plans for delete
to authenticated
using (true);

drop policy if exists "shared todos are publicly readable" on public.shared_todos;
create policy "shared todos are publicly readable"
on public.shared_todos for select
to anon, authenticated
using (true);

drop policy if exists "signed in editor can add todos" on public.shared_todos;
create policy "signed in editor can add todos"
on public.shared_todos for insert
to authenticated
with check (true);

drop policy if exists "signed in editor can update todos" on public.shared_todos;
create policy "signed in editor can update todos"
on public.shared_todos for update
to authenticated
using (true)
with check (true);

drop policy if exists "signed in editor can delete todos" on public.shared_todos;
create policy "signed in editor can delete todos"
on public.shared_todos for delete
to authenticated
using (true);

grant usage on schema public to anon, authenticated;
grant select on public.shared_plans, public.shared_todos to anon, authenticated;
grant insert, update, delete on public.shared_plans, public.shared_todos to authenticated;

insert into public.shared_plans
  (plan_key, section, eyebrow, title, summary, detail, image_url, sort_order)
values
  ('workspace-reading', 'workspace', '学习笔记 · 2026-07', '阅读与课程索引',
   '把最近的阅读、课程、论文和灵感按月份整理，沉淀成可以反复回看的知识地图。',
   '按课程、阅读主题和输出方向整理七月的学习内容。每周保留一次回顾时间，把零散标注转化为能够复用的笔记，并记录仍需要继续追问的问题。', '', 0),
  ('workspace-weekly', 'workspace', '工作计划 · 2026-W29', '本周重点',
   '优先完成最重要的三件事：整理项目节奏、复盘输出、准备下一阶段材料。',
   '把本周精力集中在最有推进价值的事项上。先确认截止时间和交付标准，再按轻重缓急完成任务，周末留出时间复盘本周节奏。', '', 1),
  ('workspace-monthly', 'workspace', '月度展望 · 2026-07', '七月展望',
   '保持稳定输入，也给生活留出漂亮的空白。这个月的关键词是节奏、表达、远方。',
   '七月不追求把日程填满，而是建立稳定、可持续的生活节奏。在学习和工作之外，认真安排休息、运动、表达和与重要的人相处的时间。', '', 2),
  ('workspace-achievements', 'workspace', '成果备份 · 2026', '阶段成果库',
   '把交付物、作品截图、重要记录和复盘结论归档，形成可追踪的成长证据。',
   '将完成的作品、课程成果、项目材料和重要记录统一归档。每一项成果都补充时间、背景和复盘说明，让成长过程能够被清楚回看。', '', 3),
  ('love-travel', 'love', '想完成', '一起出国旅行',
   '带相机、护照和一本小本子，把路上的风景都贴进去。',
   '把第一次一起出国旅行认真计划起来，从目的地、证件和预算，到想拍的照片与想收藏的小纪念品，都慢慢准备。', './assets/wishes/wish-travel.png', 0),
  ('love-chubby-life', 'love', '想完成', '一起过小肥生活',
   '认真吃饭，认真散步，也认真把普通日子过得软乎乎。',
   '把平常的小日子也当成共同计划：好好吃饭、规律休息、一起散步，也留下只属于两个人的生活记录。', './assets/wishes/wish-chubby-life.png', 1),
  ('love-graduation', 'love', '想完成', '顺利毕业',
   '一起稳稳走过这一段，把努力和好消息都带到下一站。',
   '互相陪伴完成毕业阶段的重要任务，按时间准备材料、论文和答辩，也记得在忙碌里给彼此鼓励。', './assets/wishes/wish-graduation-study.png', 2),
  ('future-output-rhythm', 'future', '2026 Q3 · 进行中', '建立稳定输出节奏',
   '每周整理一次学习笔记，每月做一次成果复盘。',
   '把稳定输出拆成每周和每月都能完成的小步骤，既持续积累学习内容，也定期回看已经完成的成果。', '', 0),
  ('future-portfolio', 'future', '2026 Q3 · 进行中', '升级个人作品集',
   '把重要作品归档到网站，让朋友也能看到阶段成果。',
   '逐步完善个人作品集的结构、案例与说明，把重要作品和成长过程整理成朋友也能清楚浏览的内容。', '', 1),
  ('future-kyoto', 'future', '想去 · 秋天', '京都',
   '枫叶、老街、胶片感照片和慢慢走的下午。',
   '为秋天的京都旅行收集路线、住宿和想拍摄的地方，留出足够时间慢慢走，也为临时发现保留空白。', '', 10),
  ('future-seaside', 'future', '计划中 · 一个长周末', '海边城市',
   '看日落，写一页旅行笔记，给照片墙添一组蓝色。',
   '选一座适合长周末抵达的海边城市，把日落、散步和旅行笔记安排进轻松的短途计划里。', '', 11)
on conflict (plan_key) do nothing;

insert into public.shared_todos
  (todo_key, plan_key, text, completed, sort_order)
values
  ('workspace-reading-01', 'workspace-reading', '整理本月课程与阅读目录', false, 0),
  ('workspace-reading-02', 'workspace-reading', '完成每周阅读笔记', false, 1),
  ('workspace-reading-03', 'workspace-reading', '归纳论文核心观点', false, 2),
  ('workspace-reading-04', 'workspace-reading', '月底完成一次知识复盘', false, 3),
  ('workspace-weekly-01', 'workspace-weekly', '整理本周项目节奏', false, 0),
  ('workspace-weekly-02', 'workspace-weekly', '完成阶段输出复盘', false, 1),
  ('workspace-weekly-03', 'workspace-weekly', '准备下一阶段材料', false, 2),
  ('workspace-weekly-04', 'workspace-weekly', '安排下周优先事项', false, 3),
  ('workspace-monthly-01', 'workspace-monthly', '制定七月月度安排', false, 0),
  ('workspace-monthly-02', 'workspace-monthly', '每周保留完整休息时间', false, 1),
  ('workspace-monthly-03', 'workspace-monthly', '完成一次长篇表达', false, 2),
  ('workspace-monthly-04', 'workspace-monthly', '记录本月值得纪念的时刻', false, 3),
  ('workspace-achievements-01', 'workspace-achievements', '整理近期交付文件', false, 0),
  ('workspace-achievements-02', 'workspace-achievements', '保存作品与过程截图', false, 1),
  ('workspace-achievements-03', 'workspace-achievements', '补充每项成果说明', false, 2),
  ('workspace-achievements-04', 'workspace-achievements', '完成阶段成果复盘', false, 3),
  ('love-travel-01', 'love-travel', '确定第一站目的地', false, 0),
  ('love-travel-02', 'love-travel', '检查护照与签证要求', false, 1),
  ('love-travel-03', 'love-travel', '一起制定旅行预算', false, 2),
  ('love-travel-04', 'love-travel', '整理想去的地点清单', false, 3),
  ('love-chubby-life-01', 'love-chubby-life', '一起学一道新菜', false, 0),
  ('love-chubby-life-02', 'love-chubby-life', '安排一次长距离散步', false, 1),
  ('love-chubby-life-03', 'love-chubby-life', '记录本月的小肥生活', false, 2),
  ('love-chubby-life-04', 'love-chubby-life', '挑一天认真休息', false, 3),
  ('love-graduation-01', 'love-graduation', '确认毕业时间节点', false, 0),
  ('love-graduation-02', 'love-graduation', '完成论文阶段计划', false, 1),
  ('love-graduation-03', 'love-graduation', '准备答辩与毕业材料', false, 2),
  ('love-graduation-04', 'love-graduation', '一起拍毕业纪念照', false, 3),
  ('future-output-rhythm-01', 'future-output-rhythm', '每周整理一次学习笔记', false, 0),
  ('future-output-rhythm-02', 'future-output-rhythm', '确定每月成果复盘日期', false, 1),
  ('future-output-rhythm-03', 'future-output-rhythm', '记录本周最重要的输出', false, 2),
  ('future-output-rhythm-04', 'future-output-rhythm', '月底检查完成节奏', false, 3),
  ('future-portfolio-01', 'future-portfolio', '整理现有作品目录', false, 0),
  ('future-portfolio-02', 'future-portfolio', '选择首批展示案例', false, 1),
  ('future-portfolio-03', 'future-portfolio', '补充案例背景与复盘', false, 2),
  ('future-portfolio-04', 'future-portfolio', '更新网站作品入口', false, 3),
  ('future-kyoto-01', 'future-kyoto', '确定大致旅行日期', false, 0),
  ('future-kyoto-02', 'future-kyoto', '整理想去的街区与寺院', false, 1),
  ('future-kyoto-03', 'future-kyoto', '比较交通和住宿方案', false, 2),
  ('future-kyoto-04', 'future-kyoto', '准备拍摄与行李清单', false, 3),
  ('future-seaside-01', 'future-seaside', '选定海边城市', false, 0),
  ('future-seaside-02', 'future-seaside', '确认长周末时间', false, 1),
  ('future-seaside-03', 'future-seaside', '查找看日落的位置', false, 2),
  ('future-seaside-04', 'future-seaside', '准备旅行笔记和相机', false, 3)
on conflict (todo_key) do nothing;
