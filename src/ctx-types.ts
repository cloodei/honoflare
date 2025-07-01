import { type Hyperdrive } from "@cloudflare/workers-types";

export type Ctx = {
  Bindings: {
    HYPERDRIVE: Hyperdrive;
  };
}
