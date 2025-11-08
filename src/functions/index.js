const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.markFloating = functions.pubsub
  .schedule("every 1 minutes")
  .timeZone("Asia/Bangkok")
  .onRun(async (context) => {
    const db = admin.database();
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    const floorsRef = db.ref("companies/pixel/floors");
    const snapshot = await floorsRef.once("value");

    const updates = {};

    snapshot.forEach((floorSnap) => {
      const floor = floorSnap.val();
      const floorNum = floorSnap.key;

      if (floor.status === "completed" && floor.startTime) {
        const endTime =
          floor.startTime + floor.estimatedDurationMinutes * 60 * 1000;
        if (endTime + fifteenMinutes <= now) {
          updates[`companies/pixel/floors/${floorNum}/status`] = "floating";
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      console.log(
        `✅ Updated ${Object.keys(updates).length} floors to floating`
      );
    }

    return null;
  });
