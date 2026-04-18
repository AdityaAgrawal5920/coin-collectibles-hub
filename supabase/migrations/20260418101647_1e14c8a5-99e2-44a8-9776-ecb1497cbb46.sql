-- Replace permissive insert policy with validated one
drop policy if exists "Anyone can create identification requests" on public.identification_requests;
create policy "Submit identification requests with validation"
  on public.identification_requests for insert
  with check (
    length(title) between 1 and 200
    and (description is null or length(description) <= 4000)
    and array_length(images, 1) <= 8
    and (
      auth.uid() is not null
      or (
        coalesce(length(contact_name), 0) between 1 and 120
        and (
          (contact_email is not null and length(contact_email) <= 255)
          or (contact_whatsapp is not null and length(contact_whatsapp) <= 40)
        )
      )
    )
  );

-- Replace broad storage SELECT with same bucket but path-based to prevent listing root
drop policy if exists "Listing images publicly readable" on storage.objects;
drop policy if exists "Avatars publicly readable" on storage.objects;
create policy "Listing images public read by path"
  on storage.objects for select
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] is not null);
create policy "Avatars public read by path"
  on storage.objects for select
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] is not null);