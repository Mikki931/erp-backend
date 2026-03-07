const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../controllers');
fs.readdirSync(dir).forEach(file=>{
  const fp=path.join(dir,file);
  let txt=fs.readFileSync(fp,'utf8');
  const newtxt=txt.replace(/res\.status\(500\)\.json\(\{[\s\S]*?message:\s*"Some error occurred"[\s\S]*?\}\);/g,'sendError(res, err);');
  if(txt!==newtxt){
    fs.writeFileSync(fp,newtxt,'utf8');
    console.log('patched',file);
  }
});
