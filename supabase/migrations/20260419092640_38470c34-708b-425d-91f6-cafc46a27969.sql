-- Explicit restrictive policy: only admins can write to user_roles
-- This blocks any path (including future permissive policies) that would let
-- a non-admin insert/update/delete their own role assignment.

CREATE POLICY "Only admins can modify roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO authenticated, anon
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));