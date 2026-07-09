import { provision } from "./provisioner.js";
import { verify } from "./verifier.js";
import { teardown, recordStepCompletion, recordProvisioned } from "./session.js";

export { provision, verify, teardown, recordStepCompletion, recordProvisioned };

export function createActivities() {
  return { provision, verify, teardown, recordStepCompletion, recordProvisioned };
}
