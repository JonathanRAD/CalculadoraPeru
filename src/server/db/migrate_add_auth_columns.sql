-- ==============================================================================
-- MIGRACIÓN: Agregar columnas password_hash y salt a la tabla profiles
-- Ejecutar en Supabase SQL Editor si ya creaste la tabla previamente
-- ==============================================================================

alter table public.profiles
  add column if not exists password_hash text,
  add column if not exists salt text;
