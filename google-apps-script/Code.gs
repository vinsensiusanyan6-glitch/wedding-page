/** WEDDING LUXURY - GOOGLE DRIVE PHOTO API
 * Script Properties: API_TOKEN, DRIVE_FOLDER_ID
 */
const SLOTS = ['groom','bride','photo01','photo02','photo03','photo04','photo05','photo06'];
const MAX_BYTES = 8 * 1024 * 1024;
function doGet(){ return json({ok:true,service:'Wedding Photo API'}); }
function doPost(e){
  try {
    const body=JSON.parse(e.postData?.contents||'{}'); authorize_(body.token);
    if(body.action==='photos') return json({ok:true,photos:listPhotos_()});
    if(body.action==='upload') return json(upload_(body));
    if(body.action==='delete') return json(delete_(body));
    throw new Error('Action tidak valid.');
  } catch(err){ return json({ok:false,error:err.message||'Request gagal.'}); }
}
function upload_(body){
  validateSlot_(body.slot);
  if(!body.base64||!body.mimeType) throw new Error('Data foto tidak lengkap.');
  if(!/^image\/(jpeg|png|webp)$/.test(body.mimeType)) throw new Error('Format foto harus JPG, PNG, atau WEBP.');
  const decoded=Utilities.base64Decode(body.base64);
  if(decoded.length>MAX_BYTES) throw new Error('Ukuran maksimal 8 MB.');
  const folder=getFolder_(); removeSlotFiles_(folder,body.slot);
  const file=folder.createFile(Utilities.newBlob(decoded,body.mimeType,`${body.slot}.${extensionFor_(body.mimeType)}`));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
  return {ok:true,slot:body.slot,fileId:file.getId(),url:imageUrl_(file.getId())};
}
function delete_(body){ validateSlot_(body.slot); removeSlotFiles_(getFolder_(),body.slot); return {ok:true,slot:body.slot}; }
function listPhotos_(){
  const files=getFolder_().getFiles(), result={};
  while(files.hasNext()){
    const file=files.next(), match=file.getName().match(/^(groom|bride|photo0[1-6])\.(jpg|jpeg|png|webp)$/i);
    if(match) result[match[1]]=imageUrl_(file.getId());
  }
  return result;
}
function removeSlotFiles_(folder,slot){
  const files=folder.getFiles(), prefix=`${slot}.`;
  while(files.hasNext()){ const file=files.next(); if(file.getName().toLowerCase().startsWith(prefix.toLowerCase())) file.setTrashed(true); }
}
function getFolder_(){ const id=PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID'); if(!id) throw new Error('DRIVE_FOLDER_ID belum diatur di Script Properties.'); return DriveApp.getFolderById(id); }
function authorize_(token){ const expected=PropertiesService.getScriptProperties().getProperty('API_TOKEN'); if(!expected||token!==expected) throw new Error('Unauthorized.'); }
function validateSlot_(slot){ if(SLOTS.indexOf(slot)===-1) throw new Error('Slot foto tidak valid.'); }
function extensionFor_(type){ if(type==='image/png') return 'png'; if(type==='image/webp') return 'webp'; return 'jpg'; }
function imageUrl_(id){ return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w2000`; }
function json(data){ return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
