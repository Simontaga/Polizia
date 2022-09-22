import event from "./models/event";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

let events: event[];

const url = "https://polisen.se/api/events";

const getEvents = async () => {
  await fetch(url)
    .then((response) => response.json())
    .then((json) => {
      events = json;
    });
};

const main = async () => {
  await getEvents();
  await uploadEvents();

  /*setTimeout(async () => {
    await getEvents();
    await uploadEvents();
  }, 120 * 100); */
};

const uploadEvents = async () => {
  if (events.length >= 1) {
    const event_ = events.shift();
    if (event_ && !await doesEventExist(event_)) {
      const result = await prisma.event
        .create({
          data: {
            id: event_.id,
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
      id: event_.id,
    },
  });

  return result !== null;
};

main();
