---
title: Appointments
permalink: /student/appointments
tailwind: true
layout: aesthetihawk
active_tab: appointments
---

<div class="appt-page">

  <!-- ── Header ────────────────────────────────── -->
  <div class="appt-header">
    <h1 class="appt-title">Schedule an Appointment</h1>
    <p class="appt-subtitle">Request a meeting with Mr. Mort. Your request will be reviewed and you'll be notified of the decision here.</p>
  </div>

  <!-- ── Auth banner ────────────────────────────── -->
  <div id="appt-auth-banner" class="appt-auth-banner hidden">
    Session expired. <a href="{{site.baseurl}}/login">Log in</a> to manage appointments.
  </div>

  <!-- ── Request form ───────────────────────────── -->
  <section class="appt-card" id="appt-form-section">
    <h2 class="appt-card-title">New Appointment Request</h2>
    <form id="appt-form" class="appt-form" novalidate>
      <div class="appt-form-row">
        <label for="appt-date" class="appt-label">Date <span class="appt-required">*</span></label>
        <input type="date" id="appt-date" class="appt-input" required />
      </div>
      <div class="appt-form-row">
        <label for="appt-slot" class="appt-label">Start Time <span class="appt-required">*</span></label>
        <input type="time" id="appt-slot" class="appt-input" required />
      </div>
      <div class="appt-form-row">
        <label for="appt-reason" class="appt-label">Reason <span class="appt-required">*</span></label>
        <textarea id="appt-reason" class="appt-input appt-textarea" rows="4" placeholder="Briefly describe what you'd like to discuss" required></textarea>
      </div>
      <div class="appt-form-actions">
        <button type="submit" id="appt-submit" class="appt-btn primary">Submit Request</button>
      </div>
      <p id="appt-form-msg" class="appt-form-msg hidden"></p>
    </form>
  </section>

  <!-- ── My appointments ────────────────────────── -->
  <section class="appt-card" id="appt-list-section">
    <div class="appt-list-header">
      <h2 class="appt-card-title">My Appointments</h2>
      <button id="appt-refresh" class="appt-btn secondary">Refresh</button>
    </div>
    <div id="appt-list" class="appt-list">
      <div class="appt-empty">Loading your appointments…</div>
    </div>
  </section>

</div>

<!-- ────────────────────────────────────────────── -->
<style>
.appt-page { max-width: 700px; margin: 0 auto; padding: 24px 16px; display: flex; flex-direction: column; gap: 24px; }
.appt-header { }
.appt-title { font-size: 1.6rem; font-weight: 700; margin: 0 0 6px; }
.appt-subtitle { color: var(--text-secondary, #888); margin: 0; }
.appt-auth-banner { background: #ff3b3b22; border: 1px solid #ff3b3b55; border-radius: 8px; padding: 10px 16px; color: #ff6b6b; }
.appt-card { background: var(--card-bg, #1e1e1e); border: 1px solid var(--border, #333); border-radius: 12px; padding: 24px; }
.appt-card-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 16px; }
.appt-form { display: flex; flex-direction: column; gap: 14px; }
.appt-form-row { display: flex; flex-direction: column; gap: 4px; }
.appt-label { font-size: 0.875rem; font-weight: 500; color: var(--text-secondary, #aaa); }
.appt-required { color: #ef4444; }
.appt-input { background: var(--input-bg, #2a2a2a); border: 1px solid var(--border, #444); border-radius: 8px; padding: 10px 12px; color: inherit; font-size: 0.95rem; width: 100%; box-sizing: border-box; }
.appt-input:focus { outline: none; border-color: #3b82f6; }
.appt-textarea { resize: vertical; min-height: 90px; }
.appt-form-actions { display: flex; gap: 10px; }
.appt-form-msg { font-size: 0.875rem; margin: 0; padding: 8px 12px; border-radius: 6px; }
.appt-form-msg.success { background: #16a34a22; color: #4ade80; border: 1px solid #16a34a55; }
.appt-form-msg.error { background: #dc262622; color: #f87171; border: 1px solid #dc262655; }
.appt-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.appt-list-header .appt-card-title { margin: 0; }
.appt-list { display: flex; flex-direction: column; gap: 12px; }
.appt-empty { color: var(--text-secondary, #888); font-size: 0.9rem; text-align: center; padding: 20px; }
.appt-item { border: 1px solid var(--border, #333); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; }
.appt-item-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.appt-item-date { font-weight: 600; font-size: 0.95rem; }
.appt-item-slot { font-size: 0.85rem; color: var(--text-secondary, #aaa); }
.appt-item-reason { font-size: 0.9rem; color: var(--text-secondary, #bbb); }
.appt-item-note { font-size: 0.85rem; color: #93c5fd; font-style: italic; }
.appt-item-actions { display: flex; gap: 8px; margin-top: 4px; }
.appt-badge { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 999px; font-size: 0.78rem; font-weight: 600; }
.appt-badge.pending  { background: #ca8a0422; color: #fbbf24; border: 1px solid #ca8a0455; }
.appt-badge.accepted { background: #16a34a22; color: #4ade80; border: 1px solid #16a34a55; }
.appt-badge.rejected { background: #dc262622; color: #f87171; border: 1px solid #dc262655; }
.appt-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: none; transition: opacity 0.15s; }
.appt-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.appt-btn.primary { background: #3b82f6; color: #fff; }
.appt-btn.primary:hover:not(:disabled) { background: #2563eb; }
.appt-btn.secondary { background: var(--input-bg, #2a2a2a); color: inherit; border: 1px solid var(--border, #444); }
.appt-btn.secondary:hover:not(:disabled) { border-color: #3b82f6; }
.appt-btn.danger { background: #dc262622; color: #f87171; border: 1px solid #dc262655; }
.appt-btn.danger:hover:not(:disabled) { background: #dc262644; }
.hidden { display: none !important; }
</style>

<script type="module">
import { pythonURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';

const BASE = `${pythonURI}/api/appointments`;

function showAuthBanner() { document.getElementById('appt-auth-banner')?.classList.remove('hidden'); }

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function showMsg(text, type = 'success') {
  const el = document.getElementById('appt-form-msg');
  if (!el) return;
  el.textContent = text;
  el.className = `appt-form-msg ${type}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

async function loadMyAppointments() {
  const list = document.getElementById('appt-list');
  if (!list) return;
  try {
    const res = await fetch(`${BASE}/mine`, { ...fetchOptions, method: 'GET' });
    if (res.status === 401 || res.status === 403) { showAuthBanner(); list.innerHTML = '<div class="appt-empty">Please log in to see your appointments.</div>'; return; }
    if (!res.ok) { list.innerHTML = '<div class="appt-empty">Could not load appointments.</div>'; return; }
    const appts = await res.json();
    if (!appts.length) { list.innerHTML = '<div class="appt-empty">No appointments yet. Use the form above to request one.</div>'; return; }
    list.innerHTML = appts.map(a => `
      <div class="appt-item" data-id="${esc(a.id)}">
        <div class="appt-item-top">
          <span class="appt-item-date">${esc(fmtDate(a.date))}</span>
          <span class="appt-badge ${esc(a.status)}">${esc(a.status.charAt(0).toUpperCase() + a.status.slice(1))}</span>
        </div>
        <div class="appt-item-slot">${esc(a.time_slot)}</div>
        <div class="appt-item-reason">${esc(a.reason)}</div>
        ${a.teacher_note ? `<div class="appt-item-note">Teacher note: ${esc(a.teacher_note)}</div>` : ''}
        ${a.status === 'pending' ? `<div class="appt-item-actions"><button class="appt-btn danger appt-cancel" data-id="${esc(a.id)}">Cancel</button></div>` : ''}
      </div>
    `).join('');

    list.querySelectorAll('.appt-cancel').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Cancel this appointment request?')) return;
        btn.disabled = true;
        const id = btn.dataset.id;
        const del = await fetch(`${BASE}/${id}`, { ...fetchOptions, method: 'DELETE' });
        if (del.ok) { showMsg('Appointment cancelled.'); loadMyAppointments(); }
        else { btn.disabled = false; showMsg('Could not cancel. Try again.', 'error'); }
      });
    });
  } catch (e) {
    showAuthBanner();
    list.innerHTML = '<div class="appt-empty">Could not connect to server.</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Set min date to today
  const dateInput = document.getElementById('appt-date');
  if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

  loadMyAppointments();

  document.getElementById('appt-refresh')?.addEventListener('click', loadMyAppointments);

  document.getElementById('appt-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const date   = document.getElementById('appt-date').value.trim();
    const slot   = document.getElementById('appt-slot').value.trim();
    const reason = document.getElementById('appt-reason').value.trim();

    if (!date || !slot || !reason) { showMsg('Please fill in all fields.', 'error'); return; }

    const btn = document.getElementById('appt-submit');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    try {
      const res = await fetch(`${BASE}/`, {
        ...fetchOptions,
        method: 'POST',
        body: JSON.stringify({ date, time_slot: slot, reason })
      });
      if (res.status === 401 || res.status === 403) { showAuthBanner(); showMsg('Please log in first.', 'error'); return; }
      if (!res.ok) { const t = await res.text(); showMsg(t || 'Submission failed.', 'error'); return; }
      document.getElementById('appt-form').reset();
      showMsg('Appointment request submitted! You will be notified once reviewed.');
      loadMyAppointments();
    } catch (err) {
      showMsg('Network error — could not submit.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Request';
    }
  });
});
</script>
