const express = require("express");
const app = express();
const cors = require("cors");
const port = 333;

app.use(cors());
const FILE_SIZE = 100 * 1024 * 1024; // (100MB)
const PAYLOAD_CHUNK = Buffer.alloc(1024 * 1024, "0123456789abcdef");

app.get("/download", (req, res) => {
  res.set({
    "Content-Type": "application/octet-stream",
    "Content-Disposition": 'attachment; filename="testfile.bin"',
    "Content-Length": FILE_SIZE,
    "Accept-Ranges": "none",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  let bytesSent = 0;

  const sendChunk = () => {
    const startTime = performance.now();
    while (bytesSent < FILE_SIZE) {
      const remaining = FILE_SIZE - bytesSent;
      const chunkSize = Math.min(PAYLOAD_CHUNK.length, remaining);

      if (res.write(PAYLOAD_CHUNK.subarray(0, chunkSize))) {
        bytesSent += chunkSize;
      } else {
        bytesSent += chunkSize;
        console.log("Backpressure detected. Pausing write stream.");
        res.once("drain", sendChunk);
        return;
      }
    }
    const endTime = performance.now();
    const speedEstimation = FILE_SIZE / (1024 * 1024);
    console.log(speedEstimation);
    console.log(endTime - startTime);
    res.end();
  };

  sendChunk();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
