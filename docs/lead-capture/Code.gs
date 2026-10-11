/**
 * Onyx Executive Miami — приём заявок с калькулятора на сайте.
 * Каждая заявка: новая строка в таблице + письмо на NOTIFY_EMAIL.
 * Инструкция по установке: lead-capture/README.md
 */
var NOTIFY_EMAIL = 'info@onyxexecmiami.com';
var SHEET_NAME = 'Requests';
var HEADERS = ['Received', 'Status', 'Name', 'Phone', 'Email', 'Pickup', 'Drop-off', 'Address', 'Date', 'Time',
  'Passengers', 'Flight', 'Quoted fare ($)', 'Late night', 'Notes', 'Page'];

function doPost(e) {
  var p;
  try { p = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'bad json' }); }
  if (!p || !p.name || !p.phone || !p.email || !p.date || !p.time) { return out_({ ok: false, error: 'missing fields' }); }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); }
  sh.appendRow([new Date(), 'New', s_(p.name), s_(p.phone), s_(p.email), s_(p.pickup), s_(p.dropoff), s_(p.address),
    s_(p.date), s_(p.time), s_(p.passengers), s_(p.flight), Number(p.quotedFare) || '', p.lateNight ? 'yes' : '', s_(p.notes), s_(p.page)]);

  var subject = 'New ride request: ' + s_(p.pickup) + ' → ' + s_(p.dropoff) + ' · ' + s_(p.date) + ' ' + s_(p.time) + ' · $' + s_(p.quotedFare);
  var body = [
    'Quoted fare: $' + s_(p.quotedFare) + (p.lateNight ? ' (incl. late-night supplement)' : ''),
    'Route: ' + s_(p.pickup) + ' → ' + s_(p.dropoff),
    'Address: ' + (s_(p.address) || '-'),
    'When: ' + s_(p.date) + ' ' + s_(p.time) + ' · passengers: ' + s_(p.passengers),
    'Flight / vessel: ' + (s_(p.flight) || '-'),
    '',
    'Name: ' + s_(p.name),
    'Phone: ' + s_(p.phone),
    'Email: ' + s_(p.email),
    'Notes: ' + (s_(p.notes) || '-'),
    '',
    'Page: ' + s_(p.page)
  ].join('\n');
  MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, body: body, replyTo: s_(p.email), name: 'Onyx site requests' });
  return out_({ ok: true });
}

function doGet() { return out_({ ok: true, service: 'onyx-lead-capture' }); }

// Strip leading =,+,-,@ so a submitted value cannot run as a spreadsheet formula; cap length.
function s_(v) {
  v = (v === undefined || v === null) ? '' : String(v).slice(0, 500);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
