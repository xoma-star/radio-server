import {DocumentStore, IAuthOptions} from 'ravendb'
import * as fs from "fs";
import * as path from "path";

const certificate = path.resolve(__dirname, "local.pfx");

const authOptions: IAuthOptions = {
    certificate: fs.readFileSync(certificate),
    type: "pfx"
}

const store = new DocumentStore('https://a.free.xoma-star.ravendb.cloud', 'serenity', authOptions)
store.initialize()
const session = store.openSession()
export default session
