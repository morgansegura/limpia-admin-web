# Limpia CRM Functionality

This is a breakdown and a checklist of the functionality Limpia will have in out in-house CRM.

1. Lead intake and tracking

2. Quoting and estimates

3. Conversion to customer

4. Customer profile and history

5. Follow-up, upsells, and retention

6. Support and feedback loop

## CRM Core capabilities

### Lead Management

- **New Lead Intake**: from a marketing form, manual entry or referrals
- **Lead Search and Filtering**: By status, name, zip, source, assigned rep
- **Lead Assignment**: Auto-assign or manually assign to `SALES_AGENT`
- **Lead Pipeline View**: Lead → Quoted → Converted (Kanban or Table)
- **Generate Estimate**: Sales estimate using sqft, pricing model, discounts
- **Send Estimate**: Via email/SMS, with template and tracking
- **Tags & Source Attribution**: “Instagram”, “Referral”, “Google Ads”, etc. (How did they find us?)

### Customer Profile and History

- **Full Contact Info**: Name, email, phone, address, zip, etc.
- **Job History**: Past jobs, dates, types, referrals, field notes, etc.
- **Payments & Pricing**: Quoted prices, discounts given, invoice records (if integrated)
- **hecklist History**: Rotation clean log, feedback, checklists completed
- **Photo History**: Before/after photo logs (sorted by job date)
- **Recurring Setup**: Biweekly, weekly, monthly — shown with next upcoming job
- **Notes**: Internal notes, customer preferences (gate code, pets, etc.)
- **Referred Customers**: Track if this customer referred others (LTV insight)
- **Support Tickets**: Open or resolved support cases tied to this customer

### CRM Insights & Reporting

- **Conversion Rate**: % of leads converted by rep / source
- **Avg Quote vs Close**: Average quoted price vs actual sale
- **Top Performing Sales Reps**: Leaderboard of conversion rate or quote value
- **Customer Lifetime Value**: Based on job frequency + price + duration
- **Source Effectiveness**: Which source channels drive high-value leads
- **Upsell Tracking**: 10x10 services offered/accepted per customer

## CRM Pages

`/leads` Lead list with filters, table, tags, assigned rep

`/leads/new` Manual entry by sales or admin

`/leads/[id]` Full detail: contact info, status, notes, send quote, convert

`/customers` Customer list, sortable by recency, LTV, or region

`/customers/new` Manual customer creation (outside conversion flow)

`/customers/[id]` Full profile, history, schedule, notes, support

`/crm/reports` CRM-level insights: conversion, top reps, source performance

`/estimates/[id]` Standalone estimate view w/ pricing breakdown and send option

## Additional CRM features

- **Lead Scoring**: Auto-score leads based on zip, house size, and source
- **Reminders & Follow-Ups**: “Follow up with Linda tomorrow” – assigned to sales rep
- **Email/SMS Templates**: Pre-built, editable templates per stage (estimate, reminder, etc.)
- **Notes & @Mentions**: Team notes with tagging for communication inside CRM
- **Pinned Leads/Customers**: Shortcut for high-priority contacts
- **Role Restrictions**: Only `SALES_AGENT` can edit leads; only `SUPER_ADMIN` can delete customers
