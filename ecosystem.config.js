module.exports = {
    apps: [
        {
            name: 'minecraft-panel',
            script: 'dist/index.js',
            instances: 'max',
            exec_mode: 'cluster',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
