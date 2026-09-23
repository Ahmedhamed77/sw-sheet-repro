-- Run: trace_processor_shell -q perfetto/idle.sql idle.pftrace
-- Idle window = trace start + 0.5 s .. trace end - 0.2 s.
create perfetto table app as
  select upid, pid from process where name = 'com.swmsheetstatelooprepro';
create perfetto table w as
  select (select min(ts) from thread_state) + 500e6 a,
         (select max(ts) from thread_state) - 200e6 b;
create perfetto table main_slices as
  select s.* from slice s
  join thread_track tt on s.track_id = tt.id
  join thread t using (utid) join app using (upid), w
  where t.tid = app.pid and s.ts between w.a and w.b;
select
  round((select b - a from w) / 1e9, 2) as window_s,
  (select count(*) from main_slices
     where name like 'MountItemDispatcher::mountViews mountItems%') as mounts,
  (select count(*) from main_slices
     where name like '%UPDATE_STATE%') as update_state,
  (select count(*) from actual_frame_timeline_slice f join app using (upid), w
     where f.ts between w.a and w.b) as frames_drawn,
  (select round(sum(ss.dur) / 1e6) from thread_state ss
     join thread t using (utid) join app using (upid), w
     where t.tid = app.pid and ss.state = 'Running'
       and ss.ts between w.a and w.b) as main_running_ms,
  (select round(coalesce(sum(ss.dur), 0) / 1e6) from thread_state ss
     join thread t using (utid) join app using (upid), w
     where t.name = 'mqt_v_js' and ss.state = 'Running'
       and ss.ts between w.a and w.b) as js_running_ms;
