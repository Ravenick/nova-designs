
-- Admin write access on plan-images & plan-files
create policy "admin upload plan images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'plan-images' and public.has_role(auth.uid(), 'admin'));
create policy "admin update plan images" on storage.objects
  for update to authenticated
  using (bucket_id = 'plan-images' and public.has_role(auth.uid(), 'admin'));
create policy "admin delete plan images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'plan-images' and public.has_role(auth.uid(), 'admin'));

create policy "admin upload plan files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'plan-files' and public.has_role(auth.uid(), 'admin'));
create policy "admin update plan files" on storage.objects
  for update to authenticated
  using (bucket_id = 'plan-files' and public.has_role(auth.uid(), 'admin'));
create policy "admin delete plan files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'plan-files' and public.has_role(auth.uid(), 'admin'));

-- Authenticated read on plan-images (signed urls also work; this lets anon get via signed urls only)
create policy "authenticated read plan images" on storage.objects
  for select to authenticated
  using (bucket_id = 'plan-images');
create policy "admin read plan files" on storage.objects
  for select to authenticated
  using (bucket_id = 'plan-files' and public.has_role(auth.uid(), 'admin'));
