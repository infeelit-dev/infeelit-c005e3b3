# Mercredi Event Checklist

## 17h00 — Export & Import
- [ ] Export CSV from Luma
- [ ] Delete all rows from attendees table
- [ ] Import new CSV via Supabase Table Editor
- [ ] Verify count: SELECT COUNT(*) FROM attendees

## 17h15 — LinkedIn enrichment
- [ ] Put new PDFs in linkedin-pdfs/quick folder
- [ ] Change .env: PDF_FOLDER=.../quick
- [ ] Run: python rename_pdfs.py
- [ ] Run: python process.py
- [ ] Revert .env: PDF_FOLDER=.../linkedin-pdfs

## 17h45 — Pre-match batch
- [ ] Run: python prematch.py
- [ ] Enter today's date: YYYY-MM-DD
- [ ] Wait for completion
- [ ] Verify: SELECT COUNT(*) FROM pre_matches WHERE event_date = today

## 18h00 — Final checks
- [ ] Open gritandgrowl.club on phone
- [ ] Enter test email
- [ ] Verify match appears instantly
- [ ] Verify WhatsApp button works
- [ ] Lovable: check no errors

## 18h30 — Blast
- [ ] Send WhatsApp blast to community
- [ ] Send Luma blast to registered guests

## 19h00 — EVENT STARTS
