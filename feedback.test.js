/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

function loadPage() {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  document.documentElement.innerHTML = html;
  // Re-run the inline IIFE that wires up event listeners
  const scripts = document.querySelectorAll('script:not([src])');
  scripts.forEach((s) => {
    try { eval(s.textContent); } catch (_) {}
  });
}

beforeEach(() => {
  loadPage();
});

test('feedback button is present in the DOM', () => {
  const btn = document.getElementById('feedback-btn');
  expect(btn).not.toBeNull();
  expect(btn.tagName).toBe('BUTTON');
});

test('feedback modal is hidden by default', () => {
  const modal = document.getElementById('feedback-modal');
  expect(modal.classList.contains('open')).toBe(false);
});

test('clicking feedback button opens the modal', () => {
  const btn = document.getElementById('feedback-btn');
  const modal = document.getElementById('feedback-modal');
  btn.click();
  expect(modal.classList.contains('open')).toBe(true);
});

test('clicking close button closes the modal', () => {
  const btn = document.getElementById('feedback-btn');
  const modal = document.getElementById('feedback-modal');
  const closeBtn = document.getElementById('feedback-close');
  btn.click();
  expect(modal.classList.contains('open')).toBe(true);
  closeBtn.click();
  expect(modal.classList.contains('open')).toBe(false);
});

test('submitting empty feedback does not show success message', () => {
  const btn = document.getElementById('feedback-btn');
  const submitBtn = document.getElementById('feedback-submit');
  const success = document.getElementById('feedback-success');
  btn.click();
  document.getElementById('feedback-text').value = '';
  submitBtn.click();
  expect(success.style.display).not.toBe('block');
});

test('submitting non-empty feedback shows success message', () => {
  const btn = document.getElementById('feedback-btn');
  const submitBtn = document.getElementById('feedback-submit');
  const success = document.getElementById('feedback-success');
  btn.click();
  document.getElementById('feedback-text').value = 'Skvělá stránka!';
  submitBtn.click();
  expect(success.style.display).toBe('block');
});

test('clicking outside the modal box closes the modal', () => {
  const btn = document.getElementById('feedback-btn');
  const modal = document.getElementById('feedback-modal');
  btn.click();
  expect(modal.classList.contains('open')).toBe(true);
  // Simulate click on modal overlay (not the inner box)
  const event = new MouseEvent('click', { bubbles: true });
  Object.defineProperty(event, 'target', { value: modal });
  modal.dispatchEvent(event);
  expect(modal.classList.contains('open')).toBe(false);
});
