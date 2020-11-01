(window => {
  if (!window.App && window.appData) {
    window.location.reload();
    return;
  }

  if (window.App) {
    if (window.App.convos) {
      if (window.App.convos.pager.hasNext) {
        window.location.href = `${
          window.App.convos.pager.baseURL
        }1/${
          window.App.convos.pager.total
        }/`;
        return;
      }

      window.postMessage({
        type: 'is-out-of-sync-at-fetch-time',
        data: window.App.convos.isOutOfSyncAtFetchTime
      }, '*');
    }
  }

  async function sendTickets(): Promise<void> {
    if (window.App) {
      if (window.App.convos) {
        const convos = window.App.convos.models;

        if (Object.entries(convos).length) {
          window.postMessage({
            type: 'tickets',
            data: JSON.parse(JSON.stringify(convos))
          }, '*');
        } else {
          window.postMessage({
            type: 'huzzah'
          }, '*');
        }
      }
    }
  }

  window.addEventListener('message', ({ data: { type } }) => {
    if (type === 'send-tickets') {
      sendTickets();
    }
  });

  sendTickets();
})(window);
