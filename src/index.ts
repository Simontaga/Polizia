import event from "./models/event";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();

let events: event[];

const url = 'https://polisen.se/api/events';

const main = async () => {
  await getEvents().then(async () => {
    await uploadEvents();
  });
};

const uploadEvents = async () => {
  if (events.length >= 1) {
    const event_ = events.shift();
    if (event_ && !(await doesEventExist(event_))) {
      await prisma.event
        .create({
          data: {
            eventID: event_.id,
            datetime: new Date(event_.datetime),
            name: event_.name,
            summary: event_.summary,
            url: event_.url,
            type: event_.type,
            locationName: event_.location.name,
            locationGps: event_.location.gps,
          },
        })
        .then(async () => {
          await uploadEvents();
        });
    }
  }
};

const doesEventExist = async (event_: event) => {
  const result = await prisma.event.findFirst({
    where: {
      eventID: event_.id,
    },
  });

  return result !== null;
};

const getEvents = async () => {
  await fetch(url)
    .then((response) => response.json())
    .then((json) => {
      events = json;
    });
};


// Run every 3 hours
cron.schedule(`0 */3 * * *`, async () => {
  console.log('Running cron task');
  await main();
});
