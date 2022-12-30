module.exports = {
  apps: [
    {
      name: "vita-facturatie",
      script: "yarn",
      args: "start",
      env: {
        NODE_ENV: "production"
      },
      max_memory_restart: "500M"
    }
  ]
};