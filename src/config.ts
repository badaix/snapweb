const host = import.meta.env.VITE_SNAPSERVER_HOST || window.location.host;

const config = {
  baseUrl: (window.location.protocol === "https:" ? "wss://" : "ws://") + host,
};

export { config };
