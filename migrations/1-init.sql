CREATE EXTENSION IF NOT EXISTS pgcrypto; 

drop table if exists job_queue;

create table if not exists job_queue (
  id serial primary key,
  payload text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  status text not null default 'pending'
);

create index on job_queue (created_at);
create index on job_queue (updated_at);
create index on job_queue (status);