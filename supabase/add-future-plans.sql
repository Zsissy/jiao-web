-- Add Future Planning to an existing Jiao Archive shared-plans setup.
-- Run this entire file once in Supabase Dashboard > SQL Editor.

alter table public.shared_plans
  drop constraint if exists shared_plans_section_check;

alter table public.shared_plans
  add constraint shared_plans_section_check
  check (section in ('workspace', 'love', 'future'));

insert into public.shared_plans
  (plan_key, section, eyebrow, title, summary, detail, image_url, sort_order)
values
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
