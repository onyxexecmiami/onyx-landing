/**
 * Onyx Executive Miami - receives ride requests from the website calculator.
 * Every request becomes a row in the Google Sheet and an email to NOTIFY_EMAIL.
 * Setup: docs/lead-capture/README.md
 */
var NOTIFY_EMAIL = 'info@onyxexecmiami.com';
var SHEET_ID = '';            // empty: the spreadsheet this script is attached to; otherwise the id of the sheet to write to
var SHEET_NAME = 'Requests';
var HEADERS = ['Received', 'Status', 'Service', 'Name', 'Phone', 'Email', 'Pickup', 'Drop-off', 'Hours', 'Address',
  'Date', 'Time', 'Return date', 'Return time', 'Passengers', 'Flight', 'Quoted total ($)', 'Late night', 'Notes', 'Language', 'Page'];

function doPost(e) {
  var p;
  try { p = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'bad json' }); }
  if (!p || !p.name || !p.phone || !p.email || !p.date || !p.time) { return out_({ ok: false, error: 'missing fields' }); }

  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); }
  var service = p.service === 'hourly' ? 'Hourly' : (p.returnTrip ? 'Round trip' : 'Transfer');
  sh.appendRow([new Date(), 'New', service, s_(p.name), s_(p.phone), s_(p.email), s_(p.pickup), s_(p.dropoff), s_(p.hours), s_(p.address),
    s_(p.date), s_(p.time), s_(p.returnDate), s_(p.returnTime), s_(p.passengers), s_(p.flight), Number(p.quotedFare) || '',
    p.lateNight ? 'yes' : '', s_(p.notes), s_(p.lang), s_(p.page)]);

  var route = p.service === 'hourly'
    ? 'By the hour: ' + s_(p.hours) + ' h from ' + s_(p.pickup)
    : s_(p.pickup) + ' → ' + s_(p.dropoff) + (p.returnTrip ? ' (+ return)' : '');
  var subject = service + ' request: ' + route + ' · ' + s_(p.date) + ' ' + s_(p.time) + ' · $' + s_(p.quotedFare);
  var lines = [
    'Service: ' + service,
    'Quoted total: $' + s_(p.quotedFare) + (p.lateNight ? ' (incl. late-night supplement)' : ''),
    'Route: ' + route,
    'Address: ' + (s_(p.address) || '-'),
    'When: ' + s_(p.date) + ' ' + s_(p.time) + ' · passengers: ' + s_(p.passengers)
  ];
  if (p.returnTrip) { lines.push('Return: ' + s_(p.returnDate) + ' ' + s_(p.returnTime)); }
  lines.push('Flight / vessel: ' + (s_(p.flight) || '-'), '', 'Name: ' + s_(p.name), 'Phone: ' + s_(p.phone), 'Email: ' + s_(p.email),
    'Notes: ' + (s_(p.notes) || '-'), '', 'Site language: ' + s_(p.lang) + ' · page: ' + s_(p.page));
  MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, body: lines.join('\n'), replyTo: s_(p.email), name: 'Onyx site requests' });
  return out_({ ok: true });
}

function doGet() { return out_({ ok: true, service: 'onyx-lead-capture' }); }

// Strip leading =,+,-,@ so a submitted value cannot run as a spreadsheet formula; cap length.
function s_(v) {
  v = (v === undefined || v === null) ? '' : String(v).slice(0, 500);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
