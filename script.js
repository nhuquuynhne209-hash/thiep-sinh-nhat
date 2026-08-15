/*
  CHỈNH SỬA THIỆP TẠI ĐÂY: tất cả dữ liệu chính của website nằm trong config này.
  Để thay ảnh/nhạc, chép file vào assets/images hoặc assets/music rồi đổi đường dẫn tương ứng.
*/
const invitationConfig = {
  personName: 'Lê Võ Như Quỳnh',
  birthdayDate: '2026-08-24T18:30:00+07:00',
  eventDate: '24 / 08 / 2026',
  eventTime: '18:30',
  locationName: 'JuJu Station',
  address: 'JuJu Station, TP. Hồ Chí Minh',
  dressCode: 'Free Style',
  googleMapsUrl: 'https://maps.google.com/?q=JuJu+Station',
  // Dán URL Web App Google Apps Script (có đuôi /exec) vào giữa dấu nháy đơn.
  googleSheetsWebAppUrl: 'https://script.google.com/macros/s/AKfycbyt7k-EKP8SoZPGEg3HUeysTNZUf41u7uet3cWk7LL0KBZOSSpMLT9DfJvRuJB0-_KB/exec',
  personImage: 'assets/images/anh_hinh_nen_Quynh.jpg',
  music: 'assets/music/Khi 22.mp3',
  personalNote: 'Sự hiện diện của bạn là niềm vui và là món quà tuyệt vời nhất dành cho Quỳnh trong cột mốc tuổi 22 này. Hãy đến cùng chung vui và ghi dấu những khoảnh khắc thật đẹp nhé!'
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function fillInvitation() {
  $$('[data-config]').forEach((element) => {
    const value = element.dataset.config === 'eventDateTime'
      ? `${invitationConfig.eventTime} · ${invitationConfig.eventDate}`
      : invitationConfig[element.dataset.config];
    if (value) element.textContent = value;
  });
  document.title = `${invitationConfig.personName} — Birthday Celebration`;
  $('#personImage').src = invitationConfig.personImage;
  $('#personImage').alt = invitationConfig.personName;
  $('#directionsLink').href = invitationConfig.googleMapsUrl;
  $('#backgroundMusic').src = invitationConfig.music;
}

// Cá nhân hoá người nhận qua URL: ?to=Anh+Nam hoặc ?to=Bạn+Phương.
function setRecipientName() {
  const suppliedName = new URLSearchParams(window.location.search).get('to');
  const recipient = suppliedName?.trim() || 'Bạn và Gia đình';
  const recipientLine = $('#recipientLine');
  recipientLine.innerHTML = 'Trân trọng kính mời: <strong></strong>';
  recipientLine.querySelector('strong').textContent = recipient;
}

function startCountdown() {
  const target = new Date(invitationConfig.birthdayDate).getTime();
  const fields = { days: $('#days'), hours: $('#hours'), minutes: $('#minutes'), seconds: $('#seconds') };
  const update = () => {
    let remaining = target - Date.now();
    if (remaining <= 0) {
      Object.values(fields).forEach((field) => { field.textContent = '00'; });
      $('#celebrationBegun').hidden = false;
      return;
    }
    const units = [['days', 86400000], ['hours', 3600000], ['minutes', 60000], ['seconds', 1000]];
    units.forEach(([name, milliseconds]) => {
      const value = Math.floor(remaining / milliseconds);
      fields[name].textContent = String(value).padStart(2, '0');
      remaining %= milliseconds;
    });
  };
  update();
  setInterval(update, 1000);
}

function setupOpening() {
  $('#openInvitation').addEventListener('click', () => {
    $('#opening').classList.add('is-open');
    setTimeout(() => $('#invitation').querySelector('.reveal')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  });
}

function setupMusic() {
  const audio = $('#backgroundMusic');
  const button = $('#musicToggle');
  button.addEventListener('click', async () => {
    try {
      if (audio.paused) {
        await audio.play();
        button.classList.add('is-playing');
        button.textContent = '♫';
        button.setAttribute('aria-label', 'Tắt nhạc');
        button.setAttribute('aria-pressed', 'true');
      } else {
        audio.pause();
        button.classList.remove('is-playing');
        button.textContent = '♩';
        button.setAttribute('aria-label', 'Bật nhạc');
        button.setAttribute('aria-pressed', 'false');
      }
    } catch {
      button.textContent = '♩';
      button.setAttribute('aria-label', 'Chưa tìm thấy file nhạc');
    }
  });
}

function setupRsvp() {
  const form = $('#rsvpForm');
  const message = $('#formMessage');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    // Lưu tạm trên trình duyệt hiện tại. Có thể thay đoạn này bằng fetch API tới Google Sheets/Firebase.
    try {
      const rsvpEntries = JSON.parse(localStorage.getItem('quynhBirthdayRsvp') || '[]');
      rsvpEntries.push({ ...data, submittedAt: new Date().toISOString() });
      localStorage.setItem('quynhBirthdayRsvp', JSON.stringify(rsvpEntries));
    } catch { /* localStorage unavailable: RSVP still shows success */ }
    message.textContent = 'Cảm ơn bạn! Quỳnh rất mong được gặp bạn trong buổi tiệc. ♡';
    message.classList.remove('success');
    void message.offsetWidth;
    message.classList.add('success');
    form.reset();
  });
}

function setupReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.classList.remove('is-scrolling-focus');
        // Re-add class để animation chạy lại mượt mà khi người xem lướt tới khối này.
        requestAnimationFrame(() => entry.target.classList.add('is-scrolling-focus'));
      } else {
        entry.target.classList.remove('is-scrolling-focus');
      }
    });
  }, { threshold: 0.18 });
  $$('.reveal').forEach((element) => observer.observe(element));
}

fillInvitation();
setRecipientName();
startCountdown();
setupOpening();
setupMusic();
setupRsvp();
setupReveals();
