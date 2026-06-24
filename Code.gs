function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('স্কুল ডাটা ডিসপ্লে')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// গুগল শিট থেকে ডাটা নিয়ে আসার ফাংশন
function getStudentsData() {
  try {
    // ⚠️ নিচে আপনার গুগল শিটের সম্পূর্ণ লিংকটি বসিয়ে দিন
    const sheetUrl = "https://docs.google.com/spreadsheets/d/1khMELkp-jvEBeITncaaxpZ_0oCBXWSJEW6_9Dzw2-_c/edit"; 
    
    const ss = SpreadsheetApp.openByUrl(sheetUrl);
    const sheet = ss.getSheetByName('Students'); // শিটের নাম 'Students' হতে হবে
    const values = sheet.getDataRange().getValues();
    
    const headers = values[0];
    const data = [];
    
    // ডাটাগুলোকে অবজেক্ট আকারে সাজানো
    for (let i = 1; i < values.length; i++) {
      let row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[i][j];
      }
      data.push(row);
    }
    
    return { success: true, students: data };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
