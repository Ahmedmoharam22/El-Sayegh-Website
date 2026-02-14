module.exports = {
  apps: [{
    name: "el-sayigh-backend", // اسم المشروع اللي هيظهر  السيرفر
    script: "./server.js",   
    env: {
      NODE_ENV: "production",
      PORT: 5000                
    }
  }]
}