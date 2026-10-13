// Registro central de iconos Win95/98 reales (PNG convertidos de trapd00r/win95-winxp_icons).
// Clave semántica -> archivo en /icons/. Las variantes -16 son pixel-perfect para titlebars/taskbar.

const ICON_FILES: Record<string, string> = {
  computer: 'w98_computer.png',
  folder: 'w98_directory_closed.png',
  'folder-open': 'w98_directory_open.png',
  briefcase: 'w98_briefcase.png',
  check: 'w98_check.png',
  calendar: 'w98_calendar.png',
  'user-calendar': 'w98_user_calendar.png',
  users: 'w98_users.png',
  'users-key': 'w98_users_key.png',
  calculator: 'w98_calculator.png',
  newspaper: 'w98_newspaper.png',
  chart: 'w98_chart1.png',
  'sched-tasks': 'w98_directory_sched_tasks.png',
  clock: 'w98_clock.png',
  'dir-check': 'w98_directory_check.png',
  wordpad: 'w98_write_wordpad.png',
  note: 'w98_note.png',
  'notepad-file': 'w98_notepad_file.png',
  'file-lines': 'w98_file_lines.png',
  network: 'w98_network_normal_two_pcs.png',
  console: 'w98_console_prompt.png',
  gears: 'w98_gears.png',
  settings: 'w98_settings_gear.png',
  mail: 'w98_outlook_express.png',
  envelope: 'w98_envelope_closed.png',
  search: 'w98_magnifying_glass.png',
  help: 'w98_help_book_cool.png',
  key: 'w98_key_win.png',
  shutdown: 'w98_shut_down_normal.png',
  windows: 'w98_windows.png',
  info: 'w98_msg_information.png',
  warning: 'w98_msg_warning.png',
  error: 'w98_msg_error.png',
  question: 'w98_msg_question.png',
  printer: 'w98_printer.png',
  programs: 'w98_program_manager.png',
  hourglass: 'w98_application_hourglass.png',
  paint: 'w98_paint.png',
  recycle: 'w98_recycle_bin_empty.png',
}

const SMALL_VARIANT: Record<string, string> = {
  computer: 'w98_computer-16.png',
  folder: 'w98_directory_closed-16.png',
  'folder-open': 'w98_directory_open-16.png',
  briefcase: 'w98_briefcase-16.png',
  calendar: 'w98_calendar-16.png',
  network: 'w98_network_normal_two_pcs-16.png',
  help: 'w98_help_book_cool-16.png',
  key: 'w98_key_win-16.png',
  settings: 'w98_settings_gear-16.png',
  users: 'w98_users-16.png',
  'users-key': 'w98_users_key-16.png',
  mail: 'w98_outlook_express-16.png',
  'notepad-file': 'w98_notepad_file-16.png',
  printer: 'w98_printer-16.png',
  paint: 'w98_paint-16.png',
  recycle: 'w98_recycle_bin_empty-16.png',
  shutdown: 'w98_shut_down_normal-16.png',
  'sched-tasks': 'w98_directory_sched_tasks-16.png',
}

export function winIconSrc(name: string, size = 32): string {
  if (size <= 16 && SMALL_VARIANT[name]) return `/icons/${SMALL_VARIANT[name]}`
  return `/icons/${ICON_FILES[name] || ICON_FILES['file-lines']}`
}

/** Mapea nombres de Material Symbols (legados) a iconos Win95 reales. */
const MATERIAL_MAP: Record<string, string> = {
  dashboard: 'computer', computer: 'computer', home: 'computer',
  folder: 'folder', folder_off: 'folder', create_new_folder: 'folder',
  drafts: 'envelope', draft: 'file-lines',
  'folder-open': 'folder-open', folder_open: 'folder-open',
  assignment: 'briefcase', briefcase: 'briefcase', work: 'briefcase',
  task_alt: 'check', check: 'check', check_circle: 'check', checklist: 'check',
  done: 'check', save: 'check', keep: 'check',
  calendar_month: 'calendar', calendar_today: 'calendar', event: 'calendar',
  event_available: 'calendar', view_week: 'calendar',
  view_day: 'user-calendar',
  group: 'users', group_remove: 'users', person: 'users', person_add: 'users',
  account_circle: 'users',
  payments: 'calculator', account_balance_wallet: 'calculator',
  request_quote: 'newspaper', newspaper: 'newspaper',
  receipt: 'file-lines', receipt_long: 'file-lines', badge: 'file-lines',
  file: 'notepad-file', file_lines: 'file-lines',
  bar_chart: 'chart', trending_up: 'chart', trending_down: 'chart',
  rebase_edit: 'sched-tasks',
  schedule: 'clock', timer: 'clock', history: 'clock',
  flag: 'dir-check', fitness_center: 'dir-check', repeat: 'dir-check',
  description: 'wordpad',
  edit_note: 'note', notes: 'note', note: 'note',
  electrical_services: 'network', network: 'network', link: 'network',
  add_link: 'network', link_off: 'network', account_tree: 'network',
  terminal: 'console', code: 'console', commit: 'console',
  settings: 'settings', construction: 'gears', tune: 'gears',
  admin_panel_settings: 'users-key',
  notifications: 'mail', notifications_active: 'mail', notifications_off: 'mail',
  mail: 'mail', send: 'mail', forward_to_inbox: 'mail',
  mark_email_unread: 'mail', campaign: 'mail', chat: 'mail',
  search: 'search', center_focus_strong: 'search', open_in_new: 'search',
  find: 'search', manage_search: 'search',
  help: 'help', menu_book: 'help', info: 'info', error: 'error',
  warning: 'warning', pending: 'hourglass', hourglass_empty: 'hourglass',
  progress_activity: 'hourglass', sync: 'hourglass', autorenew: 'hourglass',
  refresh: 'hourglass',
  key: 'key', lock: 'key', lock_reset: 'key', shield: 'key',
  security: 'key', fingerprint: 'key', public: 'network',
  edit: 'paint', auto_fix_high: 'paint',
  printer: 'printer', picture_as_pdf: 'printer', print: 'printer',
  programs: 'programs', dashboard_customize: 'programs',
  delete: 'recycle', delete_sweep: 'recycle', remove_circle: 'recycle',
  content_copy: 'notepad-file',
  view_list: 'file-lines', upload: 'file-lines', upload_file: 'file-lines',
  download: 'file-lines', filter_list: 'file-lines',
  view_kanban: 'folder', view_column: 'folder', grid_view: 'folder',
  movie: 'file-lines', audio_file: 'file-lines', article: 'wordpad',
  table_chart: 'chart', image: 'paint', folder_zip: 'folder', draft: 'file-lines',
  badge: 'file-lines', savings: 'calculator', percent: 'chart',
  emoji_events: 'dir-check', local_fire_department: 'dir-check',
  public: 'network',
  keep_off: 'file-lines', check_box: 'check', radio_button_unchecked: 'file-lines',
  play_arrow: 'check', undo: 'file-lines',
}

export function materialToWinIcon(name?: string | null): string {
  if (!name) return 'file-lines'
  return MATERIAL_MAP[name.trim()] || 'file-lines'
}

/** Icono Win95 por categoría de bloque del planner (reemplaza emojis). */
export const CATEGORY_WIN_ICON: Record<string, string> = {
  trabajo: 'briefcase', work: 'briefcase',
  'foco-profundo': 'check', 'deep-work': 'check',
  administracion: 'file-lines', admin: 'file-lines',
  estudio: 'wordpad', study: 'wordpad',
  gimnasio: 'dir-check', gym: 'dir-check',
  descanso: 'clock', rest: 'clock',
  personal: 'computer',
  reunion: 'users', meeting: 'users',
  creativo: 'paint', creative: 'paint',
  habitos: 'check',
}

export function categoryToWinIcon(cat?: string | null): string {
  if (!cat) return 'file-lines'
  return CATEGORY_WIN_ICON[cat.trim()] || 'file-lines'
}

/** Inverso para la apariencia clásica: clave win -> Material Symbol representativo. */
const INVERSE_MAP: Record<string, string> = {
  computer: 'computer',
  folder: 'folder',
  'folder-open': 'folder_open',
  briefcase: 'assignment',
  check: 'check_circle',
  calendar: 'calendar_month',
  'user-calendar': 'view_day',
  users: 'group',
  'users-key': 'admin_panel_settings',
  calculator: 'payments',
  newspaper: 'request_quote',
  chart: 'bar_chart',
  'sched-tasks': 'rebase_edit',
  clock: 'schedule',
  'dir-check': 'flag',
  wordpad: 'description',
  note: 'edit_note',
  'notepad-file': 'content_copy',
  'file-lines': 'description',
  network: 'electrical_services',
  console: 'terminal',
  gears: 'construction',
  settings: 'settings',
  mail: 'mail',
  envelope: 'drafts',
  search: 'search',
  help: 'help',
  key: 'key',
  shutdown: 'power_settings_new',
  windows: 'apps',
  info: 'info',
  warning: 'warning',
  error: 'error',
  question: 'help',
  printer: 'print',
  programs: 'dashboard_customize',
  hourglass: 'hourglass_empty',
  paint: 'edit',
  recycle: 'delete',
}

export function winToMaterial(name?: string | null): string {
  if (!name) return 'description'
  return INVERSE_MAP[name.trim()] || 'description'
}

export const WIN_ICON_NAMES = Object.keys(ICON_FILES)
