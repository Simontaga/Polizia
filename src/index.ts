import event from "./models/event";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import axios from "axios";

const prisma = new PrismaClient();

let events: event[];
let totalEvents = 0;

const url = "https://polisen.se/api/events";

const main = async () => {
  await getEvents().then(async () => {
    console.log(`Retrived ${events.length} events`);
    totalEvents = events.length;
    await uploadEvents();
    totalEvents = 0;
    console.log("Finished");
  });
};

const uploadEvents = async () => {
  if (events.length < 1) return;
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
      .catch((e) => console.log(`Error occured uploading event: ${e}`));
  }

  console.log(`Progress:${totalEvents - events.length}/${totalEvents}`);
  await uploadEvents();
};

const doesEventExist = async (event_: event) => {
  const result = await prisma.event
    .findUnique({
      where: {
        eventID: event_.id,
      },
    })
    .catch((e) => console.log(`Error in doesEventExist: ${e} `));
  return result !== null;
};

const getEvents = async () => {
  console.log("Retrieving events");

  await axios
    .get<event[]>(url)
    .then((response) => ( events = response.data ))
    .catch((e) => console.log(`Error in getEvents: ${e}`));
};


cron.schedule("*/5 * * * *", async () => {
  console.log("Running cron");
  await main();
});
