var client=require("./client");
var constring="postgres:postgres@127.0.0.1:5432/postgres";
client.client(constring);
client.query();
