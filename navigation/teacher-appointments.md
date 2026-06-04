---
title: Appointment Requests
permalink: /teacher/appointments
tailwind: true
layout: aesthetihawk
active_tab: teacher-appointments
---

<div class="tappt-page">

  <div class="tappt-header">
    <div>
      <h1 class="tappt-title">
        Appointment Requests
        <span id="tappt-notif-dot" class="tappt-notif-dot hidden"></span>
      </h1>
      <p class="tappt-subtitle">Accept or reject student requests. Accepted appointments appear on the calendar. Resolve them once done to clear them out.</p>
    </div>
    <div class="tappt-header-actions">
      <button id="tappt-notif-enable" class="tappt-btn secondary" title="Enable desktop notifications">🔔 Enable Alerts</button>
      <button id="tappt-refresh" class="tappt-btn secondary">Refresh</button>
    </div>
  </div>

  <div id="tappt-auth-banner" class="tappt-auth-banner hidden">
    Access restricted. You must be logged in as a Teacher or Admin.
  </div>

  <!-- Stats row -->
  <div class="tappt-stats">
    <div class="tappt-stat" id="stat-pending"><span class="tappt-stat-num" id="stat-pending-n">—</span><span class="tappt-stat-label">Pending</span></div>
    <div class="tappt-stat" id="stat-missed"><span class="tappt-stat-num" id="stat-missed-n">—</span><span class="tappt-stat-label">Missed</span></div>
    <div class="tappt-stat" id="stat-accepted"><span class="tappt-stat-num" id="stat-accepted-n">—</span><span class="tappt-stat-label">Accepted</span></div>
    <div class="tappt-stat" id="stat-rejected"><span class="tappt-stat-num" id="stat-rejected-n">—</span><span class="tappt-stat-label">Rejected</span></div>
  </div>

  <!-- Tabs -->
  <div class="tappt-tabs" role="tablist">
    <button class="tappt-tab active" data-tab="pending"  role="tab">Pending</button>
    <button class="tappt-tab"        data-tab="accepted" role="tab">Accepted</button>
    <button class="tappt-tab"        data-tab="rejected" role="tab">Rejected</button>
  </div>

  <!-- Panels -->
  <div id="tappt-panel-pending"  class="tappt-panel"><div class="tappt-empty">Loading…</div></div>
  <div id="tappt-panel-accepted" class="tappt-panel hidden"><div class="tappt-empty">Loading…</div></div>
  <div id="tappt-panel-rejected" class="tappt-panel hidden"><div class="tappt-empty">Loading…</div></div>

</div>

<!-- Reject modal -->
<div id="reject-modal" class="tappt-modal hidden" role="dialog">
  <div class="tappt-modal-content">
    <h3 class="tappt-modal-title">Reject Appointment</h3>
    <p class="tappt-modal-sub">Optionally add a note for the student.</p>
    <textarea id="reject-note" class="tappt-input tappt-textarea" rows="3" placeholder="Reason for rejection (optional)"></textarea>
    <div class="tappt-modal-actions">
      <button id="reject-confirm" class="tappt-btn danger">Reject</button>
      <button id="reject-cancel"  class="tappt-btn secondary">Cancel</button>
    </div>
  </div>
</div>

<!-- Accept modal -->
<div id="accept-modal" class="tappt-modal hidden" role="dialog">
  <div class="tappt-modal-content">
    <h3 class="tappt-modal-title">Accept Appointment</h3>
    <p class="tappt-modal-sub">Optionally add a note for the student. This will also create a calendar event.</p>
    <textarea id="accept-note" class="tappt-input tappt-textarea" rows="3" placeholder="Note for student (optional)"></textarea>
    <div class="tappt-modal-actions">
      <button id="accept-confirm" class="tappt-btn primary">Accept &amp; Add to Calendar</button>
      <button id="accept-cancel"  class="tappt-btn secondary">Cancel</button>
    </div>
  </div>
</div>

<style>
.tappt-page { max-width: 860px; margin: 0 auto; padding: 24px 16px; display: flex; flex-direction: column; gap: 20px; }
.tappt-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.tappt-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.tappt-title { font-size: 1.6rem; font-weight: 700; margin: 0 0 4px; display: flex; align-items: center; gap: 10px; }
.tappt-subtitle { color: var(--text-secondary, #888); margin: 0; font-size: 0.9rem; }
.tappt-notif-dot { width: 10px; height: 10px; background: #ef4444; border-radius: 50%; display: inline-block; animation: pulse-dot 1.5s infinite; }
@keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.7} }
.tappt-auth-banner { background: #dc262622; border: 1px solid #dc262655; border-radius: 8px; padding: 12px 16px; color: #f87171; }
.tappt-stats { display: flex; gap: 12px; flex-wrap: wrap; }
.tappt-stat { flex: 1; min-width: 80px; background: var(--card-bg, #1e1e1e); border: 1px solid var(--border, #333); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.tappt-stat-num { font-size: 1.8rem; font-weight: 700; }
.tappt-stat-label { font-size: 0.78rem; color: var(--text-secondary, #888); text-transform: uppercase; letter-spacing: 0.05em; }
#stat-pending  .tappt-stat-num { color: #fbbf24; }
#stat-missed   .tappt-stat-num { color: #ef4444; }
#stat-accepted .tappt-stat-num { color: #4ade80; }
#stat-rejected .tappt-stat-num { color: #94a3b8; }
.tappt-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border, #333); }
.tappt-tab { background: none; border: none; border-bottom: 2px solid transparent; padding: 8px 18px; font-size: 0.9rem; cursor: pointer; color: var(--text-secondary, #888); transition: color 0.15s; margin-bottom: -1px; position: relative; }
.tappt-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
.tappt-tab:hover:not(.active) { color: inherit; }
.tappt-tab-badge { position: absolute; top: 2px; right: 2px; background: #ef4444; color: #fff; border-radius: 999px; font-size: 0.65rem; font-weight: 700; min-width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; padding: 0 4px; }
.tappt-panel { display: flex; flex-direction: column; gap: 12px; }
.tappt-panel.hidden { display: none !important; }
.tappt-empty { color: var(--text-secondary, #888); font-size: 0.9rem; text-align: center; padding: 32px; }
.tappt-card { background: var(--card-bg, #1e1e1e); border: 1px solid var(--border, #333); border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; transition: border-color 0.2s; }
.tappt-card.missed { border-color: #ef444466; background: #ef444408; }
.tappt-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap; }
.tappt-student { font-weight: 600; font-size: 1rem; }
.tappt-student-uid { font-size: 0.8rem; color: var(--text-secondary, #999); }
.tappt-meta { font-size: 0.875rem; color: var(--text-secondary, #bbb); }
.tappt-reason { font-size: 0.9rem; border-left: 3px solid var(--border, #444); padding-left: 10px; color: var(--text-secondary, #ccc); }
.tappt-teacher-note { font-size: 0.85rem; color: #93c5fd; font-style: italic; }
.tappt-missed-label { font-size: 0.8rem; font-weight: 600; color: #ef4444; }
.tappt-actions { display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
.tappt-badge { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 999px; font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
.tappt-badge.pending  { background: #ca8a0422; color: #fbbf24; border: 1px solid #ca8a0455; }
.tappt-badge.missed   { background: #ef444422; color: #ef4444; border: 1px solid #ef444455; }
.tappt-badge.accepted { background: #16a34a22; color: #4ade80; border: 1px solid #16a34a55; }
.tappt-badge.rejected { background: #33333322; color: #94a3b8; border: 1px solid #44444455; }
.tappt-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: none; transition: opacity 0.15s; }
.tappt-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.tappt-btn.primary  { background: #3b82f6; color: #fff; }
.tappt-btn.primary:hover:not(:disabled)  { background: #2563eb; }
.tappt-btn.secondary { background: var(--input-bg, #2a2a2a); color: inherit; border: 1px solid var(--border, #444); }
.tappt-btn.secondary:hover:not(:disabled) { border-color: #3b82f6; }
.tappt-btn.danger   { background: #dc262622; color: #f87171; border: 1px solid #dc262655; }
.tappt-btn.danger:hover:not(:disabled)   { background: #dc262644; }
.tappt-btn.resolve  { background: #16a34a22; color: #4ade80; border: 1px solid #16a34a55; }
.tappt-btn.resolve:hover:not(:disabled)  { background: #16a34a44; }
.tappt-input { background: var(--input-bg, #2a2a2a); border: 1px solid var(--border, #444); border-radius: 8px; padding: 10px 12px; color: inherit; font-size: 0.95rem; width: 100%; box-sizing: border-box; }
.tappt-input:focus { outline: none; border-color: #3b82f6; }
.tappt-textarea { resize: vertical; min-height: 80px; }
.tappt-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.tappt-modal.hidden { display: none !important; }
.tappt-modal-content { background: var(--card-bg, #1e1e1e); border: 1px solid var(--border, #333); border-radius: 14px; padding: 28px 28px 20px; max-width: 460px; width: 100%; display: flex; flex-direction: column; gap: 14px; }
.tappt-modal-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
.tappt-modal-sub { font-size: 0.875rem; color: var(--text-secondary, #aaa); margin: 0; }
.tappt-modal-actions { display: flex; gap: 10px; }
.sidebar-notif-badge { background: #ef4444; color: #fff; border-radius: 999px; font-size: 0.65rem; font-weight: 700; min-width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; padding: 0 4px; margin-left: auto; }
.sidebar-notif-badge.hidden { display: none !important; }
.hidden { display: none !important; }
</style>

<script type="module">
import { pythonURI, javaURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';

const BASE = `${pythonURI}/api/appointments`;
const POLL_INTERVAL = 60000; // 60s
const today = new Date().toISOString().slice(0, 10);

let allAppts = [];
let knownPendingIds = new Set(JSON.parse(localStorage.getItem('tappt-known-ids') || '[]'));
let pendingAction = null;
let pollTimer = null;

// ── Helpers ────────────────────────────────────────────────
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtDate(iso) {
  if (!iso) return '—';
  const [y,m,d] = iso.split('-');
  return new Date(y, m-1, d).toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric', year:'numeric'});
}
function isMissed(a) { return a.status === 'pending' && a.date < today; }
function showAuthBanner() { document.getElementById('tappt-auth-banner')?.classList.remove('hidden'); }

// ── Browser notifications ───────────────────────────────────
async function requestNotifPermission() {
  if (!('Notification' in window)) return;
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    document.getElementById('tappt-notif-enable')?.classList.add('hidden');
  }
}

function fireNotif(title, body) {
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: window.baseurl + '/favicon.ico' });
}

function updateNotifEnabledBtn() {
  const btn = document.getElementById('tappt-notif-enable');
  if (!btn) return;
  if (!('Notification' in window) || Notification.permission === 'granted') btn.classList.add('hidden');
}

// ── Sidebar badge ──────────────────────────────────────────
function updateSidebarBadge(count) {
  const badge = document.getElementById('notif-badge-teacher-appointments');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ── Notification dot in page title ─────────────────────────
function updateNotifDot(hasNew) {
  document.getElementById('tappt-notif-dot')?.classList.toggle('hidden', !hasNew);
}

// ── Tab badges ─────────────────────────────────────────────
function updateTabBadges(appts) {
  const pendingCount = appts.filter(a => a.status === 'pending').length;
  const missedCount  = appts.filter(isMissed).length;

  const pendingTab = document.querySelector('.tappt-tab[data-tab="pending"]');
  if (pendingTab) {
    let badge = pendingTab.querySelector('.tappt-tab-badge');
    if (pendingCount > 0) {
      if (!badge) { badge = document.createElement('span'); badge.className = 'tappt-tab-badge'; pendingTab.appendChild(badge); }
      badge.textContent = pendingCount > 99 ? '99+' : pendingCount;
    } else {
      badge?.remove();
    }
  }

  // Show missed count on pending tab too (they appear there)
  if (missedCount > 0) {
    const missedBadge = document.querySelector('.tappt-tab[data-tab="pending"] .tappt-tab-badge');
    if (missedBadge) missedBadge.style.background = '#ef4444';
  }
}

// ── Stats ──────────────────────────────────────────────────
function updateStats(appts) {
  const pending  = appts.filter(a => a.status === 'pending' && !isMissed(a)).length;
  const missed   = appts.filter(isMissed).length;
  const accepted = appts.filter(a => a.status === 'accepted').length;
  const rejected = appts.filter(a => a.status === 'rejected').length;
  document.getElementById('stat-pending-n').textContent  = pending;
  document.getElementById('stat-missed-n').textContent   = missed;
  document.getElementById('stat-accepted-n').textContent = accepted;
  document.getElementById('stat-rejected-n').textContent = rejected;
}

// ── Render panels ──────────────────────────────────────────
function renderPendingPanel(appts) {
  const panel = document.getElementById('tappt-panel-pending');
  if (!panel) return;
  const list = appts.filter(a => a.status === 'pending');
  if (!list.length) { panel.innerHTML = '<div class="tappt-empty">No pending appointment requests.</div>'; return; }

  panel.innerHTML = list.map(a => {
    const missed = isMissed(a);
    return `
      <div class="tappt-card ${missed ? 'missed' : ''}" data-id="${esc(a.id)}">
        <div class="tappt-card-top">
          <div>
            <div class="tappt-student">${esc(a.student_name)}</div>
            <div class="tappt-student-uid">${esc(a.student_uid)}</div>
          </div>
          <span class="tappt-badge ${missed ? 'missed' : 'pending'}">${missed ? '⚠ Missed' : 'Pending'}</span>
        </div>
        ${missed ? '<div class="tappt-missed-label">⚠ This appointment date has passed without a response.</div>' : ''}
        <div class="tappt-meta">${esc(fmtDate(a.date))} &nbsp;·&nbsp; ${esc(a.time_slot)}</div>
        <div class="tappt-reason">${esc(a.reason)}</div>
        <div class="tappt-actions">
          <button class="tappt-btn primary tappt-accept" data-id="${esc(a.id)}">Accept</button>
          <button class="tappt-btn danger  tappt-reject" data-id="${esc(a.id)}">Reject</button>
        </div>
      </div>`;
  }).join('');

  panel.querySelectorAll('.tappt-accept').forEach(btn => btn.addEventListener('click', () => openAcceptModal(btn.dataset.id)));
  panel.querySelectorAll('.tappt-reject').forEach(btn => btn.addEventListener('click', () => openRejectModal(btn.dataset.id)));
}

function renderResolvedPanel(status) {
  const panel = document.getElementById(`tappt-panel-${status}`);
  if (!panel) return;
  const list = allAppts.filter(a => a.status === status);
  if (!list.length) { panel.innerHTML = `<div class="tappt-empty">No ${status} appointments.</div>`; return; }

  panel.innerHTML = list.map(a => `
    <div class="tappt-card" data-id="${esc(a.id)}">
      <div class="tappt-card-top">
        <div>
          <div class="tappt-student">${esc(a.student_name)}</div>
          <div class="tappt-student-uid">${esc(a.student_uid)}</div>
        </div>
        <span class="tappt-badge ${esc(a.status)}">${esc(a.status.charAt(0).toUpperCase()+a.status.slice(1))}</span>
      </div>
      <div class="tappt-meta">${esc(fmtDate(a.date))} &nbsp;·&nbsp; ${esc(a.time_slot)}</div>
      <div class="tappt-reason">${esc(a.reason)}</div>
      ${a.teacher_note ? `<div class="tappt-teacher-note">Your note: ${esc(a.teacher_note)}</div>` : ''}
      <div class="tappt-actions">
        <button class="tappt-btn resolve tappt-resolve" data-id="${esc(a.id)}">✓ Resolve &amp; Delete</button>
      </div>
    </div>
  `).join('');

  panel.querySelectorAll('.tappt-resolve').forEach(btn => btn.addEventListener('click', () => resolveAppointment(btn.dataset.id, btn)));
}

function render() {
  updateStats(allAppts);
  updateTabBadges(allAppts);
  renderPendingPanel(allAppts);
  renderResolvedPanel('accepted');
  renderResolvedPanel('rejected');

  const actionable = allAppts.filter(a => a.status === 'pending').length;
  updateSidebarBadge(actionable);
  updateNotifDot(actionable > 0);
}

// ── Fetch + diff for notifications ──────────────────────────
async function loadAppointments(isPoll = false) {
  try {
    const res = await fetch(`${BASE}/all`, { ...fetchOptions, method: 'GET' });
    if (res.status === 401 || res.status === 403) { showAuthBanner(); return; }
    if (!res.ok) return;
    const fresh = await res.json();

    if (isPoll) {
      // New pending appointments not seen before
      const newOnes = fresh.filter(a => a.status === 'pending' && !knownPendingIds.has(a.id));
      newOnes.forEach(a => {
        fireNotif('New Appointment Request', `${a.student_name} wants to meet on ${fmtDate(a.date)} at ${a.time_slot}`);
      });

      // Missed appointments (past date, still pending)
      const nowMissed = fresh.filter(isMissed).filter(a => !knownPendingIds.has(`missed-${a.id}`));
      nowMissed.forEach(a => {
        fireNotif('⚠ Missed Appointment', `${a.student_name}'s request for ${fmtDate(a.date)} was never responded to.`);
        knownPendingIds.add(`missed-${a.id}`);
      });

      if (newOnes.length) {
        newOnes.forEach(a => knownPendingIds.add(a.id));
        localStorage.setItem('tappt-known-ids', JSON.stringify([...knownPendingIds]));
      }
    } else {
      // First load — seed known IDs so we don't spam on page open
      fresh.filter(a => a.status === 'pending').forEach(a => knownPendingIds.add(a.id));
      localStorage.setItem('tappt-known-ids', JSON.stringify([...knownPendingIds]));
    }

    allAppts = fresh;
    render();
  } catch (e) {
    showAuthBanner();
  }
}

// ── Resolve (delete) ────────────────────────────────────────
async function resolveAppointment(id, btn) {
  if (!confirm('Mark this appointment as resolved and delete it?')) return;
  btn.disabled = true;
  btn.textContent = 'Resolving…';
  try {
    const res = await fetch(`${BASE}/${id}`, { ...fetchOptions, method: 'DELETE' });
    if (!res.ok) { alert('Could not resolve. Try again.'); btn.disabled = false; btn.textContent = '✓ Resolve & Delete'; return; }
    // Remove from known IDs
    knownPendingIds.delete(Number(id));
    knownPendingIds.delete(`missed-${id}`);
    localStorage.setItem('tappt-known-ids', JSON.stringify([...knownPendingIds]));
    loadAppointments();
  } catch (e) {
    alert('Network error.');
    btn.disabled = false;
    btn.textContent = '✓ Resolve & Delete';
  }
}

// ── Accept / Reject modals ──────────────────────────────────
function openAcceptModal(id) { pendingAction = { id, action: 'accept' }; document.getElementById('accept-note').value = ''; document.getElementById('accept-modal').classList.remove('hidden'); }
function closeAcceptModal() { document.getElementById('accept-modal').classList.add('hidden'); pendingAction = null; }
function openRejectModal(id) { pendingAction = { id, action: 'reject' }; document.getElementById('reject-note').value = ''; document.getElementById('reject-modal').classList.remove('hidden'); }
function closeRejectModal() { document.getElementById('reject-modal').classList.add('hidden'); pendingAction = null; }

async function updateStatus(id, status, note) {
  const res = await fetch(`${BASE}/${id}/status`, { ...fetchOptions, method: 'PUT', body: JSON.stringify({ status, teacher_note: note || '' }) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function createCalendarEvent(appt) {
  try {
    await fetch(`${javaURI}/api/calendar/events`, {
      ...fetchOptions, method: 'POST',
      body: JSON.stringify({ title: `Appointment: ${appt.student_name}`, description: `${appt.time_slot} — ${appt.reason}`, date: appt.date, type: 'appointment', individual: appt.student_uid })
    });
  } catch (e) { console.warn('Calendar event creation failed (non-fatal):', e); }
}

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateNotifEnabledBtn();
  loadAppointments(false);

  // Start polling
  pollTimer = setInterval(() => loadAppointments(true), POLL_INTERVAL);

  document.getElementById('tappt-refresh')?.addEventListener('click', () => loadAppointments(false));
  document.getElementById('tappt-notif-enable')?.addEventListener('click', requestNotifPermission);

  // Tab switching
  document.querySelectorAll('.tappt-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tappt-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      ['pending','accepted','rejected'].forEach(s => {
        document.getElementById(`tappt-panel-${s}`)?.classList.toggle('hidden', s !== tab.dataset.tab);
      });
    });
  });

  // Accept confirm
  document.getElementById('accept-confirm')?.addEventListener('click', async () => {
    if (!pendingAction) return;
    const btn = document.getElementById('accept-confirm');
    btn.disabled = true; btn.textContent = 'Accepting…';
    try {
      const updated = await updateStatus(pendingAction.id, 'accepted', document.getElementById('accept-note').value.trim());
      await createCalendarEvent(updated);
      closeAcceptModal();
      loadAppointments();
    } catch (e) { alert('Error: ' + e.message); }
    finally { btn.disabled = false; btn.textContent = 'Accept & Add to Calendar'; }
  });
  document.getElementById('accept-cancel')?.addEventListener('click', closeAcceptModal);

  // Reject confirm
  document.getElementById('reject-confirm')?.addEventListener('click', async () => {
    if (!pendingAction) return;
    const btn = document.getElementById('reject-confirm');
    btn.disabled = true; btn.textContent = 'Rejecting…';
    try {
      await updateStatus(pendingAction.id, 'rejected', document.getElementById('reject-note').value.trim());
      closeRejectModal();
      loadAppointments();
    } catch (e) { alert('Error: ' + e.message); }
    finally { btn.disabled = false; btn.textContent = 'Reject'; }
  });
  document.getElementById('reject-cancel')?.addEventListener('click', closeRejectModal);

  // Backdrop close
  document.getElementById('accept-modal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeAcceptModal(); });
  document.getElementById('reject-modal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeRejectModal(); });

  // Cleanup on unload
  window.addEventListener('beforeunload', () => clearInterval(pollTimer));
});
</script>
