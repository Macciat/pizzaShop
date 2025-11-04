import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://yuzsjohfqpsryuzmnbpk.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1enNqb2hmcXBzcnl1em1uYnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTA4MjUsImV4cCI6MjA3NjcyNjgyNX0.SWXyo36e0obZKeUNGCO8AUb_s5pDvF7GE39abKdr4aI'
    );
  }

  get client() {
    return this.supabase;
  }
}
