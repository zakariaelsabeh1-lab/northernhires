alter table job_seekers
  add column if not exists ai_resume_generations integer not null default 0;
