/**
 * LibaraNHS - Dashboard JavaScript
 * Dashboard-specific functionality
 */

// File upload drag and drop
const dropZones = document.querySelectorAll('[data-drop-zone]');

dropZones.forEach(zone => {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    zone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    zone.addEventListener(eventName, () => {
      zone.classList.add('border-primary', 'bg-primary/5');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    zone.addEventListener(eventName, () => {
      zone.classList.remove('border-primary', 'bg-primary/5');
    }, false);
  });

  zone.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    const input = zone.querySelector('input[type="file"]');

    if (input && files.length > 0) {
      input.files = files;
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    }
  }
});

// Real-time search/filter
function filterTable(searchInput, tableId) {
  const input = document.getElementById(searchInput);
  const table = document.getElementById(tableId);

  if (!input || !table) return;

  input.addEventListener('keyup', debounce(function() {
    const filter = this.value.toLowerCase();
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const text = row.textContent.toLowerCase();

      if (text.includes(filter)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  }, 300));
}

// Confirm dialogs
function confirmAction(message, callback) {
  if (confirm(message)) {
    callback();
  }
}

// Status badge color mapping
const statusColors = {
  pending: 'badge-warning',
  submitted: 'badge-success',
  failed: 'badge-danger',
  withdrawn: 'badge-info'
};

// Update stats dynamically
function updateDashboardStats() {
  fetch('/api/dashboard/stats')
    .then(response => response.json())
    .then(data => {
      // Update stats cards
      document.querySelectorAll('[data-stat]').forEach(el => {
        const stat = el.dataset.stat;
        if (data[stat] !== undefined) {
          el.textContent = data[stat];
        }
      });
    })
    .catch(error => console.error('Error fetching stats:', error));
}

// Auto-refresh stats every 5 minutes
setInterval(updateDashboardStats, 5 * 60 * 1000);

// Chart initialization (placeholder for future implementation)
function initializeChart(canvasId, data) {
  // This would integrate with Chart.js or similar library
  console.log('Chart initialization:', canvasId, data);
}

// Skills tag input
function initializeSkillsInput(inputId, tagsContainerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(tagsContainerId);

  if (!input || !container) return;

  const tags = [];

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = input.value.trim();

      if (value && !tags.includes(value)) {
        tags.push(value);
        renderTag(value);
        input.value = '';
      }
    }
  });

  function renderTag(tag) {
    const tagEl = document.createElement('span');
    tagEl.className = 'badge badge-info mr-2 mb-2 inline-flex items-center';
    tagEl.innerHTML = `
      ${tag}
      <button type="button" class="ml-2 text-sm" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(tagEl);
  }
}

// File size validation
function validateFileSize(input, maxSizeMB = 5) {
  const file = input.files[0];

  if (file) {
    const sizeMB = file.size / (1024 * 1024);

    if (sizeMB > maxSizeMB) {
      alert(`File size exceeds ${maxSizeMB}MB limit`);
      input.value = '';
      return false;
    }

    // Show file name
    const fileName = document.createElement('p');
    fileName.className = 'text-sm text-slate-600 mt-2';
    fileName.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;

    const existing = input.parentElement.querySelector('.file-name');
    if (existing) existing.remove();

    fileName.className += ' file-name';
    input.parentElement.appendChild(fileName);
  }

  return true;
}

// Handle file input changes
document.querySelectorAll('input[type="file"]').forEach(input => {
  input.addEventListener('change', () => {
    validateFileSize(input);
  });
});

// Initialize tooltips
function initializeTooltips() {
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip hidden absolute bg-slate-800 text-white text-xs rounded py-1 px-2 z-50';
    tooltip.textContent = el.dataset.tooltip;

    el.addEventListener('mouseenter', () => {
      document.body.appendChild(tooltip);
      const rect = el.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
      tooltip.classList.remove('hidden');
    });

    el.addEventListener('mouseleave', () => {
      tooltip.remove();
    });
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeTooltips();
});
