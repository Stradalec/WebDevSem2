const { Kafka } = require('kafkajs');
const { processImage } = require('./imageProcessor');
const { Course, Lesson } = require('./models');

function createKafka() {
  const broker = process.env.KAFKA_BROKER || 'localhost:9092';

  return new Kafka({
    clientId: 'image-worker',
    brokers: [broker],
  });
}

async function updateImageStatus(payload) {
  const { entityType, entityId, filename } = payload;

  if (entityType === 'course') {
    const course = await Course.findById(entityId);

    if (!course) {
      throw new Error(`Course not found: ${entityId}`);
    }

    if (!course.cover || course.cover.url !== filename) {
      throw new Error(`Course cover not found for filename: ${filename}`);
    }

    course.cover.status = 'ready';
    await course.save();

    return;
  }

  if (entityType === 'lesson') {
    const lesson = await Lesson.findById(entityId);

    if (!lesson) {
      throw new Error(`Lesson not found: ${entityId}`);
    }

    const image = lesson.images.find((item) => item.url === filename);

    if (!image) {
      throw new Error(`Lesson image not found for filename: ${filename}`);
    }

    image.status = 'ready';
    await lesson.save();

    return;
  }

  throw new Error(`Unknown entityType: ${entityType}`);
}

async function startKafkaWorker() {
  const kafka = createKafka();

  const consumer = kafka.consumer({
    groupId: 'image-worker-group',
  });

  const producer = kafka.producer();

  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({
    topic: 'image.uploaded',
    fromBeginning: false,
  });

  console.log('[kafka] consumer subscribed to image.uploaded');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const rawValue = message.value ? message.value.toString() : null;

      if (!rawValue) {
        console.log('[kafka] empty message skipped');
        return;
      }

      const payload = JSON.parse(rawValue);

      console.log('[kafka] received image.uploaded:', payload);

      await processImage(payload.originalPath, payload.filename);
      await updateImageStatus(payload);

      const processedPayload = {
        ...payload,
        status: 'ready',
        processedAt: new Date().toISOString(),
      };

      await producer.send({
        topic: 'image.processed',
        messages: [
          {
            key: `${payload.entityType}:${payload.entityId}`,
            value: JSON.stringify(processedPayload),
          },
        ],
      });

      console.log('[kafka] sent image.processed:', processedPayload);
    },
  });
}

module.exports = {
  startKafkaWorker,
};