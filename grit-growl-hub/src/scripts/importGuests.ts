import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';

interface GuestRow {
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  "What is your LinkedIn profile?"?: string;
  "Your WhatsApp number with country code (Example: +971501234567 or +33612345678)"?: string;
  "Your industry, what you are working on right now, what you are looking for tonight, and what you can offer to others in the room. Be specific, this is how we match you with the right people."?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  linkedinCount: number;
  bioCount: number;
}

export async function importGuests(): Promise<ImportResult> {
  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    errors: [],
    linkedinCount: 0,
    bioCount: 0,
  };

  const csvPath = path.join(process.cwd(), 'src', 'scripts', 'data', 'guests.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at ${csvPath}`);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  const { data, errors } = Papa.parse<GuestRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length > 0) {
    result.errors = errors.map(e => e.message);
    return result;
  }

  const guests = data as GuestRow[];
  const total = guests.length;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < guests.length; i++) {
    const row = guests[i];
    const email = row.email?.trim().toLowerCase();
    
    if (!email) {
      result.skipped++;
      continue;
    }

    let firstName = row.first_name?.trim() || '';
    let lastName = row.last_name?.trim() || '';
    
    if (!firstName && row.name) {
      const nameParts = row.name.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    }

    const linkedinUrl = row["What is your LinkedIn profile?"]?.trim() || '';
    if (linkedinUrl) result.linkedinCount++;
    
    const bio = row["Your industry, what you are working on right now, what you are looking for tonight, and what you can offer to others in the room. Be specific, this is how we match you with the right people."]?.trim() || '';
    if (bio) result.bioCount++;

    const { error } = await supabase
      .from('attendees')
      .upsert({
        email: email,
        first_name: firstName,
        last_name: lastName,
        full_name: row.name?.trim() || `${firstName} ${lastName}`.trim(),
        phone: row.phone_number?.trim() || '',
        whatsapp: row["Your WhatsApp number with country code (Example: +971501234567 or +33612345678)"]?.trim() || '',
        linkedin_url: linkedinUrl,
        luma_bio: bio,
        event_date: today,
        visits: 1,
        manifesto_accepted: false,
        onboarding_complete: false,
        match_count: 0,
        suggestions_shown: 0,
        data_consent: false,
      } as any, { onConflict: 'email' });

    if (error) {
      result.errors.push(`${email}: ${error.message}`);
      result.skipped++;
    } else {
      result.imported++;
    }
  }

  return result;
}

// Pour exécuter directement via bun
if (require.main === module) {
  importGuests()
    .then(result => {
      console.log('\n=== IMPORT SUMMARY ===');
      console.log(`✅ Imported: ${result.imported}`);
      console.log(`⚠️ Skipped: ${result.skipped}`);
      console.log(`🔗 LinkedIn URLs found: ${result.linkedinCount}`);
      console.log(`📝 Luma bio filled: ${result.bioCount}`);
      if (result.errors.length > 0) {
        console.log(`❌ Errors: ${result.errors.length}`);
        result.errors.forEach(e => console.log(`  - ${e}`));
      }
      console.log('=====================\n');
    })
    .catch(console.error);
}