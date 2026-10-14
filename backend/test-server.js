const http = require("http");

console.log("Checking if backend server is responsive on port 5000...");

const req = http.get("http://localhost:5000/api/health", (res) => {
  let rawData = "";
  res.on("data", (chunk) => { rawData += chunk; });
  res.on("end", () => {
    console.log("Response Status:", res.statusCode);
    console.log("Response Body:", rawData);
    process.exit(0);
  });
});

req.on("error", (e) => {
  console.log("Server not currently running on port 5000:", e.message);
  process.exit(1);
});
