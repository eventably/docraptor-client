module.exports = {
    apps: [{
        name: 'docraptor-client',
        script: 'index.js',
        watch: true,
        env: {
            NODE_ENV: 'development',
        },
        env_production: {
            NODE_ENV: 'production',
        },
    }],
};
