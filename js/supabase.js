import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://hhzxdukqfhstuvrkznxc.supabase.co";

const supabaseKey = "sb_publishable_QBNZgtrCVSUNR7JAkQ6QCQ_aDstcXVy";

export const supabase = createClient(supabaseUrl, supabaseKey);