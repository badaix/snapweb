const host = process.env.REACT_APP_SNAPSERVER_HOST || window.location.host;

let config = {
  baseUrl: (window.location.protocol === "https:" ? "wss://" : "ws://") + host,
};

export { config };
