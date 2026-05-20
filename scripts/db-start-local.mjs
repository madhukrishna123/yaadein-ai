import { spawnSync } from "node:child_process";

const containerName = "yaadein-ai-postgres";
const image = "postgres:16-alpine";
const databaseUrl = "postgres://yaadein:yaadein@127.0.0.1:54329/yaadein";

function run(command, args) {
  return spawnSync(command, args, { encoding: "utf8", stdio: "pipe" });
}

const existing = run("docker", ["ps", "-a", "--filter", `name=${containerName}`, "--format", "{{.Names}}"]);

if (existing.status !== 0) {
  console.error("Docker is not running. Start Docker Desktop, then run this script again.");
  process.exit(1);
}

if (existing.stdout.trim() === containerName) {
  const started = run("docker", ["start", containerName]);
  if (started.status !== 0) {
    console.error(started.stderr || started.stdout);
    process.exit(started.status ?? 1);
  }
  console.log(`Started existing container: ${containerName}`);
} else {
  const created = run("docker", [
    "run",
    "--name",
    containerName,
    "-e",
    "POSTGRES_USER=yaadein",
    "-e",
    "POSTGRES_PASSWORD=yaadein",
    "-e",
    "POSTGRES_DB=yaadein",
    "-p",
    "54329:5432",
    "-d",
    image
  ]);

  if (created.status !== 0) {
    console.error(created.stderr || created.stdout);
    process.exit(created.status ?? 1);
  }
  console.log(`Created container: ${containerName}`);
}

console.log(`DATABASE_URL=${databaseUrl}`);
