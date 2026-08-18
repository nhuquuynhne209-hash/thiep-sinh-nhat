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
  googleSheetsWebAppUrl: 'https://script.google.com/macros/s/AKfycbwVzu56GKAlrd-4zHC06pTwVKpKaFYOYhcZyYKeFaKL31iVLxGna2ZecsigD-h-i8d8/exec',
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
  const params = new URLSearchParams(window.location.search);
  const suppliedName = params.get('to');

  const recipient =
    suppliedName?.trim() || 'Bạn và Gia đình';

  const recipientLine = $('#recipientLine');

  recipientLine.innerHTML =
    'Trân trọng kính mời: <strong></strong>';

  recipientLine.querySelector('strong').textContent =
    recipient;

  // Tự điền tên vào form RSVP
  const nameInput = document.querySelector(
    '#rsvpForm input[name="name"]'
  );

  if (nameInput && suppliedName?.trim()) {
    nameInput.value = suppliedName.trim();
  }
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

  if (!form) {
    console.error('Không tìm thấy #rsvpForm');
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Kiểm tra form
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Lấy dữ liệu
    const formData = new FormData(form);

    const guest =
      formData.get('name')?.toString().trim() || '';

    const response =
      formData.get('response')?.toString().trim() || '';

    const guestMessage =
      formData.get('message')?.toString().trim() || '';

    const page = window.location.href;

    // Kiểm tra dữ liệu trước khi gửi
    console.log('===== RSVP =====');
    console.log('guest:', guest);
    console.log('response:', response);
    console.log('message:', guestMessage);
    console.log('page:', page);
    console.log(
      'Web App:',
      invitationConfig.googleSheetsWebAppUrl
    );

    if (!invitationConfig.googleSheetsWebAppUrl) {
      console.error('Chưa có URL Google Apps Script');
      if (message) {
        message.textContent =
          'Chưa cấu hình kết nối Google Sheet.';
      }
      return;
    }

    // Tạo một form tạm để POST trực tiếp tới Google Apps Script
    const submitForm = document.createElement('form');

    submitForm.method = 'POST';
    submitForm.action =
      invitationConfig.googleSheetsWebAppUrl;

    submitForm.target = 'rsvpSubmitFrame';
    submitForm.style.display = 'none';

    // Thêm dữ liệu
    const fields = {
      guest: guest,
      response: response,
      message: guestMessage,
      page: page
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');

      input.type = 'hidden';
      input.name = name;
      input.value = value;

      submitForm.appendChild(input);
    });

    // Tạo iframe ẩn để nhận response
    let iframe = document.getElementById(
      'rsvpSubmitFrame'
    );

    if (!iframe) {
      iframe = document.createElement('iframe');

      iframe.id = 'rsvpSubmitFrame';
      iframe.name = 'rsvpSubmitFrame';

      iframe.style.display = 'none';

      document.body.appendChild(iframe);
    }

    document.body.appendChild(submitForm);

    // Disable nút gửi nếu có
    const submitButton =
      form.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = 'ĐANG GỬI...';
    }

    if (message) {
      message.textContent = 'ĐANG GỬI...';
    }

    // Gửi
    submitForm.submit();

    // Google Apps Script xử lý rất nhanh,
    // chờ một chút rồi báo thành công.
    setTimeout(() => {

      if (message) {
        message.textContent =
          'Cảm ơn bạn! Xác nhận của bạn đã được gửi đến Quỳnh. ♡';

        message.classList.remove('success');

        void message.offsetWidth;

        message.classList.add('success');
      }

      form.reset();

      if (submitButton) {
        submitButton.disabled = false;

        submitButton.innerHTML =
          'GỬI XÁC NHẬN <span>✦</span>';
      }

      // Xóa form tạm
      submitForm.remove();

    }, 1500);
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
