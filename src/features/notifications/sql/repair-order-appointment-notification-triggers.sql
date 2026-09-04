-- Fix notification triggers for the current `notifications.category` schema.
--
-- Run this once in Supabase Dashboard -> SQL Editor. Older versions of these
-- triggers inserted legacy `type` and `data` fields, but `category` is now
-- required. A trigger failure rolls back the appointment/order it was handling.

-- Safety net for any previously-installed legacy trigger that has a different
-- name and cannot be replaced below. It prevents those old inserts from
-- blocking an order or appointment while they are migrated to `category`.
alter table public.notifications
  alter column category set default 'system';

create or replace function public._seba_notify_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (business_id, type, category, title, body)
    values (
      new.business_id,
      'new_order',
      'order',
      'New order' || case when new.order_number is not null then ' #' || new.order_number else '' end,
      coalesce(new.customer_name, 'A customer') || ' placed an order' ||
        case when new.total is not null then ' for ' || new.total::text else '' end
    );
  end if;

  return new;
end;
$$;

create or replace function public._seba_notify_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (business_id, type, category, title, body)
    values (
      new.business_id,
      'new_appointment',
      'appointment',
      'New appointment',
      coalesce(new.customer, 'A customer') || ' booked ' || coalesce(new.service, 'a service') ||
        ' on ' || new.date::text || ' at ' || new.time
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status
        and new.status in ('Cancelled', 'No-show') then
    insert into public.notifications (business_id, type, category, title, body)
    values (
      new.business_id,
      'appointment_cancelled',
      'appointment',
      'Appointment ' || lower(new.status),
      coalesce(new.customer, 'A customer') || '''s appointment on ' || new.date::text ||
        ' is now ' || new.status
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_order on public.orders;
create trigger trg_notify_order
after insert or update on public.orders
for each row execute function public._seba_notify_order();

drop trigger if exists trg_notify_appointment on public.appointments;
create trigger trg_notify_appointment
after insert or update on public.appointments
for each row execute function public._seba_notify_appointment();

-- Verify this after running the script: the appointment trigger must point to
-- the function above, and booking must no longer fail because of `category`.
select
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'appointments'
order by trigger_name, event_manipulation;
