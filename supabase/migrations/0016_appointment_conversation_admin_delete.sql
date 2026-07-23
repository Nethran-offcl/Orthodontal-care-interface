-- appointments and conversations had select/insert/update policies but no
-- delete policy at all, so nobody — not even admins — could hard-delete a
-- row (the app is built around cancelling/resolving instead). That's a
-- reasonable default for regular staff, but admins should still be able to
-- clean up mistakes/test data without dropping to the SQL editor.
--
-- chat_messages and attachments cascade-delete off conversations
-- (`on delete cascade`); RLS still applies to cascaded deletes on the
-- child table, so they need their own admin-delete policy too or an
-- admin's conversation delete would fail partway through. internal_notes
-- already has an "author or admin deletes" policy from 0012, so it's
-- covered.

create policy "appointments: admins delete"
  on public.appointments for delete
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "conversations: admins delete"
  on public.conversations for delete
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "chat_messages: admins delete"
  on public.chat_messages for delete
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "attachments: admins delete"
  on public.attachments for delete
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
