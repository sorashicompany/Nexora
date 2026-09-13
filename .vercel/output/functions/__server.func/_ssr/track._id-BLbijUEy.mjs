import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Route$2 } from "./router-S7nrbCDI.mjs";
import { t as ItemDetail } from "./item-detail-MOkvUnk0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/track._id-BLbijUEy.js
var import_jsx_runtime = require_jsx_runtime();
function TrackPage() {
	const { id } = Route$2.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemDetail, {
		kind: "track",
		id
	});
}
//#endregion
export { TrackPage as component };
