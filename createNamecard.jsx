// // 변수 설정
// var projectPath = arguments[0];

// var person = {};
// person.key = arguments[1];
// person.code = arguments[2];
// person.qrcode = arguments[3];

// var templateFile = new File(projectPath + "/templates/template.ai");

// createNamecard(person);

// function createNamecard(person) {
//   try {
//     // dist 폴더 확인 및 생성
//     var distFolderPath = projectPath + "/dist/";
//     var distFolder = new Folder(distFolderPath);
//     if (!distFolder.exists) {
//       distFolder.create();
//     }

//     var filePath = distFolderPath + person.qrcode + ".ai";
//     var outlineFilePath = distFolderPath + person.qrcode + ".ai";

//     // 템플릿 파일 확인
//     if (!templateFile.exists) {
//       throw new Error("Template file not found: " + templateFile.fsName);
//     }

//     // 템플릿 열기 및 저장
//     var document = app.open(templateFile);
//     document.saveAs(new File(filePath));

//     // front 레이어 선택
//     var frontLayer = document.layers.getByName("front");
//     if (!frontLayer) {
//       throw new Error("Layer 'front' not found in template.");
//     }

//     // key, code, qrcode 항목만 대치
//     var keyItem = frontLayer.pageItems.getByName("key");
//     var codeItem = frontLayer.pageItems.getByName("code");
//     var qrcodeItem = frontLayer.pageItems.getByName("qrcode");

//     if (!keyItem || !codeItem || !qrcodeItem) {
//       throw new Error(
//         "One or more items (key, code, qrcode) not found in 'front' layer."
//       );
//     }

//     // 텍스트 대치
//     keyItem.contents = person.key;
//     codeItem.contents = person.code;
//     qrcodeItem.contents = person.qrcode;

//     // 아웃라인 처리
//     keyItem.createOutline();
//     codeItem.createOutline();
//     qrcodeItem.createOutline();

//     // 저장 및 닫기
//     document.saveAs(new File(outlineFilePath));
//     document.close();

//     return outlineFilePath;
//   } catch (e) {
//     alert("Error: " + e.message);
//     if (document) document.close();
//     return null;
//   }
// }

// 변수 설정
var projectPath = arguments[0];

var person = {};
person.key = arguments[1];
person.code = arguments[2];
person.qrcodeImagePath = arguments[3]; // 다운로드한 이미지 경로

var templateFile = new File(projectPath + "/templates/template.ai");

createNamecard(person);

function createNamecard(person) {
  try {
    // dist 폴더 확인 및 생성
    var distFolderPath = projectPath + "/dist/";
    var distFolder = new Folder(distFolderPath);
    if (!distFolder.exists) {
      distFolder.create();
    }

    var filePath = distFolderPath + person.key + ".ai";

    // 템플릿 파일 확인
    if (!templateFile.exists) {
      throw new Error("Template file not found: " + templateFile.fsName);
    }

    // 템플릿 열기 및 저장
    var document = app.open(templateFile);
    document.saveAs(new File(filePath));

    // front 레이어 선택
    var frontLayer = document.layers.getByName("front");
    if (!frontLayer) {
      throw new Error("Layer 'front' not found in template.");
    }

    // key, code 항목 대치
    var keyItem = frontLayer.pageItems.getByName("key");
    var codeItem = frontLayer.pageItems.getByName("code");
    var qrcodeItem = frontLayer.pageItems.getByName("qrcode");

    if (!keyItem || !codeItem || !qrcodeItem) {
      throw new Error(
        "One or more items (key, code, qrcode) not found in 'front' layer."
      );
    }

    // 텍스트 대치
    keyItem.contents = person.key;
    codeItem.contents = person.code;

    // qrcode 항목의 위치와 크기 저장
    var qrcodePosition = qrcodeItem.position; // [x, y]
    var qrcodeWidth = qrcodeItem.width;
    var qrcodeHeight = qrcodeItem.height;

    // 기존 qrcode 항목 삭제
    qrcodeItem.remove();

    // 이미지 배치
    var qrcodeImageFile = new File(person.qrcodeImagePath);
    if (!qrcodeImageFile.exists) {
      throw new Error("QR code image not found: " + person.qrcodeImagePath);
    }

    var placedItem = frontLayer.placedItems.add();
    placedItem.file = qrcodeImageFile;
    placedItem.position = qrcodePosition; // 기존 qrcode 위치에 배치
    placedItem.width = qrcodeWidth; // 기존 qrcode 크기와 동일하게 설정
    placedItem.height = qrcodeHeight;

    // 아웃라인 처리 (텍스트 항목만)
    keyItem.createOutline();
    codeItem.createOutline();

    // 저장 및 닫기
    document.saveAs(new File(filePath));
    document.close();

    return filePath;
  } catch (e) {
    alert("Error: " + e.message);
    if (document) document.close();
    return null;
  }
}
