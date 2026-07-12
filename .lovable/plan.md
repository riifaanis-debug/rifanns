Plan: Unify Number Font to Monospace Across the Site

Goal: Make every numeric value in the site use the same monospace font (`font-mono`) currently applied to the national ID number, so all numbers render consistently and are easy to read/scan.

Scope: Frontend CSS/Tailwind only — no data or business logic changes.

Implementation steps:

1. Audit number display locations
   - Search the codebase for all places that display numeric data (national IDs, mobile numbers, ages, amounts/prices, invoice totals, submission IDs, file numbers, request counts, contract numbers, bank account numbers, IBANs, etc.).
   - Focus on the components listed in the codebase context: CustomerDashboard, PaymentRequests, WaiveRequestForm, OpenRequestBuilder, AuthPage, ProfileCompletionModal, ClientCard, InvoicePage, ContractPage, etc.

2. Define the consistent style
   - Apply `font-mono` to all numeric display elements.
   - Keep existing font size, color, weight, and layout unchanged — only change the font family.
   - For text inputs that accept numbers, add `font-mono` to the input field while keeping current padding/height/border.

3. Update components in priority order
   - CustomerDashboard: national ID, mobile, age, salary, submission IDs, file numbers, invoice amounts.
   - PaymentRequests: amounts, request IDs, account numbers.
   - WaiveRequestForm / OpenRequestBuilder: amounts, IDs, phone numbers.
   - AuthPage: mobile/national ID inputs.
   - InvoicePage / ContractPage: amounts, dates, invoice numbers.
   - ClientCard: card numbers/validity dates.

4. Verify
   - Run TypeScript check (`tsc --noEmit`).
   - Run production build to catch any CSS/compilation errors.
   - Optionally capture a screenshot of the dashboard to confirm number styling is consistent.

Out of scope: changing font sizes, colors, layout, or form behavior; only the font family of numbers will be touched.