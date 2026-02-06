// Shared status → Tailwind badge-class map.
// Single source of truth for the whole app.
//
//   import { getStatusColor } from '../utils/statusColors';
//
// If you add a new status to the DB, add it here once —
// every page that renders a badge will pick it up automatically.

const STATUS_COLORS = {
  // ── Booking statuses ──────────────────────────
  pending:     'bg-yellow-100 text-yellow-800',
  confirmed:   'bg-blue-100 text-blue-800',
  assigned:    'bg-purple-100 text-purple-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed:   'bg-green-100 text-green-800',
  cancelled:   'bg-red-100 text-red-800',

  // ── Aircon-unit statuses ──────────────────────
  operational:   'bg-green-100 text-green-800',
  needs_service: 'bg-yellow-100 text-yellow-800',
  under_repair:  'bg-orange-100 text-orange-800',
  retired:       'bg-gray-100 text-gray-800',

  // ── Service-record statuses (capitalised — matches DB CHECK constraint) ──
  Completed: 'bg-green-100 text-green-800',
  Pending:   'bg-yellow-100 text-yellow-800',
};

export const getStatusColor = (status) =>
  STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';