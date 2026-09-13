import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Route$5 } from "./router-S7nrbCDI.mjs";
import { t as ItemDetail } from "./item-detail-MOkvUnk0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/beat._id-50P4HQSq.js
var import_jsx_runtime = require_jsx_runtime();
function BeatPage() {
	const { id } = Route$5.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemDetail, {
		kind: "beat",
		id
	});
}
//#endregion
export { BeatPage as component };
