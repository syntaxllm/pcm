export function log(event, data = {}) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      event,
      ...data
    })
  );
}
