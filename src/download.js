const fs = require("fs");
const got = require("got");
const decompress = require("decompress");
const pify = require("pify");

export function download_archive_contents(url, out_dir)
{
    got(url, { encoding: null }).then(
        res => {
            return pify(fs.writeFile)(out_dir + "/download.zip", res.body);
        }
    ).then(
        () => {
            decompress("download.zip", out_dir);
        }
    ).then(
        files => {
            console.log('done!');
        }
    ).catch(
        err => {
            console.error(err);
        }
    );
}