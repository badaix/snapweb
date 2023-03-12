let config = {
    baseUrl: (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host
}

export { config };
