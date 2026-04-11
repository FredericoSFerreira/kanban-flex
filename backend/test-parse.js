const Parse = require('parse/node');
Parse.initialize('kanbanflex', 'kanbanflex');
Parse.serverURL = 'http://localhost:1337/parse';

async function test() {
  try {
    const q = new Parse.Query("boards");
    const board = await q.first();
    if (!board) return console.log("no board");
    console.log("Original visibility type:", typeof board.get("visibility"), board.get("visibility"));
    
    board.set("visibility", "private");
    await board.save(null, {useMasterKey: true});
    console.log("Saved successfully!");
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
