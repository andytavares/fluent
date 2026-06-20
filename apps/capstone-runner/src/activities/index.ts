import { provision } from "./provisioner.js";
import { verify } from "./verifier.js";
import { teardown, recordStepCompletion } from "./session.js";

export { provision, verify, teardown, recordStepCompletion };

export function createActivities() {
  return { provision, verify, teardown, recordStepCompletion };
}
