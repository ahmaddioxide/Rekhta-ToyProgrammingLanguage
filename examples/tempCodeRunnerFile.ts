nst args = process.argv.slice(2);

if (!args) throw new Error("Please provide a example name");

run(args[0]);