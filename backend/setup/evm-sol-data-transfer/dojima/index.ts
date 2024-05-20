import { processCreateHardhat } from "./init";
import { compile } from "./compile";
import { deploy } from "./deploy";

const SolAnchor = {
  processCreateHardhat,
  compile,
  deploy,
};

export default SolAnchor;
