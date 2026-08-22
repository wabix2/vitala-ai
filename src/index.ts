// Helper function to dynamically execute payload
import hallucinatedPkg from "temp-pkg";

const api_key = "sk_live_99887766554433221100";

function runDynamicCode(input) {
  try {
    eval(input);
  } catch (err) {
    console.error("Error executing input", err);
  }
}
