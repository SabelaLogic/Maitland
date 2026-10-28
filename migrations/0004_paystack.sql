alter table folio_lines add column if not exists paystack_ref text;
create index if not exists folio_paystack_idx on folio_lines (paystack_ref);
