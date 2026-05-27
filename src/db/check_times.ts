import { db } from "./index";
import { session, user } from "./schema";

async function main() {
  try {
    const sessions = await db.select().from(session);
    console.log("ACTIVE SESSIONS:", sessions.length);
    for (const s of sessions) {
      const u = await db.query.user.findFirst({
        where: (users, { eq }) => eq(users.id, s.userId),
      });
      console.log(`Session ID: ${s.id}`);
      console.log(`  User: ${u?.name} (${u?.email}), ID: ${s.userId}`);
      console.log(`  Expires At: ${s.expiresAt}`);
    }
    process.exit(0);
  } catch (err: any) {
    console.error(err);
    process.exit(1);
  }
}

main();
