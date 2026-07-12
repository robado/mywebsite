const bcrypt = require("bcrypt");

async function main() {
    const hash = await bcrypt.hash("robado", 10);

    console.log(hash);
}

main();